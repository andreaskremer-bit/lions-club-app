-- Aufbewahrung der Anwesenheit: laufendes + abgeschlossenes Vorjahr bleiben, Älteres
-- wird gelöscht (Migration 20261004120400). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name) values ('r@ret.example', 'Rita', 'Rest');

-- "Jetzt" = 15.10.2026 → laufendes LJ 2026/27, Vorjahr 2025/26, Grenze 1.7.2025 (Berlin).
insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-00000000e001', 'LJ 2024/25 spät',  'clubabend', '2025-06-30 20:00+02'),
  ('00000000-0000-0000-0000-00000000e002', 'LJ 2025/26 früh',  'clubabend', '2025-07-01 00:30+02'),
  ('00000000-0000-0000-0000-00000000e003', 'LJ 2025/26',       'clubabend', '2026-03-10 19:00+01'),
  ('00000000-0000-0000-0000-00000000e004', 'LJ 2026/27',       'clubabend', '2026-09-08 19:00+02');

insert into public.attendance (event_id, member_id, present)
select e.id, m.id, false from public.event e, public.member m;

-- (1) Nur der Termin vor dem 1.7.2025 fliegt.
select is(public.cleanup_attendance(timestamptz '2026-10-15 12:00+02'), 1,
  'Löscht genau die Anwesenheit vor dem abgeschlossenen Vorjahr');

-- (2) Vorjahr (ab 1.7.2025 00:30 Berlin) und laufendes Jahr bleiben.
select bag_eq(
  $$ select e.title from public.attendance a join public.event e on e.id = a.event_id $$,
  $$ values ('LJ 2025/26 früh'), ('LJ 2025/26'), ('LJ 2026/27') $$,
  'Laufendes und abgeschlossenes Vorjahr bleiben vollständig');

-- (3) Termine selbst bleiben bestehen.
select is((select count(*)::int from public.event), 4, 'Termine werden nicht gelöscht');

-- (4) App-Rollen dürfen nicht per RPC aufräumen.
select ok(
  not has_function_privilege('authenticated', 'public.cleanup_attendance(timestamptz)', 'execute'),
  'authenticated hat kein Execute-Recht auf cleanup_attendance'
);

select * from finish();
rollback;
