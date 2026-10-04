-- Code-Review 2026-10-04 (supabase/functions): Versandzustand für die Outbox.
--
-- Bisher las send-notifications einfach die ältesten 500 Zeilen mit sent_at is null.
-- Zwei Probleme:
--   1) Eine Zeile, die nie zugestellt werden kann (kein Kanal erreichbar, SMTP-Fehler),
--      blieb für immer offen und wurde alle 15 Minuten erneut gelesen. Ab 500 solcher
--      Zeilen hätten sie jede neue Benachrichtigung verdrängt.
--   2) Zwei gleichzeitige Läufe (Cron + Admin-Route, oder ein langer Lauf über den
--      nächsten Cron-Tick) hätten dieselben Zeilen doppelt verschickt.
--
-- Jetzt: Zeilen werden atomar reserviert (claimed_at, FOR UPDATE SKIP LOCKED), jeder
-- erfolglose Versuch zählt attempts hoch, mit wachsender Wartezeit (attempts Stunden).
-- Nach 5 Versuchen gibt die Outbox auf – die In-App-Benachrichtigung bleibt sichtbar.

alter table public.notification
  add column attempts        integer not null default 0,
  add column last_attempt_at timestamptz,
  add column claimed_at      timestamptz;

comment on column public.notification.attempts is
  'Erfolglose Zustellversuche (Push/E-Mail). Ab 5 kein weiterer Versuch.';
comment on column public.notification.claimed_at is
  'Reserviert durch einen laufenden Versand; nach 10 Minuten verfällt die Reservierung.';

create index notification_outbox_idx on public.notification (created_at) where sent_at is null;

create or replace function public.claim_notifications(p_limit integer default 200)
returns setof uuid
language sql
security definer
set search_path = public
as $$
  update public.notification n
     set claimed_at = now()
   where n.id in (
     select id
       from public.notification
      where sent_at is null
        and attempts < 5
        and (claimed_at is null or claimed_at < now() - interval '10 minutes')
        and (last_attempt_at is null or last_attempt_at < now() - attempts * interval '1 hour')
      order by created_at
      limit p_limit
      for update skip locked
   )
  returning n.id;
$$;

-- Nur die Edge Function (service_role) reserviert.
revoke execute on function public.claim_notifications(integer) from public, anon, authenticated;
grant execute on function public.claim_notifications(integer) to service_role;
