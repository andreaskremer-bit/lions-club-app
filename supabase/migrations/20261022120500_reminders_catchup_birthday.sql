-- Reminder-Korrekturen aus dem Rollen-Durchgang 2026-10-22 (B5, B7).
--
-- B7) Termin-Reminder verlangte den EXAKTEN Stichtag (Beginn − reminder_days_before).
-- Ein Termin, der kurzfristiger angelegt oder verschoben wurde (oder am Stichtag nach
-- 09:00 entstand), bekam nie eine Erinnerung. Jetzt: am ersten Tageslauf innerhalb des
-- Vorlaufs, sofern der Termin noch nicht begonnen hat – und höchstens einmal je
-- Termin und Mitglied (auch über verschiedene Tage hinweg).
-- B5) Geburtstag: Das Geburtstagskind bekam eine Benachrichtigung über sich selbst.

create or replace function public.enqueue_due_reminders(
  p_today date default (now() at time zone 'Europe/Berlin')::date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Lauf für heute: jetzt. Lauf für einen anderen Tag (Tests, Nachholen): dessen 09:00
  -- in Berlin, also der Zeitpunkt, zu dem der reguläre Tageslauf läuft.
  v_at timestamptz := case
    when p_today = (now() at time zone 'Europe/Berlin')::date then now()
    else (p_today + time '09:00') at time zone 'Europe/Berlin'
  end;
begin
  -- 1) Termin-Reminder an aktive Nicht-Rückmelder (Vorlauf je Termin, einmalig).
  insert into public.notification (kind, recipient_id, event_id, for_date, title, body)
  select 'event_reminder'::public.notification_kind, m.id, e.id, p_today,
         'Rückmeldung fehlt: ' || e.title,
         'Bitte sage zu oder ab.'
  from public.event e
  join public.member m on m.status = 'aktiv' and m.notifications_enabled
  where ((e.starts_at at time zone 'Europe/Berlin')::date - p_today)
          between 0 and e.reminder_days_before
    and e.starts_at > v_at
    and not exists (
      select 1 from public.event_response r where r.event_id = e.id and r.member_id = m.id
    )
    and not exists (
      select 1 from public.notification n
      where n.kind = 'event_reminder' and n.event_id = e.id and n.recipient_id = m.id
    )
  on conflict do nothing;

  -- 2) Geburtstags-Reminder an alle freigeschalteten Mitglieder außer dem Geburtstagskind.
  insert into public.notification (kind, recipient_id, subject_member_id, for_date, title)
  select 'birthday'::public.notification_kind, r.id, b.id, p_today,
         'Geburtstag: ' || coalesce(b.title || ' ', '') || b.first_name || ' ' || b.last_name
  from public.member b
  join public.member r on r.notifications_enabled and r.id <> b.id
  where b.birthday is not null
    and extract(month from b.birthday) = extract(month from p_today)
    and extract(day from b.birthday) = extract(day from p_today)
  on conflict do nothing;

  -- 3) Anwesenheits-Reminder bleibt pausiert (siehe 20260716120100).
end;
$$;

revoke execute on function public.enqueue_due_reminders(date) from public, anon, authenticated;
grant execute on function public.enqueue_due_reminders(date) to service_role;
