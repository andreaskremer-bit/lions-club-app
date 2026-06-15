-- M5 — Empfänger-Gate für Benachrichtigungen + Versand-Auslösung (Go-live).
--
-- Sicherung für die "Geheim-Phase": Reminder werden NUR für freigeschaltete
-- Mitglieder ERZEUGT. Damit entstehen für nicht freigeschaltete Mitglieder weder
-- In-App-Einträge (die nach einem Login aufpoppen würden) noch Push/E-Mail.
-- Default ist bewusst `false` (fail-safe): ein frisch angelegtes Mitglied bekommt
-- garantiert nichts, bis es ausdrücklich freigeschaltet wird.
--
-- GO-LIVE: `update public.member set notifications_enabled = true where status = 'aktiv';`
-- (oder den Default per Folge-Migration auf `true` ziehen).

alter table public.member
  add column notifications_enabled boolean not null default false;

comment on column public.member.notifications_enabled is
  'Empfänger-Gate: erhält dieses Mitglied Benachrichtigungen (In-App/Push/E-Mail)? '
  'Default false (Geheim-Phase). Go-live: für aktive Mitglieder auf true setzen.';

-- enqueue_due_reminders neu: identisch zur Erstfassung (20260617120500), aber jeder
-- der drei Inserts respektiert das Empfänger-Gate des jeweiligen Empfängers.
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
  join public.member m on m.status = 'aktiv' and m.notifications_enabled
  where (e.starts_at::date - p_today) = e.reminder_days_before
    and not exists (
      select 1 from public.event_response r where r.event_id = e.id and r.member_id = m.id
    )
  on conflict do nothing;

  -- 2) Geburtstags-Reminder an alle freigeschalteten Mitglieder.
  insert into public.notification (kind, recipient_id, subject_member_id, for_date, title)
  select 'birthday'::public.notification_kind, r.id, b.id, p_today,
         'Geburtstag: ' || coalesce(b.title || ' ', '') || b.first_name || ' ' || b.last_name
  from public.member b
  join public.member r on r.notifications_enabled
  where b.birthday is not null
    and extract(month from b.birthday) = extract(month from p_today)
    and extract(day from b.birthday) = extract(day from p_today)
  on conflict do nothing;

  -- 3) Vorstand-Erinnerung: spendenpflichtiger Termin vorbei (<=7 Tage), noch nicht erfasst.
  insert into public.notification (kind, recipient_id, event_id, for_date, title)
  select distinct 'attendance_due'::public.notification_kind, m.id, e.id, p_today, 'Anwesenheit erfassen: ' || e.title
  from public.event e
  join public.member m on m.status = 'aktiv' and m.notifications_enabled
  join public.member_amt ma on ma.member_id = m.id
  join public.amt_permission ap on ap.amt_id = ma.amt_id and ap.permission = 'record_attendance'
  where e.donation_required
    and e.starts_at::date < p_today
    and e.starts_at::date >= p_today - 7
    and not exists (select 1 from public.attendance a where a.event_id = e.id)
  on conflict do nothing;
end;
$$;

-- Versand-Auslösung (Go-live, inert bis konfiguriert): Falls pg_cron UND pg_net
-- vorhanden sind UND die Edge-Function-URL/Token als DB-Settings hinterlegt wurden,
-- ruft ein zweiter Tages-Job die Edge Function `send-notifications` auf. Ohne diese
-- Settings wird KEIN Versand-Job angelegt -> kein versehentlicher Versand.
--
-- GO-LIVE (einmalig im Dashboard/SQL):
--   alter database postgres set app.edge_send_url   = 'https://<ref>.functions.supabase.co/send-notifications';
--   alter database postgres set app.edge_send_token = '<service_role_key>';
--   -- danach pg_cron + pg_net Extensions aktivieren (legt Jobs beim nächsten Migrate an)
do $$
declare
  v_url   text := current_setting('app.edge_send_url', true);
  v_token text := current_setting('app.edge_send_token', true);
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net')
     and coalesce(v_url, '') <> '' and coalesce(v_token, '') <> '' then
    perform cron.schedule('send-notifications-daily', '5 7 * * *', format(
      $cron$ select net.http_post(
        url     := %L,
        headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || %L),
        body    := '{}'::jsonb
      ); $cron$, v_url, v_token));
  end if;
end $$;
