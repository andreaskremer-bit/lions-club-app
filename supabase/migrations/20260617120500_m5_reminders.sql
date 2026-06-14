-- M5 — Reminder-Engine + Benachrichtigungen.
-- Outbox-Tabelle `notification` (pro Empfänger eine Zeile). Eine SQL-Funktion
-- erzeugt fällige Reminder; der tatsächliche Push-/E-Mail-Versand liest die Outbox
-- (Go-live: Edge Function). In-App werden die Zeilen direkt angezeigt.

-- Vorlauf je Termin überschreibbar (Spec §4.4), Default 3 Tage.
alter table public.event add column reminder_days_before int not null default 3;

create type public.notification_kind as enum ('event_reminder', 'birthday', 'attendance_due');

create table public.notification (
  id                uuid primary key default gen_random_uuid(),
  kind              public.notification_kind not null,
  recipient_id      uuid not null references public.member (id) on delete cascade,
  event_id          uuid references public.event (id) on delete cascade,
  subject_member_id uuid references public.member (id) on delete cascade, -- z. B. Geburtstagskind
  for_date          date not null,
  title             text not null,
  body              text,
  created_at        timestamptz not null default now(),
  read_at           timestamptz,
  sent_at           timestamptz -- gesetzt, wenn per Push/E-Mail zugestellt
);
create index notification_recipient_idx on public.notification (recipient_id, created_at desc);

-- Dedupe: gleiche Erinnerung nicht doppelt am selben Tag.
create unique index notification_dedupe on public.notification (
  kind,
  recipient_id,
  coalesce(event_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(subject_member_id, '00000000-0000-0000-0000-000000000000'::uuid),
  for_date
);

-- Web-Push-Abos je Mitglied (Versand selbst erfolgt serverseitig, Go-live).
create table public.push_subscription (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.member (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

alter table public.notification enable row level security;
alter table public.push_subscription enable row level security;

-- Benachrichtigungen: nur eigene sehen/als gelesen markieren. Erzeugt werden sie
-- ausschließlich über die Funktion unten (SECURITY DEFINER) bzw. den Service.
create policy notification_select_own
  on public.notification for select to authenticated
  using (recipient_id = public.current_member_id());
create policy notification_update_own
  on public.notification for update to authenticated
  using (recipient_id = public.current_member_id())
  with check (recipient_id = public.current_member_id());
grant select, update on public.notification to authenticated;

create policy push_subscription_own
  on public.push_subscription for all to authenticated
  using (member_id = public.current_member_id())
  with check (member_id = public.current_member_id());
grant select, insert, update, delete on public.push_subscription to authenticated;

-- Fällige Reminder erzeugen (idempotent dank Dedupe-Index). Default: heute.
create or replace function public.enqueue_due_reminders(p_today date default current_date)
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
  join public.member m on m.status = 'aktiv'
  where (e.starts_at::date - p_today) = e.reminder_days_before
    and not exists (
      select 1 from public.event_response r where r.event_id = e.id and r.member_id = m.id
    )
  on conflict do nothing;

  -- 2) Geburtstags-Reminder an alle Mitglieder (Mitglieds-Geburtstage).
  insert into public.notification (kind, recipient_id, subject_member_id, for_date, title)
  select 'birthday'::public.notification_kind, r.id, b.id, p_today,
         'Geburtstag: ' || coalesce(b.title || ' ', '') || b.first_name || ' ' || b.last_name
  from public.member b
  join public.member r on true
  where b.birthday is not null
    and extract(month from b.birthday) = extract(month from p_today)
    and extract(day from b.birthday) = extract(day from p_today)
  on conflict do nothing;

  -- 3) Vorstand-Erinnerung: spendenpflichtiger Termin vorbei (<=7 Tage), noch nicht erfasst.
  insert into public.notification (kind, recipient_id, event_id, for_date, title)
  select distinct 'attendance_due'::public.notification_kind, m.id, e.id, p_today, 'Anwesenheit erfassen: ' || e.title
  from public.event e
  join public.member m on m.status = 'aktiv'
  join public.member_amt ma on ma.member_id = m.id
  join public.amt_permission ap on ap.amt_id = ma.amt_id and ap.permission = 'record_attendance'
  where e.donation_required
    and e.starts_at::date < p_today
    and e.starts_at::date >= p_today - 7
    and not exists (select 1 from public.attendance a where a.event_id = e.id)
  on conflict do nothing;
end;
$$;

-- Täglicher Lauf, falls pg_cron vorhanden (auf Supabase aktivierbar). Lokal i. d. R.
-- nicht aktiv — die Funktion ist unabhängig aufruf-/testbar.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('reminders-daily', '0 7 * * *',
      $cron$ select public.enqueue_due_reminders(); $cron$);
  end if;
end $$;
