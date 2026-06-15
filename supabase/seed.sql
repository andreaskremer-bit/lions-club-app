-- Dev-Seed (nur lokal: läuft bei `supabase db reset`/`start`, NICHT bei `db push`).
-- Erzeugt Beispiel-Mitglieder + passende Auth-User, damit Verzeichnis, Ämter und
-- lokaler OTP-Login funktionieren. Keine echten Personendaten.

-- 1) Mitglieder (Partner exemplarisch bei einer Person)
insert into public.member
  (email, first_name, last_name, title, status, mobile, city, birthday, joined_on,
   partner_name, partner_birthday, partner_email, partner_mobile)
values
  ('webmaster@lions-bonn-rheinaue.de', 'Andreas',  'Kremer',    null,  'aktiv',         '+49 170 1112233', 'Bonn',     '1975-03-12', '2015-09-01', null, null, null, null),
  ('praesident@example.com',      'Friedrich','Vorsteher',  'Dr.', 'aktiv',         '+49 170 2223344', 'Bonn',     '1962-06-20', '1998-04-15', 'Elke Vorsteher', '1964-02-02', null, '+49 170 9998877'),
  ('sekretaer@example.com',       'Sabine',   'Schrift',    null,  'aktiv',         '+49 171 3334455', 'Bonn',     '1970-11-05', '2005-10-01', null, null, null, null),
  ('schatzmeister@example.com',   'Klaus',    'Kasse',      null,  'aktiv',         '+49 172 4445566', 'Königswinter', '1968-01-30', '2001-03-20', null, null, null, null),
  ('clubmaster@example.com',      'Petra',    'Reise',      null,  'aktiv',         '+49 173 5556677', 'Bad Honnef', '1972-08-14', '2010-05-11', null, null, null, null),
  ('maria.mitglied@example.com',  'Maria',    'Mitglied',   null,  'aktiv',         '+49 174 6667788', 'Bonn',     '1980-04-25', '2018-09-01', null, null, null, null),
  ('heinrich.ehren@example.com',  'Heinrich', 'Ehrenfels',  null,  'ehrenmitglied', '+49 175 7778899', 'Bonn',     '1945-12-01', '1980-01-10', null, null, null, null),
  ('inge.inaktiv@example.com',    'Inge',     'Ruhend',     null,  'inaktiv',       '+49 176 8889900', 'Köln',     '1958-07-19', '1995-06-05', null, null, null, null);

-- Empfänger-Gate: lokal alle Test-Mitglieder freischalten (in-App-Reminder sichtbar).
-- Auf dem Remote bleibt der Default false und nur einzelne werden manuell freigeschaltet.
update public.member set notifications_enabled = true;

-- 2) Auth-User (lokal). Member zuerst → Link-Trigger verknüpft per E-Mail.
-- Token-Spalten MÜSSEN '' sein (nicht NULL): GoTrue scannt sie in Go-Strings
-- und wirft sonst beim Login "converting NULL to string is unsupported" (HTTP 500).
insert into auth.users
  (instance_id, id, aud, role, email, email_confirmed_at, created_at, updated_at,
   confirmation_token, recovery_token, email_change, email_change_token_new,
   email_change_token_current, phone_change, phone_change_token, reauthentication_token)
select
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
  'authenticated', 'authenticated', m.email, now(), now(), now(),
  '', '', '', '', '', '', '', ''
from public.member m;

-- 3) Ämter zuweisen
insert into public.member_amt (member_id, amt_id)
select m.id, a.id
from public.member m
join (values
  ('webmaster@lions-bonn-rheinaue.de', 'webmaster'),
  ('praesident@example.com',      'praesident'),
  ('sekretaer@example.com',       'sekretaer'),
  ('schatzmeister@example.com',   'schatzmeister'),
  ('clubmaster@example.com',      'clubmaster'),
  ('heinrich.ehren@example.com',  'past_praesident')
) as map(email, amt_key) on map.email = m.email
join public.amt a on a.key = map.amt_key;

-- 4) Termine (vergangen + anstehend, verschiedene Typen). Feste IDs für Seed-Rückmeldungen.
insert into public.event (id, title, type, location, starts_at) values
  ('00000000-0000-0000-0000-0000000a1001', 'Jahresauftakt im Club',                       'clubabend',    'Hotel Königshof, Bonn',  now() - interval '21 days' + interval '19 hours'),
  ('00000000-0000-0000-0000-0000000a1002', 'Weihnachtsfeier',                              'gesellig',     'Restaurant Rheinblick',  now() - interval '40 days' + interval '18 hours'),
  ('00000000-0000-0000-0000-0000000a1003', 'Thalia Buchhandlung – gestern, heute, morgen', 'clubabend',    'Thalia Bonn',            now() + interval '5 days' + interval '19 hours'),
  ('00000000-0000-0000-0000-0000000a1004', 'Mitgliederversammlung Frühjahr',               'versammlung',  'Hotel Königshof, Bonn',  now() + interval '20 days' + interval '19 hours'),
  ('00000000-0000-0000-0000-0000000a1005', 'Club-Reise an die Mosel',                      'reise',        'Bernkastel-Kues',        now() + interval '42 days' + interval '9 hours'),
  ('00000000-0000-0000-0000-0000000a1006', 'Zonentreffen Distrikt',                        'lions_termin', 'Köln',                   now() + interval '15 days' + interval '18 hours');

