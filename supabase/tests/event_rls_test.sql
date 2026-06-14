-- M2 — RLS-Tests für Termine/Rückmeldungen (pgTAP). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

-- Saubere Ausgangslage unabhängig vom Dev-Seed (wird durch rollback wiederhergestellt).
-- auth.users cascaded auf member → member_amt/event_response/companion.
truncate auth.users, public.event cascade;

-- ── Fixtures (Superuser) ────────────────────────────────────────────────────
insert into public.member (email, first_name, last_name) values
  ('a@ev.example',        'Anna',  'Aktiv'),
  ('b@ev.example',        'Bert',  'Beispiel'),
  ('vorstand@ev.example', 'Vera',  'Vorstand');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'a@ev.example'),
  ('00000000-0000-0000-0000-0000000000b2', 'b@ev.example'),
  ('00000000-0000-0000-0000-0000000000c3', 'vorstand@ev.example');

-- Vorstand bekommt manage_events (über Clubmaster)
insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'vorstand@ev.example' and a.key = 'clubmaster';

-- Termine: zukünftig + vergangen (clubabend) sowie zukünftige Versammlung
insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-0000000ce001', 'Club-Abend künftig', 'clubabend',   now() + interval '7 days'),
  ('00000000-0000-0000-0000-0000000ce002', 'Club-Abend vergangen','clubabend',   now() - interval '7 days'),
  ('00000000-0000-0000-0000-0000000fe003', 'Versammlung künftig', 'versammlung', now() + interval '7 days');

-- Vorab-Rückmeldungen (Superuser, umgeht RLS): a hat zu vergangenem CA + künftiger Versammlung zugesagt
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000ce002', m.id, 'zugesagt' from public.member m where m.email = 'a@ev.example';
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000fe003', m.id, 'zugesagt' from public.member m where m.email = 'a@ev.example';

-- ── Rolle: Mitglied Anna ─────────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

-- (1) eigene Zusage zu künftigem Termin
select lives_ok(
  $$ insert into public.event_response (event_id, member_id, status)
     values ('00000000-0000-0000-0000-0000000ce001', public.current_member_id(), 'zugesagt') $$,
  'Mitglied kann sich für künftigen Termin anmelden'
);

-- (2) keine Rückmeldung im fremden Namen
select throws_ok(
  $$ insert into public.event_response (event_id, member_id, status)
     values ('00000000-0000-0000-0000-0000000ce001',
             (select id from public.member where email = 'b@ev.example'), 'zugesagt') $$,
  '42501', null, 'Mitglied kann nicht für andere antworten'
);

-- (3) keine Anmeldung zu vergangenem Termin (für noch offenen Termin)
select throws_ok(
  $$ insert into public.event_response (event_id, member_id, status)
     values ('00000000-0000-0000-0000-0000000ce002', public.current_member_id(), 'abgesagt') $$,
  '42501', null, 'Anmeldung zu vergangenem Termin gesperrt'
);

-- (4) eigene Rückmeldung am künftigen Termin ändern
update public.event_response set status = 'abgesagt'
  where event_id = '00000000-0000-0000-0000-0000000ce001' and member_id = public.current_member_id();
select is(
  (select status::text from public.event_response
   where event_id = '00000000-0000-0000-0000-0000000ce001' and member_id = public.current_member_id()),
  'abgesagt', 'Mitglied kann eigene Rückmeldung ändern'
);

-- (5) Rückmeldung an vergangenem Termin NICHT änderbar (bleibt zugesagt)
update public.event_response set status = 'abgesagt'
  where event_id = '00000000-0000-0000-0000-0000000ce002' and member_id = public.current_member_id();
select is(
  (select status::text from public.event_response
   where event_id = '00000000-0000-0000-0000-0000000ce002' and member_id = public.current_member_id()),
  'zugesagt', 'Rückmeldung an vergangenem Termin ist gesperrt'
);

-- (6) sieht alle Rückmeldungen (für Zähler/Meldungen)
select is(
  (select count(*)::int from public.event_response),
  3, 'Mitglied sieht alle Rückmeldungen'
);

-- (7) Begleitperson zu eigener Zusage an Club-Abend (Begleitperson erlaubt)
select lives_ok(
  $$ insert into public.companion (event_response_id, name)
     select r.id, 'Partner Anna' from public.event_response r
     where r.event_id = '00000000-0000-0000-0000-0000000ce001' and r.member_id = public.current_member_id() $$,
  'Begleitperson bei Club-Abend erlaubt'
);

-- (8) keine Begleitperson bei Versammlung (Typ verbietet es)
select throws_ok(
  $$ insert into public.companion (event_response_id, name)
     select r.id, 'Partner Anna' from public.event_response r
     where r.event_id = '00000000-0000-0000-0000-0000000fe003' and r.member_id = public.current_member_id() $$,
  '42501', null, 'Begleitperson bei Versammlung gesperrt'
);

-- (9) Mitglied ohne Amt kann KEINEN Termin anlegen
select throws_ok(
  $$ insert into public.event (title, type, starts_at)
     values ('Heimlich', 'clubabend', now() + interval '1 day') $$,
  '42501', null, 'Mitglied ohne manage_events kann keinen Termin anlegen'
);

-- ── Rolle: Vorstand (manage_events via Clubmaster) ──────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}';

-- (10) darf Termin anlegen
select lives_ok(
  $$ insert into public.event (title, type, starts_at)
     values ('Neuer Club-Abend', 'clubabend', now() + interval '14 days') $$,
  'Vorstand (manage_events) darf Termin anlegen'
);

-- ── Rolle: anon ──────────────────────────────────────────────────────────────
reset role;
set local role anon;

-- (11) anon sieht keine Termine
select throws_ok(
  $$ select count(*) from public.event $$,
  '42501', null, 'anon hat keinen Zugriff auf Termine'
);

reset role;
select * from finish();
rollback;
