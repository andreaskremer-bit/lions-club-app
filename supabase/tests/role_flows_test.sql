-- Regeln aus dem Rollen-Durchgang 2026-10-22 (Migrationen 20261022120300/120400).
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

truncate auth.users, public.member, public.event cascade;

insert into public.member (id, email, first_name, last_name, status) values
  ('00000000-0000-0000-0000-0000000d0001', 'sek@flow.example', 'Sina', 'Sekretär',   'aktiv'),
  ('00000000-0000-0000-0000-0000000d0002', 'cm@flow.example',  'Carl', 'Clubmaster', 'aktiv'),
  ('00000000-0000-0000-0000-0000000d0003', 'pr@flow.example',  'Petra', 'Präsident', 'aktiv'),
  ('00000000-0000-0000-0000-0000000d0004', 'mi@flow.example',  'Mia', 'Mitglied',    'aktiv');
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000d00a1', 'sek@flow.example'),
  ('00000000-0000-0000-0000-0000000d00a2', 'cm@flow.example'),
  ('00000000-0000-0000-0000-0000000d00a3', 'pr@flow.example'),
  ('00000000-0000-0000-0000-0000000d00a4', 'mi@flow.example');

-- ── A1: Ämter-Übernahme ins neue Lions-Jahr ─────────────────────────────────
insert into public.member_amt (member_id, amt_id, lions_year)
select '00000000-0000-0000-0000-0000000d0001', a.id, 2030 from public.amt a where a.key = 'sekretaer';
insert into public.member_amt (member_id, amt_id, lions_year)
select '00000000-0000-0000-0000-0000000d0003', a.id, 2030 from public.amt a where a.key = 'praesident';

-- (1) 1.7.2031 kurz nach Mitternacht (Berlin): LJ 2031 leer -> beide Ämter übernommen.
select is(public.rollover_offices(timestamptz '2031-07-01 00:30+02'), 2,
  'Leeres neues Lions-Jahr übernimmt die Ämter des Vorjahres');
-- (2) Zweiter Lauf: nichts mehr zu tun.
select is(public.rollover_offices(timestamptz '2031-07-01 01:30+02'), 0,
  'Besetztes Lions-Jahr bleibt unangetastet');
-- (3) Noch im alten LJ (30.6.): kein Kopieren in das alte Jahr hinein.
select is(public.rollover_offices(timestamptz '2031-06-30 23:30+02'), 0,
  'Im laufenden, besetzten Lions-Jahr passiert nichts');
-- (4) App-Rollen dürfen die Funktion nicht aufrufen.
select ok(not has_function_privilege('authenticated', 'public.rollover_offices(timestamptz)', 'EXECUTE'),
  'authenticated kann rollover_offices nicht ausführen');

-- ── A1: letzte Person mit manage_roles im aktuellen LJ ──────────────────────
insert into public.member_amt (member_id, amt_id)   -- Default = aktuelles LJ
select '00000000-0000-0000-0000-0000000d0001', a.id from public.amt a where a.key = 'sekretaer';
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000d0002', a.id from public.amt a where a.key = 'clubmaster';
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000d0003', a.id from public.amt a where a.key = 'praesident';

-- (5) Einzige Sekretärin entfernen: abgewiesen.
select throws_ok(
  $$ delete from public.member_amt
     where member_id = '00000000-0000-0000-0000-0000000d0001'
       and lions_year = public.current_lions_year() $$,
  'P0001', null, 'Letzte Person mit manage_roles lässt sich nicht entfernen');
-- (6) Mit Nachfolge (Webmaster) geht es.
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000d0003', a.id from public.amt a where a.key = 'webmaster';
select lives_ok(
  $$ delete from public.member_amt
     where member_id = '00000000-0000-0000-0000-0000000d0001'
       and lions_year = public.current_lions_year() $$,
  'Mit Nachfolge lässt sich die bisherige Person entfernen');
-- Für die folgenden Tests: Sekretärin wieder eintragen (record_attendance kommt vom Präsidenten).
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000d0001', a.id from public.amt a where a.key = 'sekretaer';

