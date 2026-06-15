-- M5 — Tests für die Reminder-Engine (pgTAP). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

truncate auth.users, public.event cascade;

-- Fixtures relativ zu einem festen "heute" = 2026-09-15.
-- notifications_enabled=true: Empfänger-Gate freigeschaltet (Default ist false).
insert into public.member (email, first_name, last_name, status, birthday, notifications_enabled) values
  ('a@r.example',   'Anna',  'Aktiv',     'aktiv', '1980-09-15', true), -- Geburtstag heute
  ('b@r.example',   'Bert',  'Beispiel',  'aktiv', null,         true),
  ('sek@r.example', 'Sina',  'Sekretär',  'aktiv', null,         true),
  ('off@r.example', 'Olaf',  'Ohne',      'aktiv', null,         false); -- Gate aus

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'sek@r.example' and a.key = 'sekretaer'; -- record_attendance

insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-0000000a5001', 'Club-Abend in 3 Tagen', 'clubabend', timestamp '2026-09-18 19:00'),
  ('00000000-0000-0000-0000-0000000a5002', 'Club-Abend vor 2 Tagen', 'clubabend', timestamp '2026-09-13 19:00');

-- Bert hat zum künftigen Termin schon zugesagt -> kein Reminder für ihn.
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000a5001', m.id, 'zugesagt' from public.member m where m.email = 'b@r.example';

select public.enqueue_due_reminders(date '2026-09-15');

-- (1) Termin-Reminder an aktive Nicht-Rückmelder: Anna + Sina (Bert hat geantwortet).
select is(
  (select count(*)::int from public.notification where kind = 'event_reminder'),
  2, 'Termin-Reminder nur an Nicht-Rückmelder'
);

-- (2) Bert bekommt keinen Termin-Reminder.
select is(
  (select count(*)::int from public.notification n
   join public.member m on m.id = n.recipient_id
   where n.kind = 'event_reminder' and m.email = 'b@r.example'),
  0, 'Wer geantwortet hat, wird nicht erinnert'
);

-- (3) Geburtstag (Anna) -> eine Benachrichtigung je Mitglied (3).
select is(
  (select count(*)::int from public.notification where kind = 'birthday'),
  3, 'Geburtstag geht an alle Mitglieder'
);

-- (4) Anwesenheits-Erinnerung an Vorstand (Sina) für unerfassten spendenpflichtigen Termin.
select is(
  (select count(*)::int from public.notification n
   join public.member m on m.id = n.recipient_id
   where n.kind = 'attendance_due' and m.email = 'sek@r.example'),
  1, 'Vorstand wird an Anwesenheitserfassung erinnert'
);

-- (5) Mitglied ohne record_attendance bekommt keine Anwesenheits-Erinnerung.
select is(
  (select count(*)::int from public.notification where kind = 'attendance_due'),
  1, 'Anwesenheits-Erinnerung nur an Berechtigte'
);

-- (6) Empfänger-Gate: Olaf (notifications_enabled=false) ist aktiver Nicht-Rückmelder,
--     bekommt aber KEINEN Termin-Reminder.
select is(
  (select count(*)::int from public.notification n
   join public.member m on m.id = n.recipient_id
   where m.email = 'off@r.example'),
  0, 'Gate aus: nicht freigeschaltetes Mitglied bekommt nichts'
);

-- (7) Trotz des nicht freigeschalteten aktiven Mitglieds bleiben die Termin-Reminder bei 2.
select is(
  (select count(*)::int from public.notification where kind = 'event_reminder'),
  2, 'Gate filtert beim Erzeugen, nicht erst beim Versand'
);

-- (8) Idempotent: erneuter Lauf erzeugt keine Duplikate.
select public.enqueue_due_reminders(date '2026-09-15');
select is(
  (select count(*)::int from public.notification),
  6, 'Zweiter Lauf erzeugt keine Duplikate (2 + 3 + 1)'
);

select * from finish();
rollback;
