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
