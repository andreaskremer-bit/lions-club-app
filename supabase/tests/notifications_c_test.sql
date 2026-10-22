-- Benachrichtigungsregeln Gruppe C (Migration 20261022120800). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

truncate auth.users, public.member, public.event cascade;

insert into public.member (id, email, first_name, last_name, status, birthday) values
  ('00000000-0000-0000-0000-0000000e0c01', 'zu@c.example',   'Zora', 'Zusage',  'aktiv', null),
  ('00000000-0000-0000-0000-0000000e0c02', 'ab@c.example',   'Arno', 'Absage',  'aktiv', null),
  ('00000000-0000-0000-0000-0000000e0c03', 'of@c.example',   'Olga', 'Offen',   'aktiv', null),
  ('00000000-0000-0000-0000-0000000e0c04', 'eh@c.example',   'Emil', 'Ehren',   'ehrenmitglied', null),
  ('00000000-0000-0000-0000-0000000e0c05', 'neu@c.example',  'Nina', 'Neu',     'aktiv', null),  -- ohne Konto
  ('00000000-0000-0000-0000-0000000e0c06', 'cm@c.example',   'Carl', 'Master',  'aktiv', '1970-01-01');
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000e0ca1', 'zu@c.example'),
  ('00000000-0000-0000-0000-0000000e0ca2', 'ab@c.example'),
  ('00000000-0000-0000-0000-0000000e0ca3', 'of@c.example'),
  ('00000000-0000-0000-0000-0000000e0ca4', 'eh@c.example'),
  ('00000000-0000-0000-0000-0000000e0ca6', 'cm@c.example');
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000e0c06', a.id from public.amt a where a.key = 'clubmaster';
insert into public.member_amt (member_id, amt_id)
select '00000000-0000-0000-0000-0000000e0c02', a.id from public.amt a where a.key = 'presse';

insert into public.event (id, title, type, starts_at) values
  ('00000000-0000-0000-0000-0000000e0ce1', 'Ausflug', 'gesellig', now() + interval '10 days');
insert into public.event_response (event_id, member_id, status) values
  ('00000000-0000-0000-0000-0000000e0ce1', '00000000-0000-0000-0000-0000000e0c01', 'zugesagt'),
  ('00000000-0000-0000-0000-0000000e0ce1', '00000000-0000-0000-0000-0000000e0c02', 'abgesagt');

-- (1) Geburtstag: Ehrenmitglied und Mitglied ohne Konto bekommen nichts (Carl hat Geburtstag).
select public.enqueue_due_reminders(date '2026-01-01');
select is(
  (select array_agg(m.email order by m.email) from public.notification n
     join public.member m on m.id = n.recipient_id where n.kind = 'birthday'),
  array['ab@c.example', 'of@c.example', 'zu@c.example']::text[],
  'Geburtstag nur an aktive Mitglieder mit Login-Konto');
delete from public.notification;

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0ca6","role":"authenticated"}';

-- (2) Neuer Termin: an alle aktiven mit Konto (4: Zora, Arno, Olga, Carl).
select public.notify_event('00000000-0000-0000-0000-0000000e0ce1', 'event_new', 'Am 1. November');
-- (3) Änderung: nur an die mit Rückmeldung (Zora, Arno).
select public.notify_event('00000000-0000-0000-0000-0000000e0ce1', 'event_changed', 'Neu: 19:30 Uhr');
-- (4) Neue Frage: nur an Zusagen (Zora).
select public.notify_event('00000000-0000-0000-0000-0000000e0ce1', 'event_question', null);
-- (5) Zweite Änderung am selben Tag ersetzt den Text der noch nicht versandten.
select public.notify_event('00000000-0000-0000-0000-0000000e0ce1', 'event_changed', 'Neu: 20:00 Uhr');
reset role;

select is((select count(*)::int from public.notification where kind = 'event_new'), 4,
  'Neuer Termin geht an alle aktiven Mitglieder mit Konto');
select is((select count(*)::int from public.notification where kind = 'event_changed'), 2,
  'Änderung geht an alle mit Rückmeldung');
select is((select count(*)::int from public.notification where kind = 'event_question'), 1,
  'Neue Frage geht nur an Zusagen');
select is(
  (select distinct body from public.notification where kind = 'event_changed'), 'Neu: 20:00 Uhr',
  'Spätere Änderung am selben Tag ersetzt den Text');

-- (6) Ohne manage_events: abgewiesen.
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0ca3","role":"authenticated"}';
select throws_ok(
  $$ select public.notify_event('00000000-0000-0000-0000-0000000e0ce1', 'event_new', null) $$,
  '42501', null, 'notify_event nur mit manage_events');

-- (7) Termin-Unterlage: Clubmaster meldet, Empfänger nur Zusagen, mit event_id.
reset role;
insert into public.document (id, title, category, event_id) values
  ('00000000-0000-0000-0000-0000000e0cd1', 'Reiseplan', 'termin_unterlage', '00000000-0000-0000-0000-0000000e0ce1');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0ca6","role":"authenticated"}';
select lives_ok($$ select public.notify_document('00000000-0000-0000-0000-0000000e0cd1') $$,
  'Clubmaster darf eine Termin-Unterlage melden');
reset role;
select is(
  (select array_agg(m.email) from public.notification n join public.member m on m.id = n.recipient_id
    where n.kind = 'document' and n.event_id = '00000000-0000-0000-0000-0000000e0ce1'),
  array['zu@c.example']::text[], 'Termin-Unterlage geht an die Zusagen, mit Link zum Termin');

-- (8) Normales Dokument: Clubmaster darf nicht melden.
insert into public.document (id, title, category) values
  ('00000000-0000-0000-0000-0000000e0cd2', 'Satzung', 'satzung');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0ca6","role":"authenticated"}';
select throws_ok($$ select public.notify_document('00000000-0000-0000-0000-0000000e0cd2') $$,
  null, null, 'Ablage-Dokument meldet nur publish_content');

-- (9) Absage: an alle, ohne event_id (überlebt das Löschen).
select public.cancel_event('00000000-0000-0000-0000-0000000e0ce1', true, 'Fällt aus.');
reset role;
select is((select count(*)::int from public.notification where kind = 'event_cancelled'), 4,
  'Absage geht an alle und bleibt nach dem Löschen erhalten');
select is((select count(*)::int from public.event where id = '00000000-0000-0000-0000-0000000e0ce1'), 0,
  'cancel_event löscht den Termin');

-- (10) News: Ehrenmitglied und Mitglied ohne Konto bekommen nichts.
insert into public.news_post (id, title, body) values
  ('00000000-0000-0000-0000-0000000e0cb1', 'Hallo', 'Text');
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0ca2","role":"authenticated"}';
select public.notify_news('00000000-0000-0000-0000-0000000e0cb1');
reset role;
select is((select count(*)::int from public.notification where kind = 'news'), 4,
  'News nur an aktive Mitglieder mit Konto');

-- (11) Kanal 'both' gibt es nicht mehr.
select throws_ok(
  $$ update public.member set notification_channel = 'both' where email = 'zu@c.example' $$,
  '23514', null, 'Kanal both ist nicht mehr zulässig');

-- (12) anon darf die neuen Funktionen nicht ausführen.
select ok(
  not has_function_privilege('anon', 'public.notify_event(uuid, text, text)', 'EXECUTE')
  and not has_function_privilege('anon', 'public.cancel_event(uuid, boolean, text)', 'EXECUTE'),
  'anon führt notify_event/cancel_event nicht aus');

select * from finish();
rollback;
