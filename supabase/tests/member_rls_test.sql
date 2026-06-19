-- M1 — RLS-Tests (pgTAP). Lauf: `npx supabase test db`.
-- Prüft die Policies aus Sicht verschiedener Rollen + Auth-Link-Trigger + Spaltenschutz.

begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

-- Saubere Ausgangslage unabhängig vom Dev-Seed (wird durch rollback wiederhergestellt).
-- auth.users cascaded auf member → member_amt/event_response/companion.
truncate auth.users, public.event cascade;

-- ── Fixtures (als Superuser, RLS wird umgangen) ─────────────────────────────
-- Member zuerst, dann auth.users → der Link-Trigger verbindet sie per E-Mail.
insert into public.member (email, first_name, last_name) values
  ('mitglied@example.com',  'Max',  'Mustermann'),
  ('sekretaer@example.com', 'Sina', 'Sekretär'),
  ('webmaster@example.com', 'Willi','Webmaster');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'mitglied@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'sekretaer@example.com'),
  ('00000000-0000-0000-0000-000000000003', 'webmaster@example.com');

-- Ämter zuweisen
insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'sekretaer@example.com' and a.key = 'sekretaer';
insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'webmaster@example.com' and a.key = 'webmaster';

-- (1) Link-Trigger hat user_id gesetzt
select is(
  (select user_id from public.member where email = 'mitglied@example.com'),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Auth-Link-Trigger verknüpft member.user_id per E-Mail'
);

-- ── Rolle: Mitglied ohne Amt ────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- (2) sieht das gesamte Verzeichnis
select is(
  (select count(*)::int from public.member),
  3, 'Mitglied sieht das gesamte Verzeichnis'
);

-- (3) darf eigene Stammdaten pflegen
update public.member set city = 'Bonn'
  where user_id = '00000000-0000-0000-0000-000000000001'::uuid;
select is(
  (select city from public.member where user_id = '00000000-0000-0000-0000-000000000001'::uuid),
  'Bonn', 'Mitglied kann eigene Stammdaten pflegen'
);

-- (4) darf eigenen Status NICHT ändern (Spaltenschutz)
select throws_ok(
  $$ update public.member set status = 'inaktiv'
     where user_id = '00000000-0000-0000-0000-000000000001'::uuid $$,
  'P0001', null,
  'Mitglied kann eigenen Status NICHT ändern (Spaltenschutz)'
);

-- (4b) darf eigene Mitgliedsnummer NICHT ändern (Spaltenschutz)
select throws_ok(
  $$ update public.member set lions_member_no = '9999999'
     where user_id = '00000000-0000-0000-0000-000000000001'::uuid $$,
  'P0001', null,
  'Mitglied kann eigene Mitgliedsnummer NICHT ändern (Spaltenschutz)'
);

-- (5) kann fremde Stammdaten NICHT ändern (0 Zeilen, bleibt unverändert)
update public.member set city = 'Hamburg' where email = 'webmaster@example.com';
select is(
  (select city from public.member where email = 'webmaster@example.com'),
  null, 'Mitglied kann fremde Stammdaten NICHT ändern'
);

-- (6) kann KEIN Neumitglied anlegen
select throws_ok(
  $$ insert into public.member (email, first_name, last_name)
     values ('neu@example.com', 'N', 'N') $$,
  '42501', null,
  'Mitglied kann KEIN Neumitglied anlegen'
);

-- (7) kann fremde Zeile NICHT löschen (bleibt bestehen)
delete from public.member where email = 'webmaster@example.com';
select is(
  (select count(*)::int from public.member where email = 'webmaster@example.com'),
  1, 'Mitglied kann fremde Zeile NICHT löschen'
);

-- (8) hat ohne Amt kein manage_members
select is(public.has_permission('manage_members'), false,
  'Mitglied ohne Amt hat kein manage_members');

-- (9) kann sich KEIN Amt zuweisen
select throws_ok(
  $$ insert into public.member_amt (member_id, amt_id)
     values ('00000000-0000-0000-0000-000000000001'::uuid,
             (select id from public.amt where key = 'praesident')) $$,
  '42501', null,
  'Mitglied kann sich KEIN Amt zuweisen'
);

-- ── Rolle: Sekretär (edit_member_master, manage_members) ────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}';

-- (10) darf fremde Stammdaten pflegen
update public.member set city = 'Köln' where email = 'mitglied@example.com';
select is(
  (select city from public.member where email = 'mitglied@example.com'),
  'Köln', 'Sekretär kann fremde Stammdaten pflegen'
);

-- (11) darf fremden Status ändern
update public.member set status = 'inaktiv' where email = 'mitglied@example.com';
select is(
  (select status::text from public.member where email = 'mitglied@example.com'),
  'inaktiv', 'Sekretär darf fremden Status ändern'
);

-- (12) darf Neumitglied anlegen
select lives_ok(
  $$ insert into public.member (email, first_name, last_name)
     values ('neu2@example.com', 'Neu', 'Mitglied') $$,
  'Sekretär darf Neumitglied anlegen'
);

-- (13) hat edit_member_master
select is(public.has_permission('edit_member_master'), true,
  'Sekretär hat edit_member_master');

-- (13b) darf fremde Mitgliedsnummer setzen
update public.member set lions_member_no = '1234567' where email = 'mitglied@example.com';
select is(
  (select lions_member_no from public.member where email = 'mitglied@example.com'),
  '1234567', 'Sekretär darf fremde Mitgliedsnummer setzen'
);

-- ── Rolle: Webmaster (manage_roles, delete_member) ──────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}';

-- (14) hat manage_roles
select is(public.has_permission('manage_roles'), true,
  'Webmaster hat manage_roles');

-- (15) darf Ämter zuweisen
select lives_ok(
  $$ insert into public.member_amt (member_id, amt_id)
     select m.id, a.id from public.member m, public.amt a
     where m.email = 'mitglied@example.com' and a.key = 'clubmaster' $$,
  'Webmaster darf Ämter zuweisen'
);

-- (16) darf Mitglied löschen
delete from public.member where email = 'neu2@example.com';
select is(
  (select count(*)::int from public.member where email = 'neu2@example.com'),
  0, 'Webmaster darf Mitglied löschen'
);

-- ── Rolle: anon (nicht eingeloggt) ──────────────────────────────────────────
reset role;
set local role anon;

-- (17) anon hat keinen Zugriff
select throws_ok(
  $$ select count(*) from public.member $$,
  '42501', null,
  'anon hat keinen Zugriff auf Mitgliederdaten'
);

reset role;
select * from finish();
rollback;
