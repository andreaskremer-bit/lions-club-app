-- P4 — Tests für die Benachrichtigungs-Präferenz (Versandkanal). Lauf: `npx supabase test db`.
-- Prüft Default, Selbstpflege durch das Mitglied und die Enum-Schranke.

begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name) values
  ('chan@example.com', 'Carla', 'Kanal');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000c4001', 'chan@example.com');

-- (1) Default ist 'both'.
select is(
  (select notification_channel::text from public.member where email = 'chan@example.com'),
  'both', 'Neues Mitglied hat Default-Kanal both'
);

-- ── Rolle: das Mitglied selbst ──────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000c4001","role":"authenticated"}';

-- (2) Mitglied darf den eigenen Kanal pflegen.
update public.member set notification_channel = 'email'
  where user_id = '00000000-0000-0000-0000-0000000c4001'::uuid;
select is(
  (select notification_channel::text from public.member where email = 'chan@example.com'),
  'email', 'Mitglied kann eigenen Versandkanal setzen'
);

-- (3) Spaltenschutz greift NICHT für den Kanal (Update bleibt erlaubt, anders als Status).
select lives_ok(
  $$ update public.member set notification_channel = 'push'
     where user_id = '00000000-0000-0000-0000-0000000c4001'::uuid $$,
  'notification_channel ist nicht spaltengeschützt'
);

reset role;

-- (4) Enum lässt nur gültige Werte zu.
select throws_ok(
  $$ update public.member set notification_channel = 'sms'
     where email = 'chan@example.com' $$,
  '22P02', null,
  'Ungültiger Kanalwert wird abgelehnt'
);

select * from finish();
rollback;
