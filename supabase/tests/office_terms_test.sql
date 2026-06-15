-- P2 — Zeitabhängige Ämter-Rechte, Past-Präsident-Ableitung, Vereinslokal (pgTAP).

begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

truncate auth.users, public.member cascade;

insert into public.member (email, first_name, last_name) values
  ('cur@ot.example', 'Cara', 'Current'),
  ('next@ot.example', 'Nina', 'Next'),
  ('prev@ot.example', 'Paul', 'Prev'),
  ('pp@ot.example', 'Petra', 'Pastpraes'),
  ('pr@ot.example', 'Resi', 'Presse'),
  ('roles@ot.example', 'Rolf', 'Roles');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f0001', 'cur@ot.example'),
  ('00000000-0000-0000-0000-0000000f0002', 'next@ot.example'),
  ('00000000-0000-0000-0000-0000000f0003', 'prev@ot.example'),
  ('00000000-0000-0000-0000-0000000f0005', 'pr@ot.example'),
  ('00000000-0000-0000-0000-0000000f0006', 'roles@ot.example');

-- Zuordnungen relativ zum aktuellen Lions-Jahr (0=aktuell, 1=kommend, -1=vorig).
-- clubmaster=manage_events, presse=display_only, webmaster=manage_roles.
insert into public.member_amt (member_id, amt_id, lions_year)
select m.id, a.id, public.current_lions_year() + v.off
from public.member m
join (values
  ('cur@ot.example', 'clubmaster', 0),
  ('next@ot.example', 'clubmaster', 1),
  ('prev@ot.example', 'clubmaster', -1),
  ('pp@ot.example', 'praesident', -1),
  ('pr@ot.example', 'presse', 0),
  ('roles@ot.example', 'webmaster', 0)
) as v(email, amt_key, off) on v.email = m.email
join public.amt a on a.key = v.amt_key;

set local role authenticated;

-- (1) Recht im AKTUELLEN Lions-Jahr aktiv.
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000f0001","role":"authenticated"}';
select is(public.has_permission('manage_events'), true, 'Recht im aktuellen Lions-Jahr aktiv');

-- (2) Nur KOMMENDES Lions-Jahr -> noch kein Recht.
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000f0002","role":"authenticated"}';
select is(public.has_permission('manage_events'), false, 'Kommendes Lions-Jahr gibt noch kein Recht');

-- (3) Nur VORIGES Lions-Jahr -> Recht abgelaufen.
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000f0003","role":"authenticated"}';
select is(public.has_permission('manage_events'), false, 'Voriges Lions-Jahr gibt kein Recht mehr');

-- (4) display_only-Beauftragter (Presse) hat keine Rechte.
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000f0005","role":"authenticated"}';
select is(public.has_permission('publish_content'), false, 'display_only-Beauftragter hat keine Rechte');

-- (5) Past-Präsident abgeleitet = Präsident des Vorjahres.
reset role;
select is(
  public.past_praesident_member_id(),
  (select id from public.member where email = 'pp@ot.example'),
  'Past-Präsident = Präsident des vorigen Lions-Jahres'
);

update public.club_venue set name = 'Start' where id = 1;

-- (6) club_venue ohne manage_roles nicht änderbar (RLS).
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000f0001","role":"authenticated"}';
update public.club_venue set name = 'Gekapert' where id = 1;
select is((select name from public.club_venue where id = 1), 'Start',
  'Vereinslokal nur mit manage_roles änderbar');

-- (7) club_venue mit manage_roles (Webmaster) änderbar.
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000f0006","role":"authenticated"}';
update public.club_venue set name = 'Neues Lokal' where id = 1;
select is((select name from public.club_venue where id = 1), 'Neues Lokal',
  'manage_roles darf Vereinslokal ändern');

select * from finish();
rollback;
