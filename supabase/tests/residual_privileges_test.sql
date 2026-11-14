-- Restrechte auf Tabellen in public (Migration 20261114120000): anon hat auf
-- keiner Tabelle irgendein Recht, authenticated nur SELECT/INSERT/UPDATE/DELETE.
-- TRUNCATE umginge RLS und Zeilen-Trigger und darf deshalb nie vergeben sein.
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

-- (1) anon: kein Tabellenrecht, auf keiner Tabelle.
select is(
  (select array_agg(g order by g)
     from (select distinct table_name::text || ':' || privilege_type as g
             from information_schema.role_table_grants
            where table_schema = 'public' and grantee = 'anon') t),
  null,
  'anon hat auf keiner Tabelle in public ein Tabellenrecht'
);

-- (2) anon: auch kein Spaltenrecht (REFERENCES hing als Spaltenrecht an jeder Tabelle).
select is(
  (select count(*)::int from information_schema.column_privileges
    where table_schema = 'public' and grantee = 'anon'),
  0,
  'anon hat auf keiner Spalte in public ein Recht'
);

-- (3) authenticated: nur die vier Datenrechte, nichts darüber hinaus.
select is(
  (select array_agg(g order by g)
     from (select distinct table_name::text || ':' || privilege_type as g
             from information_schema.role_table_grants
            where table_schema = 'public' and grantee = 'authenticated'
              and privilege_type not in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')) t),
  null,
  'authenticated hat kein TRUNCATE/REFERENCES/TRIGGER auf Tabellen in public'
);

-- (4) MAINTAIN taucht in information_schema nicht auf → direkt prüfen.
select is(
  (select array_agg(c.relname::text order by c.relname)
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
      and (has_table_privilege('anon', c.oid, 'MAINTAIN')
        or has_table_privilege('authenticated', c.oid, 'MAINTAIN'))),
  null,
  'weder anon noch authenticated hat MAINTAIN'
);

-- (5) Tatsächlicher Versuch: TRUNCATE als angemeldetes Konto scheitert am Recht.
set local role authenticated;
select throws_ok(
  $$ truncate public.news_post $$,
  '42501', null, 'authenticated kann nicht per TRUNCATE an RLS vorbei leeren'
);
reset role;

-- (6) Default-Rechte: eine NEUE Tabelle bekommt für anon/authenticated nichts.
create table public._residual_privileges_probe (id int);
select is(
  (select array_agg(g order by g)
     from (select grantee::text || ':' || privilege_type as g
             from information_schema.role_table_grants
            where table_schema = 'public' and table_name = '_residual_privileges_probe'
              and grantee in ('anon', 'authenticated')) t),
  null,
  'neue Tabellen erhalten für anon/authenticated keine Rechte automatisch'
);

select * from finish();
rollback;
