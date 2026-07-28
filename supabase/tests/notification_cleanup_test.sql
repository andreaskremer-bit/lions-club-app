-- Aufräum-Job für Benachrichtigungen (Migration 20260728120100). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name, status) values
  ('c@r.example', 'Carla', 'Clean', 'aktiv');

-- Fixtures relativ zu einem festen "jetzt" = 2026-07-28 12:00 UTC.
insert into public.notification (kind, recipient_id, for_date, title, created_at, read_at)
select 'birthday', m.id, v.for_date, v.title, v.created_at, v.read_at
from public.member m,
     (values
       -- bleibt: frisch und ungelesen
       (date '2026-07-27', 'frisch ungelesen',        timestamptz '2026-07-27 09:00Z', null::timestamptz),
       -- bleibt: 40 Tage alt, aber ungelesen (Frist 90 Tage)
       (date '2026-06-18', 'alt ungelesen',           timestamptz '2026-06-18 09:00Z', null),
       -- bleibt: gelesen, aber jünger als 30 Tage
       (date '2026-07-08', 'gelesen unter 30 Tagen',  timestamptz '2026-07-08 09:00Z', timestamptz '2026-07-08 10:00Z'),
       -- fliegt: gelesen und älter als 30 Tage
       (date '2026-06-10', 'gelesen ueber 30 Tage',   timestamptz '2026-06-10 09:00Z', timestamptz '2026-06-10 10:00Z'),
       -- fliegt: nie gelesen, aber älter als 90 Tage
       (date '2026-04-01', 'ungelesen ueber 90 Tage', timestamptz '2026-04-01 09:00Z', null)
     ) as v(for_date, title, created_at, read_at)
where m.email = 'c@r.example';

-- (1) Zwei Zeilen fallen unter die Fristen.
select is(
  public.cleanup_notifications(timestamptz '2026-07-28 12:00Z'),
  2, 'Gelesen > 30 Tage und alles > 90 Tage wird geloescht'
);

-- (2) Genau die drei frischen bzw. ungelesenen Zeilen bleiben stehen.
select bag_eq(
  $$ select title from public.notification $$,
  $$ values ('frisch ungelesen'), ('alt ungelesen'), ('gelesen unter 30 Tagen') $$,
  'Frische und ungelesene Benachrichtigungen bleiben erhalten'
);

-- (3) App-Rollen dürfen die Bereinigung nicht per RPC aufrufen.
select ok(
  not has_function_privilege('authenticated', 'public.cleanup_notifications(timestamptz)', 'execute'),
  'authenticated hat kein Execute-Recht auf cleanup_notifications'
);

select * from finish();
rollback;
