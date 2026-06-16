-- Test für die Keep-alive-RPC. Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

-- (1) Funktion existiert.
select has_function('public'::name, 'keepalive'::name, 'keepalive() existiert');

-- (2) anon darf sie ausführen und bekommt ein Ergebnis (echter DB-Roundtrip).
set local role anon;
select isnt(
  (select public.keepalive()),
  null,
  'anon kann keepalive() ausführen, Ergebnis nicht null'
);
reset role;

-- (3) Gibt einen Zeitstempel ~jetzt zurück (kein statischer/falscher Wert).
select ok(
  (select public.keepalive()) between now() - interval '1 minute' and now() + interval '1 minute',
  'keepalive() liefert die aktuelle Uhrzeit'
);

select * from finish();
rollback;
