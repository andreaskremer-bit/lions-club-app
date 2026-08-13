-- Test für die Anzeige-Modus-Telemetrie (Migration 20260813120100_member_display_mode.sql).
-- Lauf: `npm run db:test`.
--
-- Kernpunkte: schreibt nur die eigene Zeile, überschreibt den Erstkontakt nicht,
-- trennt Standalone- von Browser-Nutzung und ist für anon gesperrt.

begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

truncate auth.users cascade;

insert into public.member (email, first_name, last_name) values
	('mitglied@example.com', 'Max', 'Mustermann'),
	('andere@example.com', 'Anna', 'Andere');

-- Erstes Konto wird per Trigger mit der member-Zeile verknüpft, das zweite NICHT
-- (zu 'fremder@example.com' gibt es bewusst keine member-Zeile).
insert into auth.users (id, email) values
	('00000000-0000-0000-0000-000000000001', 'mitglied@example.com'),
	('00000000-0000-0000-0000-0000000000ff', 'fremder@example.com');

-- (1) Funktion existiert.
select has_function('public'::name, 'track_display_mode'::name, 'track_display_mode() existiert');

-- ── Rolle: eingeloggtes Mitglied ────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" =
	'{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

-- (2) Vorbedingung: noch nichts erfasst.
select is(
	(select first_standalone_at from public.member where email = 'mitglied@example.com'),
	null,
	'Vor dem ersten Aufruf ist first_standalone_at leer'
);

-- (3) Standalone-Meldung setzt beide Standalone-Spalten.
select public.track_display_mode(true);
select ok(
	(select first_standalone_at is not null and last_standalone_at is not null
	   from public.member where email = 'mitglied@example.com'),
	'track_display_mode(true) setzt first_standalone_at und last_standalone_at'
);

-- (4) Browser-Spalte bleibt dabei unberührt.
select is(
	(select last_browser_at from public.member where email = 'mitglied@example.com'),
	null,
	'Standalone-Meldung schreibt nicht in last_browser_at'
);

-- (5) Fremde Zeilen bleiben unangetastet (die member-ID kommt aus dem JWT).
select is(
	(select count(*)::int from public.member
	  where email = 'andere@example.com' and last_standalone_at is not null),
	0,
	'Der Aufruf schreibt ausschliesslich die eigene Zeile'
);

-- (6) Erstkontakt wird nicht überschrieben. Innerhalb einer Transaktion ist
-- now() konstant, deshalb per gesetztem Altwert geprüft statt über die Uhr.
reset role;
update public.member
   set first_standalone_at = timestamptz '2026-01-01 10:00:00+01'
 where email = 'mitglied@example.com';
set local role authenticated;
set local "request.jwt.claims" =
	'{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select public.track_display_mode(true);
select is(
	(select first_standalone_at from public.member where email = 'mitglied@example.com'),
	timestamptz '2026-01-01 10:00:00+01',
	'Erneute Meldung laesst first_standalone_at stehen (coalesce)'
);

-- (7) Browser-Meldung setzt last_browser_at und laesst Standalone stehen.
select public.track_display_mode(false);
select ok(
	(select last_browser_at is not null
	      and first_standalone_at = timestamptz '2026-01-01 10:00:00+01'
	   from public.member where email = 'mitglied@example.com'),
	'track_display_mode(false) setzt last_browser_at ohne die Standalone-Spalten zu loeschen'
);

-- ── Rolle: Konto OHNE member-Zeile ──────────────────────────────────────────
set local "request.jwt.claims" =
	'{"sub":"00000000-0000-0000-0000-0000000000ff","role":"authenticated"}';

-- (8) Kein Fehler, aber auch kein Schreibzugriff irgendwo.
select lives_ok(
	'select public.track_display_mode(true)',
	'Konto ohne member-Zeile laeuft fehlerfrei durch'
);

-- ── Rolle: anon ─────────────────────────────────────────────────────────────
reset role;
set local role anon;

-- (9) Nicht eingeloggt = kein Ausfuehrungsrecht.
select throws_ok(
	'select public.track_display_mode(true)',
	'42501',
	null,
	'anon darf track_display_mode() nicht ausfuehren'
);

reset role;
select * from finish();
rollback;
