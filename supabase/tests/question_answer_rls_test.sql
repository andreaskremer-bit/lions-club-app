-- M4 – RLS-Tests für Abfrage-Engine (pgTAP). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

truncate auth.users, public.event cascade;

-- ── Fixtures (Superuser) ────────────────────────────────────────────────────
insert into public.member (email, first_name, last_name) values
  ('orga@qa.example', 'Otto',   'Organisator'),
  ('sek@qa.example',  'Sabine', 'Sekretaer'),
  ('a@qa.example',    'Anna',   'Antwort'),
  ('b@qa.example',    'Bert',   'Begleiter');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'orga@qa.example'),
  ('00000000-0000-0000-0000-0000000000d4', 'sek@qa.example'),
  ('00000000-0000-0000-0000-0000000000b2', 'a@qa.example'),
  ('00000000-0000-0000-0000-0000000000c3', 'b@qa.example');

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'orga@qa.example' and a.key = 'clubmaster'; -- manage_events + view_participants

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'sek@qa.example' and a.key = 'sekretaer'; -- view_participants, KEIN manage_events

-- ── Rechte-Matrix: view_participants (Spec §3, Migration 20260903120200) ────
select is(
  (select array_agg(a.key order by a.key)
     from public.amt_permission ap join public.amt a on a.id = ap.amt_id
    where ap.permission = 'view_participants'),
  array['clubmaster', 'praesident', 'sekretaer', 'vize', 'webmaster'],
  'view_participants: alle manage_events-Ämter + Sekretär'
);

insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-0000000a4001', 'CA künftig',   'clubabend', now() + interval '7 days'),
  ('00000000-0000-0000-0000-0000000a4002', 'CA vergangen', 'clubabend', now() - interval '7 days');

insert into public.question (id, event_id, label, qtype, options) values
  ('00000000-0000-0000-0000-0000000b4001', '00000000-0000-0000-0000-0000000a4001', 'Menü', 'single', '{Fleisch,Fisch,Vegetarisch}'),
  ('00000000-0000-0000-0000-0000000b4002', '00000000-0000-0000-0000-0000000a4002', 'Menü alt', 'single', '{A,B}');

-- Rückmeldungen + Begleitpersonen für künftigen Termin
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000a4001', m.id, 'zugesagt' from public.member m where m.email = 'a@qa.example';
insert into public.event_response (event_id, member_id, status)
select '00000000-0000-0000-0000-0000000a4001', m.id, 'zugesagt' from public.member m where m.email = 'b@qa.example';

insert into public.companion (event_response_id, name)
select r.id, 'Partner A' from public.event_response r join public.member m on m.id = r.member_id
where r.event_id = '00000000-0000-0000-0000-0000000a4001' and m.email = 'a@qa.example';
insert into public.companion (event_response_id, name)
select r.id, 'Partner B' from public.event_response r join public.member m on m.id = r.member_id
where r.event_id = '00000000-0000-0000-0000-0000000a4001' and m.email = 'b@qa.example';

-- ── Rolle: Organisator (manage_events) ──────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select lives_ok(
  $$ insert into public.question (event_id, label, qtype)
     values ('00000000-0000-0000-0000-0000000a4001', 'Allergien', 'text') $$,
  'Organisator (manage_events) kann Frage anlegen'
);

-- ── Rolle: Mitglied Anna ────────────────────────────────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}';

select throws_ok(
  $$ insert into public.question (event_id, label, qtype)
     values ('00000000-0000-0000-0000-0000000a4001', 'Heimlich', 'text') $$,
  '42501', null, 'Mitglied ohne manage_events kann keine Frage anlegen'
);

select lives_ok(
  $$ insert into public.answer (question_id, member_id, value)
     values ('00000000-0000-0000-0000-0000000b4001', public.current_member_id(), '"Fisch"'::jsonb) $$,
  'Mitglied kann eigene Antwort geben'
);

select throws_ok(
  $$ insert into public.answer (question_id, member_id, value)
     values ('00000000-0000-0000-0000-0000000b4001',
             (select id from public.member where email = 'b@qa.example'), '"Fleisch"'::jsonb) $$,
  '42501', null, 'Mitglied kann nicht für andere antworten'
);

select lives_ok(
  $$ insert into public.answer (question_id, member_id, companion_id, value)
     values ('00000000-0000-0000-0000-0000000b4001', public.current_member_id(),
             (select id from public.companion where name = 'Partner A'), '"Vegetarisch"'::jsonb) $$,
  'Mitglied kann für eigene Begleitperson antworten'
);

select throws_ok(
  $$ insert into public.answer (question_id, member_id, companion_id, value)
     values ('00000000-0000-0000-0000-0000000b4001', public.current_member_id(),
             (select id from public.companion where name = 'Partner B'), '"Fisch"'::jsonb) $$,
  '42501', null, 'Mitglied kann nicht für fremde Begleitperson antworten'
);

select throws_ok(
  $$ insert into public.answer (question_id, member_id, value)
     values ('00000000-0000-0000-0000-0000000b4002', public.current_member_id(), '"A"'::jsonb) $$,
  '42501', null, 'Antwort an vergangenem Termin gesperrt'
);

-- ── Rolle: Mitglied Bert ────────────────────────────────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}';

select is(
  (select count(*)::int from public.answer),
  0, 'Mitglied sieht fremde Antworten nicht'
);

-- ── Rolle: Organisator ──────────────────────────────────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

select cmp_ok(
  (select count(*)::int from public.answer), '>=', 2,
  'Organisator (manage_events) sieht alle Antworten'
);

-- ── Rolle: Sekretär (view_participants ohne manage_events) ──────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000d4","role":"authenticated"}';

select is(public.has_permission('view_participants'), true, 'Sekretär hat view_participants');
select is(public.has_permission('manage_events'), false, 'Sekretär hat weiterhin kein manage_events');

select cmp_ok(
  (select count(*)::int from public.answer), '>=', 2,
  'Sekretär (view_participants) sieht alle Antworten (Teilnehmerliste/Export)'
);

select throws_ok(
  $$ insert into public.question (event_id, label, qtype)
     values ('00000000-0000-0000-0000-0000000a4001', 'Vom Sekretär', 'text') $$,
  '42501', null, 'Sekretär kann trotz view_participants keine Frage anlegen'
);

reset role;
select * from finish();
rollback;