-- ── A3: Termin mit erfasster Anwesenheit ────────────────────────────────────
insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-0000000de001', 'Club-Abend erfasst', 'clubabend', now() - interval '7 days'),
  ('00000000-0000-0000-0000-0000000de002', 'Club-Abend leer',    'clubabend', now() - interval '14 days'),
  ('00000000-0000-0000-0000-0000000de003', 'Ausflug',            'gesellig',  now() + interval '7 days');
insert into public.attendance (event_id, member_id, present) values
  ('00000000-0000-0000-0000-0000000de001', '00000000-0000-0000-0000-0000000d0004', false);

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000d00a2","role":"authenticated"}';

-- (7) Clubmaster: Typ ändern -> abgewiesen.
select throws_ok(
  $$ update public.event set type = 'gesellig' where id = '00000000-0000-0000-0000-0000000de001' $$,
  '42501', null, 'Clubmaster ändert den Typ eines erfassten Termins nicht');
-- (8) Clubmaster: löschen -> abgewiesen.
select throws_ok(
  $$ delete from public.event where id = '00000000-0000-0000-0000-0000000de001' $$,
  '42501', null, 'Clubmaster löscht keinen Termin mit erfasster Anwesenheit');
-- (9) Clubmaster: Titel ändern bleibt erlaubt.
select lives_ok(
  $$ update public.event set title = 'Club-Abend (neu)' where id = '00000000-0000-0000-0000-0000000de001' $$,
  'Clubmaster ändert andere Felder weiterhin');
-- (10) Clubmaster: Termin ohne Anwesenheit löschen bleibt erlaubt.
select lives_ok(
  $$ delete from public.event where id = '00000000-0000-0000-0000-0000000de002' $$,
  'Clubmaster löscht Termine ohne erfasste Anwesenheit');

-- (11) Präsident (record_attendance): darf löschen.
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000d00a3","role":"authenticated"}';
select lives_ok(
  $$ delete from public.event where id = '00000000-0000-0000-0000-0000000de001' $$,
  'Mit record_attendance lässt sich der erfasste Termin löschen');

-- ── B2: Zusatzfragen nur mit Zusage ─────────────────────────────────────────
reset role;
insert into public.question (id, event_id, label, qtype) values
  ('00000000-0000-0000-0000-0000000d0f01', '00000000-0000-0000-0000-0000000de003', 'Vegetarisch?', 'boolean');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000d00a4","role":"authenticated"}';

-- (12) Ohne Rückmeldung: keine eigene Antwort.
select throws_ok(
  $$ insert into public.answer (question_id, member_id, value)
     values ('00000000-0000-0000-0000-0000000d0f01', '00000000-0000-0000-0000-0000000d0004', 'true') $$,
  '42501', null, 'Ohne Zusage keine eigene Antwort');
-- (13) Nach der Zusage: erlaubt.
insert into public.event_response (event_id, member_id, status)
values ('00000000-0000-0000-0000-0000000de003', '00000000-0000-0000-0000-0000000d0004', 'zugesagt');
select lives_ok(
  $$ insert into public.answer (question_id, member_id, value)
     values ('00000000-0000-0000-0000-0000000d0f01', '00000000-0000-0000-0000-0000000d0004', 'true') $$,
  'Mit Zusage ist die eigene Antwort möglich');

-- ── B4: Typwechsel ohne Begleitung entfernt Begleitpersonen ─────────────────
insert into public.companion (event_response_id, name)
select r.id, 'Max Partner' from public.event_response r
where r.event_id = '00000000-0000-0000-0000-0000000de003';
reset role;
update public.event set type = 'versammlung' where id = '00000000-0000-0000-0000-0000000de003';
-- (14)
select is(
  (select count(*)::int from public.companion c
     join public.event_response r on r.id = c.event_response_id
    where r.event_id = '00000000-0000-0000-0000-0000000de003'),
  0, 'Typwechsel auf MV entfernt angemeldete Begleitpersonen');

-- ── Eintrittsdatum nur durch berechtigte Ämter ─────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000d00a4","role":"authenticated"}';
-- (15)
select throws_ok(
  $$ update public.member set joined_on = date '2099-01-01'
     where id = '00000000-0000-0000-0000-0000000d0004' $$,
  'P0001', null, 'Mitglied ändert das eigene Eintrittsdatum nicht');
reset role;

select * from finish();
rollback;
