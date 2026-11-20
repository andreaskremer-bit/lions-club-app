-- Begleitpersonen: Partner(in) vs. Gast (Migration 20261120120000). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

truncate auth.users, public.event cascade;

-- ── Fixtures (Superuser) ────────────────────────────────────────────────────
insert into public.member (email, first_name, last_name) values
  ('a@cp.example', 'Anna', 'Aktiv'),
  ('b@cp.example', 'Bert', 'Beispiel');

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000c0a1', 'a@cp.example'),
  ('00000000-0000-0000-0000-00000000c0b2', 'b@cp.example');

insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-00000000c901', 'Club-Abend künftig', 'clubabend', now() + interval '7 days');

insert into public.event_response (id, event_id, member_id, status)
select '00000000-0000-0000-0000-00000000c9a1', '00000000-0000-0000-0000-00000000c901', m.id, 'zugesagt'
from public.member m where m.email = 'a@cp.example';
insert into public.event_response (id, event_id, member_id, status)
select '00000000-0000-0000-0000-00000000c9b2', '00000000-0000-0000-0000-00000000c901', m.id, 'zugesagt'
from public.member m where m.email = 'b@cp.example';

-- (1) Spalte mit Default false
select col_default_is('public', 'companion', 'is_partner', 'false', 'is_partner hat Default false');
select col_not_null('public', 'companion', 'is_partner', 'is_partner ist NOT NULL');

-- ── Rolle: Mitglied Anna ─────────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000c0a1","role":"authenticated"}';

-- (2) Partner(in) und Gast eintragen
select lives_ok(
  $$ insert into public.companion (id, event_response_id, name, is_partner) values
       ('00000000-0000-0000-0000-00000000c9c1', '00000000-0000-0000-0000-00000000c9a1', 'Paul Aktiv', true),
       ('00000000-0000-0000-0000-00000000c9c2', '00000000-0000-0000-0000-00000000c9a1', 'Gerda Gast', false) $$,
  'Mitglied trägt Partner(in) und Gast ein'
);

-- (3) Ohne Angabe ist die Begleitung ein Gast
insert into public.companion (id, event_response_id, name)
values ('00000000-0000-0000-0000-00000000c9c3', '00000000-0000-0000-0000-00000000c9a1', 'Otto Ohne');
select is(
  (select is_partner from public.companion where id = '00000000-0000-0000-0000-00000000c9c3'),
  false, 'Begleitung ohne Angabe gilt als Gast'
);

-- (4) Höchstens eine Partner(in) je Rückmeldung
select throws_ok(
  $$ insert into public.companion (event_response_id, name, is_partner)
     values ('00000000-0000-0000-0000-00000000c9a1', 'Zweiter Partner', true) $$,
  '23505', null, 'Zweite Partner(in) je Rückmeldung abgelehnt'
);

-- (5) Gast nachträglich als Partner(in) markieren (nach Entfernen der bisherigen)
delete from public.companion where id = '00000000-0000-0000-0000-00000000c9c1';
update public.companion set is_partner = true where id = '00000000-0000-0000-0000-00000000c9c2';
select is(
  (select is_partner from public.companion where id = '00000000-0000-0000-0000-00000000c9c2'),
  true, 'Mitglied kann eigenen Gast zur Partner(in) machen'
);

-- (6) Fremde Begleitung nicht umstellbar (RLS: Update wirkt nicht)
reset role;
insert into public.companion (id, event_response_id, name)
values ('00000000-0000-0000-0000-00000000c9d1', '00000000-0000-0000-0000-00000000c9b2', 'Berta Gast');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-00000000c0a1","role":"authenticated"}';
update public.companion set is_partner = true where id = '00000000-0000-0000-0000-00000000c9d1';
select is(
  (select is_partner from public.companion where id = '00000000-0000-0000-0000-00000000c9d1'),
  false, 'Fremde Begleitung bleibt unverändert'
);

-- (7) Andere Rückmeldung darf eigene Partner(in) haben (Index gilt je Rückmeldung)
reset role;
select lives_ok(
  $$ insert into public.companion (event_response_id, name, is_partner)
     values ('00000000-0000-0000-0000-00000000c9b2', 'Bernd Beispiel', true) $$,
  'Partner(in) je Rückmeldung, nicht je Termin'
);

select * from finish();
rollback;
