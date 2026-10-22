-- Spaltenrechte auf member (Migration 20261022120200): Login-/Einladungs-/Telemetrie-
-- Felder und Notizen sind für `authenticated` nicht lesbar; die Mitgliederverwaltung
-- liest Login- und Einladungsdatum über member_access_info().
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

-- (1) Sperrliste exakt: Jede NEUE member-Spalte lässt diesen Test scheitern, bis sie
-- in der Migration ausdrücklich freigegeben oder hier als gesperrt eingetragen ist.
select is(
  (select array_agg(column_name::text order by column_name::text)
     from information_schema.columns
    where table_schema = 'public' and table_name = 'member'
      and not has_column_privilege('authenticated', 'public.member', column_name, 'SELECT')),
  array['first_login_at', 'first_standalone_at', 'invite_sent_at', 'last_browser_at',
        'last_login_at', 'last_standalone_at', 'notes'],
  'Genau diese member-Spalten sind für authenticated gesperrt'
);

-- (2) anon darf die Funktion nicht ausführen.
select ok(
  not has_function_privilege('anon', 'public.member_access_info(uuid)', 'EXECUTE'),
  'anon kann member_access_info nicht ausführen'
);

truncate auth.users, public.member cascade;

insert into public.member (id, email, first_name, last_name, status, first_login_at, invite_sent_at) values
  ('00000000-0000-0000-0000-0000000c0001', 'mem@col.example', 'Mia', 'Mitglied', 'aktiv',
   '2026-10-01 10:00+00', '2026-09-30 09:00+00'),
  ('00000000-0000-0000-0000-0000000c0002', 'sek@col.example', 'Sven', 'Sekretär', 'aktiv', null, null);
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000c00a1', 'mem@col.example'),
  ('00000000-0000-0000-0000-0000000c00a2', 'sek@col.example');
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000c0002', a.id from public.amt a where a.key = 'sekretaer';

-- ── Normales Mitglied ───────────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000c00a1","role":"authenticated"}';

-- (3) Freigegebene Spalten bleiben lesbar.
select is(
  (select last_name from public.member where id = '00000000-0000-0000-0000-0000000c0002'),
  'Sekretär', 'Mitglied liest freigegebene Spalten'
);

-- (4) Login-Zeit eines anderen: gesperrt.
select throws_ok(
  $$ select first_login_at from public.member where id = '00000000-0000-0000-0000-0000000c0002' $$,
  '42501', null, 'Mitglied liest fremde Login-Zeit nicht'
);

-- (5) Auch die eigene Telemetrie nicht (Spaltenrecht gilt zeilenunabhängig).
select throws_ok(
  $$ select last_browser_at from public.member where id = '00000000-0000-0000-0000-0000000c0001' $$,
  '42501', null, 'Mitglied liest Telemetrie-Spalten nicht'
);

-- (6) Funktion ohne manage_members: abgewiesen.
select throws_ok(
  $$ select * from public.member_access_info('00000000-0000-0000-0000-0000000c0001') $$,
  '42501', null, 'member_access_info nur mit manage_members'
);

-- ── Sekretär (manage_members) ───────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000c00a2","role":"authenticated"}';

-- (7)+(8) Funktion liefert die Daten.
select is(
  (select first_login_at from public.member_access_info('00000000-0000-0000-0000-0000000c0001')),
  '2026-10-01 10:00+00'::timestamptz, 'Sekretär sieht das Login-Datum'
);
select is(
  (select invite_sent_at from public.member_access_info('00000000-0000-0000-0000-0000000c0001')),
  '2026-09-30 09:00+00'::timestamptz, 'Sekretär sieht das Einladungsdatum'
);

select * from finish();
rollback;
