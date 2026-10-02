-- Security-Audit 2026-08-03 — Gate „verknüpfte member-Zeile“ (Migration
-- 20260803120100_authenticated_member_gate.sql).
--
-- Prüft den Fall, den die alten `using (true)`-Policies offen ließen: ein Konto in
-- auth.users OHNE zugehörige member-Zeile (entstand über den damals offenen
-- Self-Signup). So ein Konto hat die Rolle `authenticated` wie jedes Mitglied —
-- sehen darf es trotzdem nichts. Gegenprobe mit einem echten Mitglied stellt sicher,
-- dass die Härtung nicht zu weit greift.

begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

truncate auth.users, public.event, public.document, public.news_post cascade;
delete from public.club_venue;

-- ── Fixtures (als Superuser, RLS wird umgangen) ─────────────────────────────
insert into public.member (email, first_name, last_name)
values ('mitglied@example.com', 'Max', 'Mustermann');

-- Erstes Konto wird per Trigger mit der member-Zeile verknüpft, zweites NICHT:
-- zu 'fremder@example.com' gibt es keine member-Zeile (= Self-Signup-Fall).
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'mitglied@example.com'),
  ('00000000-0000-0000-0000-0000000000ff', 'fremder@example.com');

insert into public.event (title, type, starts_at)
values ('Testabend', 'clubabend', now() + interval '7 days');

insert into public.event_response (event_id, member_id, status)
select e.id, m.id, 'zugesagt'
from public.event e, public.member m
where m.email = 'mitglied@example.com';

insert into public.companion (event_response_id, name)
select r.id, 'Begleitung Test' from public.event_response r;

insert into public.question (event_id, label, qtype)
select e.id, 'Testfrage', 'text' from public.event e;

insert into public.document (title, category) values ('Testprotokoll', 'protokoll_clubabend');
insert into public.news_post (title, body) values ('Testnews', 'Testtext');
insert into public.club_venue (id, name) values (1, 'Testlokal');

-- ── Rolle: Konto OHNE member-Zeile (Self-Signup-Fall) ───────────────────────
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"00000000-0000-0000-0000-0000000000ff","role":"authenticated"}';

-- (1) Vorbedingung: kein verknüpftes Mitglied
select is(public.current_member_id(), null,
  'Konto ohne member-Zeile hat keine current_member_id');

-- (2)-(9) sieht nirgends etwas
select is((select count(*)::int from public.member), 0,
  'Konto ohne member-Zeile sieht KEIN Verzeichnis');
select is((select count(*)::int from public.event), 0,
  'Konto ohne member-Zeile sieht KEINE Termine');
select is((select count(*)::int from public.event_response), 0,
  'Konto ohne member-Zeile sieht KEINE Rückmeldungen');
select is((select count(*)::int from public.companion), 0,
  'Konto ohne member-Zeile sieht KEINE Begleitpersonen');
select is((select count(*)::int from public.question), 0,
  'Konto ohne member-Zeile sieht KEINE Zusatzfragen');
select is((select count(*)::int from public.document), 0,
  'Konto ohne member-Zeile sieht KEINE Dokumente');
select is((select count(*)::int from public.news_post), 0,
  'Konto ohne member-Zeile sieht KEINE News');
select is((select count(*)::int from public.club_venue), 0,
  'Konto ohne member-Zeile sieht KEIN Vereinslokal');

-- (10) und darf weiterhin nichts anlegen
select throws_ok(
  $$ insert into public.member (email, first_name, last_name)
     values ('neu@example.com', 'N', 'N') $$,
  '42501', null,
  'Konto ohne member-Zeile kann KEIN Mitglied anlegen'
);

-- ── Gegenprobe: echtes Mitglied sieht weiterhin alles ───────────────────────
reset role;
set local role authenticated;
set local "request.jwt.claims" =
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select isnt(public.current_member_id(), null,
  'Mitglied hat eine current_member_id');
select is((select count(*)::int from public.member), 1,
  'Mitglied sieht das Verzeichnis weiterhin');
select is((select count(*)::int from public.event), 1,
  'Mitglied sieht Termine weiterhin');
select is((select count(*)::int from public.document), 1,
  'Mitglied sieht Dokumente weiterhin');

reset role;
select * from finish();
rollback;
