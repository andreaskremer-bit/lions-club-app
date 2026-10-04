-- Code-Review 2026-10-04 (supabase/migrations): Spaltenschutz bei Selbstpflege,
-- Termin-Reminder nach Berliner Datum (Migration 20261004120600).
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name, status, notifications_enabled) values
  ('self@rv.example', 'Selma', 'Selbst', 'aktiv', true);
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000e1', 'self@rv.example');

-- ── Spaltenschutz (als das Mitglied selbst) ────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000e1","role":"authenticated"}';

select lives_ok(
  $$ update public.member set mobile = '0170 1' where email = 'self@rv.example' $$,
  'Eigene Stammdaten bleiben änderbar'
);
select throws_ok(
  $$ update public.member set notifications_enabled = false where email = 'self@rv.example' $$,
  'P0001', null,
  'notifications_enabled ist in der Selbstpflege gesperrt (kein Voll-Opt-out)'
);
select throws_ok(
  $$ update public.member set last_login_at = '2000-01-01' where email = 'self@rv.example' $$,
  'P0001', null,
  'Login-Daten sind in der Selbstpflege gesperrt'
);
select throws_ok(
  $$ update public.member set last_standalone_at = now() where email = 'self@rv.example' $$,
  'P0001', null,
  'Nutzungsdaten sind in der Selbstpflege gesperrt'
);
-- … aber die Systemfunktion darf sie weiter setzen.
select lives_ok(
  $$ select public.track_display_mode(true) $$,
  'track_display_mode schreibt die Nutzungsdaten weiterhin'
);

reset role;
select isnt(
  (select last_standalone_at from public.member where email = 'self@rv.example'), null,
  'track_display_mode hat last_standalone_at gesetzt'
);

-- ── Termin-Reminder nach Berliner Datum ────────────────────────────────────
-- Termin am 15.11. um 00:30 Berlin = 14.11. 23:30 UTC. Vorlauf 3 Tage → Erinnerung am 12.11.
set local timezone = 'UTC';
insert into public.event (title, type, starts_at, reminder_days_before)
values ('Mitternachtstermin', 'clubabend', '2026-11-15 00:30+01', 3);
select public.enqueue_due_reminders(date '2026-11-11');
select public.enqueue_due_reminders(date '2026-11-12');
select is(
  (select array_agg(distinct for_date) from public.notification where kind = 'event_reminder'),
  array[date '2026-11-12'],
  'Erinnerung kommt am 12.11. (Berliner Datum), nicht einen Tag zu früh'
);

select * from finish();
rollback;
