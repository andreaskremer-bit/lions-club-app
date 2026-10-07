-- Benachrichtigungs-Freigabe ab Werk an (Migration 20261007120100).
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(2);

select col_default_is('public', 'member', 'notifications_enabled', 'true',
  'notifications_enabled ist ab Werk an');

insert into public.member (email, first_name, last_name, status) values
  ('neu@default.example', 'Nina', 'Neu', 'aktiv');
select ok(
  (select notifications_enabled from public.member where email = 'neu@default.example'),
  'Neu angelegtes Mitglied ist für Benachrichtigungen freigeschaltet'
);

select * from finish();
rollback;
