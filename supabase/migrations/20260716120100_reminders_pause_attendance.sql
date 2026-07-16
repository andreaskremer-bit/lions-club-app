-- Go-live-Feinschliff (2026-07-16): In der ersten scharfen Phase gehen folgende
-- Benachrichtigungen an die Mitglieder:
--   - News            -> notify_news()      (sofort beim Veröffentlichen)
--   - Dokumente       -> notify_document()  (sofort beim Veröffentlichen)
--   - Geburtstage     -> enqueue_due_reminders() (Tageslauf)
--   - Termin-Reminder -> enqueue_due_reminders() (Tageslauf, Vorlauf je Termin)
--
-- BEWUSST PAUSIERT (nicht gelöscht): die Vorstands-Erinnerung 'attendance_due'
-- ("Anwesenheit erfassen"). Der Insert ist unten auskommentiert und lässt sich
-- durch erneutes Einkommentieren wieder aktivieren. Enum-Wert + Dedupe-Index
-- bleiben unverändert erhalten.
--
-- Empfänger-Gate (member.notifications_enabled) greift weiter (vgl. 20260618120100).

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

  -- 3) PAUSIERT (2026-07-16) — Vorstand: Anwesenheit erfassen. Bei Bedarf aktivieren:
  -- insert into public.notification (kind, recipient_id, event_id, for_date, title)
  -- select distinct 'attendance_due'::public.notification_kind, m.id, e.id, p_today,
  --        'Anwesenheit erfassen: ' || e.title
  -- from public.event e
  -- join public.member m on m.status = 'aktiv' and m.notifications_enabled
  -- join public.member_amt ma on ma.member_id = m.id
  -- join public.amt_permission ap on ap.amt_id = ma.amt_id
  --   and ap.permission = 'record_attendance'
  -- where e.donation_required and e.starts_at::date < p_today
  --   and e.starts_at::date >= p_today - 7
  --   and not exists (select 1 from public.attendance a where a.event_id = e.id)
  -- on conflict do nothing;
end;
$$;