-- 5) Rückmeldungen zum anstehenden Club-Abend (Thalia): 4 zugesagt, 2 abgesagt, Rest offen.
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000a1003', m.id, v.status::public.rsvp_status
from public.member m
join (values
  ('webmaster@lions-bonn-rheinaue.de', 'zugesagt'),
  ('praesident@example.com',      'zugesagt'),
  ('sekretaer@example.com',       'zugesagt'),
  ('heinrich.ehren@example.com',  'zugesagt'),
  ('schatzmeister@example.com',   'abgesagt'),
  ('clubmaster@example.com',      'abgesagt')
) as v(email, status) on v.email = m.email;

-- Begleitperson (Club-Abend erlaubt es): Partnerin des Präsidenten
insert into public.companion (event_response_id, name)
select r.id, 'Elke Vorsteher'
from public.event_response r
join public.member m on m.id = r.member_id
where r.event_id = '00000000-0000-0000-0000-0000000a1003' and m.email = 'praesident@example.com';

-- Finalisierte Rückmeldungen am vergangenen Jahresauftakt (für Vergangen-Ansicht)
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000a1001', m.id, v.status::public.rsvp_status
from public.member m
join (values
  ('webmaster@lions-bonn-rheinaue.de', 'zugesagt'),
  ('praesident@example.com',      'zugesagt'),
  ('maria.mitglied@example.com',  'zugesagt'),
  ('clubmaster@example.com',      'abgesagt')
) as v(email, status) on v.email = m.email;

-- 6) Erfasste Anwesenheit am vergangenen Club-Abend (Jahresauftakt, spendenpflichtig).
-- Aktive Abwesende: Kasse, Reise (clubmaster), Mitglied -> 3 Abwesenheiten im Lions-Jahr.
insert into public.attendance (event_id, member_id, present, recorded_by)
select '00000000-0000-0000-0000-0000000a1001', m.id, v.present,
       (select id from public.member where email = 'sekretaer@example.com')
from public.member m
join (values
  ('webmaster@lions-bonn-rheinaue.de', true),
  ('praesident@example.com',      true),
  ('sekretaer@example.com',       true),
  ('heinrich.ehren@example.com',  true),   -- Ehrenmitglied: anwesend, zählt nicht
  ('schatzmeister@example.com',   false),
  ('clubmaster@example.com',      false),
  ('maria.mitglied@example.com',  false),
  ('inge.inaktiv@example.com',    false)   -- inaktiv: zählt nicht
) as v(email, present) on v.email = m.email;

-- 7) Zusatzabfragen am anstehenden Club-Abend (Thalia) — Beispiel für die Abfrage-Engine.
insert into public.question (event_id, label, qtype, options, required, sort_order) values
  ('00000000-0000-0000-0000-0000000a1003', 'Menü-Wahl', 'single', '{Fleisch,Fisch,Vegetarisch}', true, 10),
  ('00000000-0000-0000-0000-0000000a1003', 'Allergien / Unverträglichkeiten', 'text', null, false, 20);

-- 8) Termin in genau 3 Tagen (Default-Vorlauf) — für M5-Reminder ohne Rückmeldungen.
insert into public.event (id, title, type, location, starts_at) values
  ('00000000-0000-0000-0000-0000000a1007', 'Vortrag: Stadtgeschichte Bonn', 'clubabend', 'Thalia Bonn', now()::date + interval '3 days' + interval '19 hours');

-- Fällige Reminder einmal erzeugen (lokaler Demo-Stand; in Produktion via pg_cron täglich).
select public.enqueue_due_reminders();

-- 9) Beispiel-Dokumente (M6). file_path zeigt auf (lokal nicht vorhandene) Dateien —
-- Liste/Sortierung/Suche/FTS sind damit testbar; echter Download braucht einen Upload.
-- content_text ist hier vorbefüllt (sonst käme er von der Edge Function extract-document-text).
insert into public.document
  (title, category, doc_date, description, event_id, file_name, mime_type, content_text)
values
  ('Protokoll Clubabend Mai 2026', 'protokoll_clubabend', date '2026-05-14',
   'Beschlüsse zum Sommerfest und Kassenbericht.',
   '00000000-0000-0000-0000-0000000a1003',
   'protokoll-2026-05.pdf', 'application/pdf',
   'Protokoll des Clubabends. Anwesend waren 18 Mitglieder. Beschlossen wurde das Sommerfest im Juli sowie der Kassenbericht des Schatzmeisters.'),
  ('Protokoll Mitgliederversammlung 2026', 'protokoll_mv', date '2026-03-20',
   'Wahl des Vorstands, Jahresbericht.', null,
   'mv-protokoll-2026.pdf', 'application/pdf',
   'Protokoll der Mitgliederversammlung. Tagesordnung: Jahresbericht des Präsidenten, Entlastung des Vorstands, Neuwahlen.'),
  ('Satzung Lions Club Bonn-Rheinaue', 'satzung', date '2020-01-01',
   'Gültige Vereinssatzung.', null,
   'satzung.pdf', 'application/pdf',
   'Satzung des Lions Club Bonn-Rheinaue. Zweck des Vereins ist die Foerderung gemeinnuetziger Zwecke und des buergerschaftlichen Engagements.');

-- 10) Beispiel-News (M6) — Zeilenumbrüche + URL (testet Pre-Wrap + Linkify).
insert into public.news_post (title, body, pinned, published_at) values
  ('Sommerfest am 12. Juli',
   E'Liebe Mitglieder,\n\nunser Sommerfest findet am 12. Juli im Clubhaus statt. Anmeldung über die Termine.\nInfos: https://lions-bonn-rheinaue.de',
   true, now() - interval '2 days'),
  ('Spendenübergabe Kinderhospiz',
   'Wir haben 5.000 Euro an das Kinderhospiz übergeben. Herzlichen Dank an alle Helferinnen und Helfer.',
   false, now() - interval '10 days');
