-- Code-Review 2026-10-04 (supabase/migrations): Korrekturen als neue Fassungen.

-- ── 1) Spaltenschutz bei Selbstpflege erweitern ─────────────────────────────
-- member_update_self erlaubt jedem Mitglied, die eigene Zeile zu schreiben; geschützt
-- waren nur Status, Konto, E-Mail und Mitgliedsnummer. Damit konnte ein Mitglied per
-- PATCH notifications_enabled abschalten (es gibt aber kein Voll-Opt-out) und die
-- Login-/Installations-Statistik (first/last_login_at, *_standalone_at,
-- last_browser_at) beliebig setzen. Diese Spalten pflegen nur Systemfunktionen:
-- sync_member_login (Trigger auf auth.users, ohne auth.uid()) und
-- track_display_mode, die ihren Schreibzugriff per Transaktions-Flag kennzeichnet.

create or replace function public.protect_member_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Kein eingeloggter Nutzer (System-Trigger/service_role), keine App-Anfrage (Rolle
  -- nicht `authenticated`, z. B. Admin per psql), berechtigtes Amt oder eine
  -- vertrauenswürdige Systemfunktion: Spaltenschutz greift nicht.
  if auth.uid() is null
     or coalesce(current_setting('role', true), 'none') <> 'authenticated'
     or public.has_permission('edit_member_master')
     or current_setting('app.member_system_write', true) = 'on' then
    return new;
  end if;
  if new.status   is distinct from old.status
     or new.user_id is distinct from old.user_id
     or new.lions_member_no is distinct from old.lions_member_no
     or lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, '')) then
    raise exception
      'Geschützte Felder (Status, E-Mail, Konto, Mitgliedsnummer) dürfen nur durch berechtigte Ämter geändert werden.';
  end if;
  if new.notifications_enabled is distinct from old.notifications_enabled
     or new.first_login_at is distinct from old.first_login_at
     or new.last_login_at is distinct from old.last_login_at
     or new.first_standalone_at is distinct from old.first_standalone_at
     or new.last_standalone_at is distinct from old.last_standalone_at
     or new.last_browser_at is distinct from old.last_browser_at then
    raise exception 'Systemfelder (Benachrichtigungs-Freigabe, Login- und Nutzungsdaten) sind nicht änderbar.';
  end if;
  return new;
end;
$$;

create or replace function public.track_display_mode(standalone boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	mid uuid := public.current_member_id();
begin
	-- Konto ohne verknüpfte member-Zeile: still aussteigen, kein Fehler.
	-- Der Aufruf ist reine Telemetrie und darf den App-Start nie stören.
	if mid is null then
		return;
	end if;

	-- Kennzeichnet den Schreibzugriff für protect_member_columns (nur diese Transaktion).
	perform set_config('app.member_system_write', 'on', true);

	if standalone then
		update public.member
		   set first_standalone_at = coalesce(first_standalone_at, now()),
		       last_standalone_at = now()
		 where id = mid;
	else
		update public.member
		   set last_browser_at = now()
		 where id = mid;
	end if;

	perform set_config('app.member_system_write', 'off', true);
end;
$$;

-- ── 2) Termin-Reminder nach Berliner Datum ──────────────────────────────────
-- starts_at::date und current_date folgten der Sitzungs-Zeitzone (unter pg_cron UTC).
-- Ein Termin um 00:30 Berliner Zeit lag damit auf dem Vortag, die Erinnerung kam einen
-- Tag zu früh. Gleiche Fehlerklasse wie current_lions_year() (20261004120300).
-- Inhalt sonst unverändert gegenüber 20260716120100 (Anwesenheits-Reminder pausiert).

create or replace function public.enqueue_due_reminders(
  p_today date default (now() at time zone 'Europe/Berlin')::date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1) Termin-Reminder an aktive Nicht-Rückmelder (Vorlauf je Termin).
  insert into public.notification (kind, recipient_id, event_id, for_date, title, body)
  select 'event_reminder'::public.notification_kind, m.id, e.id, p_today,
         'Rückmeldung fehlt: ' || e.title,
         'Bitte sage zu oder ab.'
  from public.event e
  join public.member m on m.status = 'aktiv' and m.notifications_enabled
  where ((e.starts_at at time zone 'Europe/Berlin')::date - p_today) = e.reminder_days_before
    and not exists (
      select 1 from public.event_response r where r.event_id = e.id and r.member_id = m.id
    )
  on conflict do nothing;

  -- 2) Geburtstags-Reminder an alle freigeschalteten Mitglieder (Mitglieds-Geburtstage).
  insert into public.notification (kind, recipient_id, subject_member_id, for_date, title)
  select 'birthday'::public.notification_kind, r.id, b.id, p_today,
         'Geburtstag: ' || coalesce(b.title || ' ', '') || b.first_name || ' ' || b.last_name
  from public.member b
  join public.member r on r.notifications_enabled
  where b.birthday is not null
    and extract(month from b.birthday) = extract(month from p_today)
    and extract(day from b.birthday) = extract(day from p_today)
  on conflict do nothing;

  -- 3) Anwesenheits-Reminder bleibt pausiert (siehe 20260716120100).
end;
$$;

-- Rechte wie gehabt (20261004120100): nur Cron (postgres) und service_role.
revoke execute on function public.enqueue_due_reminders(date) from public, anon, authenticated;
grant execute on function public.enqueue_due_reminders(date) to service_role;

-- ── 3) Outbox-Reservierung: Zeilen direkt zurückgeben, Gate prüfen, Invoker ──
-- Bisher lieferte claim_notifications nur IDs; die Function lud die Zeilen danach mit
-- bis zu 200 IDs in der URL nach (~8 KB, riskant für Gateway-Grenzen; scheiterte das,
-- blieb die Reservierung 10 Minuten hängen). Jetzt kommen die Zeilen samt Empfänger-
-- daten in einem Schritt zurück. Zusätzlich gilt das Empfänger-Gate auch beim Versand
-- (aktiv + notifications_enabled), und die Funktion läuft als Aufrufer (service_role
-- umgeht RLS ohnehin) statt mit postgres-Rechten.

drop function public.claim_notifications(integer);

create function public.claim_notifications(p_limit integer default 100)
returns table (
  id uuid,
  kind public.notification_kind,
  recipient_id uuid,
  event_id uuid,
  document_id uuid,
  news_post_id uuid,
  title text,
  body text,
  attempts integer,
  email text,
  notification_channel text
)
language sql
security invoker
set search_path = public
as $$
  with claimed as (
    update public.notification n
       set claimed_at = now()
     where n.id in (
       select x.id
         from public.notification x
         join public.member m on m.id = x.recipient_id
        where x.sent_at is null
          and x.attempts < 5
          and m.status = 'aktiv'
          and m.notifications_enabled
          and (x.claimed_at is null or x.claimed_at < now() - interval '10 minutes')
          and (x.last_attempt_at is null or x.last_attempt_at < now() - x.attempts * interval '1 hour')
        order by x.created_at
        limit p_limit
        for update of x skip locked
     )
    returning n.*
  )
  select c.id, c.kind, c.recipient_id, c.event_id, c.document_id, c.news_post_id,
         c.title, c.body, c.attempts, m.email, m.notification_channel::text
    from claimed c
    join public.member m on m.id = c.recipient_id
   order by c.created_at;
$$;

revoke execute on function public.claim_notifications(integer) from public, anon, authenticated;
grant execute on function public.claim_notifications(integer) to service_role;
