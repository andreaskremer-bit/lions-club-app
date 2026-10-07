-- Einladungs-Vermerk member.invite_sent_at (Migration 20261007120000).
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(3);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name, status) values
  ('neu@inv.example', 'Nora', 'Neu', 'aktiv');
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000f1', 'neu@inv.example');

-- Als das Mitglied selbst: Vermerk ist ein Systemfeld.
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000000f1","role":"authenticated"}';

select throws_ok(
  $$ update public.member set invite_sent_at = now() where email = 'neu@inv.example' $$,
  'P0001', null,
  'invite_sent_at ist in der Selbstpflege gesperrt'
);

-- Als service_role (Edge Function send-invite): darf den Vermerk schreiben.
reset role;
set local role service_role;
set local "request.jwt.claims" = '{"role":"service_role"}';

select lives_ok(
  $$ update public.member set invite_sent_at = '2026-10-07 21:00+00' where email = 'neu@inv.example' $$,
  'service_role setzt invite_sent_at'
);

reset role;
select is(
  (select invite_sent_at from public.member where email = 'neu@inv.example'),
  '2026-10-07 21:00+00'::timestamptz,
  'Vermerk ist gespeichert'
);

select * from finish();
rollback;
