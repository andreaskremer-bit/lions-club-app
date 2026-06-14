-- M3 — RLS-Tests für Anwesenheit (pgTAP). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

-- Saubere Ausgangslage unabhängig vom Dev-Seed (rollback stellt wieder her).
truncate auth.users, public.event cascade;

-- ── Fixtures (Superuser) ────────────────────────────────────────────────────
insert into public.member (email, first_name, last_name) values
  ('sek@att.example',   'Sina',  'Sekretär'),
  ('schatz@att.example','Klaus', 'Kasse'),
  ('plain@att.example', 'Max',   'Mitglied');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'sek@att.example'),
  ('00000000-0000-0000-0000-0000000000b2', 'schatz@att.example'),
  ('00000000-0000-0000-0000-0000000000c3', 'plain@att.example');

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'sek@att.example' and a.key = 'sekretaer';
insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'schatz@att.example' and a.key = 'schatzmeister';

insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-0000000a3001', 'Club-Abend', 'clubabend', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000a3002', 'Reise',      'reise',     now() - interval '2 days');

-- Vorab: 'plain' war abwesend beim Club-Abend
insert into public.attendance (event_id, member_id, present)
select '00000000-0000-0000-0000-0000000a3001', m.id, false
from public.member m where m.email = 'plain@att.example';

-- ── Rolle: Sekretär (record_attendance) ─────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';

-- (1) darf Anwesenheit bei spendenpflichtigem Termin erfassen
select lives_ok(
  $$ insert into public.attendance (event_id, member_id, present)
     values ('00000000-0000-0000-0000-0000000a3001', public.current_member_id(), true) $$,
  'Sekretär kann Anwesenheit bei Club-Abend erfassen'
);

-- (2) NICHT bei nicht-spendenpflichtigem Termin (Reise)
select throws_ok(
  $$ insert into public.attendance (event_id, member_id, present)
     values ('00000000-0000-0000-0000-0000000a3002', public.current_member_id(), true) $$,
  '42501', null, 'Anwesenheit nur bei spendenpflichtigen Terminen erfassbar'
);

-- (6) darf bestehende Erfassung ändern (plain: abwesend -> anwesend)
update public.attendance set present = true
  where event_id = '00000000-0000-0000-0000-0000000a3001'
    and member_id = (select id from public.member where email = 'plain@att.example');
select is(
  (select present from public.attendance
   where event_id = '00000000-0000-0000-0000-0000000a3001'
     and member_id = (select id from public.member where email = 'plain@att.example')),
  true, 'Vorstand kann Erfassung korrigieren'
);

-- ── Rolle: Mitglied ohne Amt ────────────────────────────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000c3","role":"authenticated"}';

-- (3) kann nicht erfassen
select throws_ok(
  $$ insert into public.attendance (event_id, member_id, present)
     values ('00000000-0000-0000-0000-0000000a3001', public.current_member_id(), true) $$,
  '42501', null, 'Mitglied ohne Recht kann keine Anwesenheit erfassen'
);

-- (4) sieht keine Anwesenheitsdaten
select is(
  (select count(*)::int from public.attendance),
  0, 'Normales Mitglied sieht keine Anwesenheitsdaten'
);

-- ── Rolle: Schatzmeister (view_donations) ───────────────────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000b2","role":"authenticated"}';

-- (5) darf Anwesenheitsdaten für die Auswertung sehen
select cmp_ok(
  (select count(*)::int from public.attendance), '>=', 1,
  'Schatzmeister sieht Anwesenheitsdaten'
);

-- ── Rolle: anon ──────────────────────────────────────────────────────────────
reset role;
set local role anon;

-- (7) anon hat keinen Zugriff
select throws_ok(
  $$ select count(*) from public.attendance $$,
  '42501', null, 'anon hat keinen Zugriff auf Anwesenheit'
);

reset role;
select * from finish();
rollback;
