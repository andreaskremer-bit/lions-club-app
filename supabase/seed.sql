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
