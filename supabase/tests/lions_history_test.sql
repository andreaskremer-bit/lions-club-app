-- Historie aus Lions Deutschland (Migration 20261023120000): Eintritt bei Lions ist ein
-- geschütztes Stammdatum, alte Ämter geben keine Rechte, Präsidenten-Chronik lesen alle
-- Mitglieder, schreiben nur manage_roles.
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

truncate auth.users, public.member cascade;
truncate public.praesident_chronik;

insert into public.member (email, first_name, last_name) values
  ('mem@lh.example', 'Mia', 'Mitglied'),
  ('web@lh.example', 'Wim', 'Webmaster'),
  ('alt@lh.example', 'Alf', 'Altpraesident');
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000e0001', 'mem@lh.example'),
  ('00000000-0000-0000-0000-0000000e0002', 'web@lh.example'),
  ('00000000-0000-0000-0000-0000000e0003', 'alt@lh.example');

-- webmaster (manage_roles) im laufenden LJ; Präsident nur vor 20 Jahren.
insert into public.member_amt (member_id, amt_id, lions_year)
select m.id, a.id, public.current_lions_year() + v.off
from public.member m
join (values ('web@lh.example', 'webmaster', 0), ('alt@lh.example', 'praesident', -20))
  as v(email, amt_key, off) on v.email = m.email
join public.amt a on a.key = v.amt_key;

insert into public.praesident_chronik (lions_year, name) values (1996, 'Ehemalig');

-- (1) Neues Amt für die Historie, ohne Rechte.
select is(
  (select display_only from public.amt where key = 'vize2'), true,
  '2. Vizepräsident(in) existiert als reines Anzeige-Amt'
);

set local role authenticated;

-- ── Normales Mitglied ───────────────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0001","role":"authenticated"}';

-- (2) Eintritt bei Lions ist lesbar.
select lives_ok(
  $$ select lions_joined_on from public.member $$,
  'Mitglied liest lions_joined_on'
);

-- (3) … aber nicht selbst änderbar (auch nicht in der eigenen Zeile).
select throws_ok(
  $$ update public.member set lions_joined_on = date '2000-01-01' where email = 'mem@lh.example' $$,
  'P0001', null, 'Mitglied ändert den eigenen Lions-Eintritt nicht'
);

-- (4) Chronik lesbar.
select is((select count(*)::int from public.praesident_chronik), 1, 'Mitglied liest die Chronik');

-- (5) Chronik nicht schreibbar.
select throws_ok(
  $$ insert into public.praesident_chronik (lions_year, name) values (1997, 'X') $$,
  '42501', null, 'Mitglied schreibt die Chronik nicht'
);

-- ── Ehemaliger Präsident: altes Amt gibt keine Rechte ───────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0003","role":"authenticated"}';

-- (6)
select is(public.has_permission('manage_events'), false, 'Präsidentschaft vor 20 Jahren gibt keine Rechte');

-- ── manage_roles ────────────────────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0002","role":"authenticated"}';

-- (7) Chronik pflegen.
select lives_ok(
  $$ insert into public.praesident_chronik (lions_year, name) values (1997, 'Zweiter') $$,
  'manage_roles schreibt die Chronik'
);

-- (8b) Verstorben-Kennzeichen, Default false.
select is(
  (select deceased from public.praesident_chronik where lions_year = 1997), false,
  'Chronik-Eintrag ist standardmäßig nicht als verstorben markiert'
);

-- ── anon ────────────────────────────────────────────────────────────────────
reset role;
set local role anon;

-- (8)
select throws_ok(
  $$ select * from public.praesident_chronik $$,
  '42501', null, 'anon liest die Chronik nicht'
);

select * from finish();
rollback;
