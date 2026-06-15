-- M6 — RLS- + Funktions-Tests für Dokumente (pgTAP). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

truncate auth.users, public.member cascade;

-- Fixtures (Superuser).
insert into public.member (email, first_name, last_name, status, notifications_enabled) values
  ('mem@doc.example', 'Mara', 'Mitglied', 'aktiv', true),   -- normales Mitglied, freigeschaltet
  ('pub@doc.example', 'Paul', 'Publish',  'aktiv', true),   -- publish_content (Präsident)
  ('off@doc.example', 'Olaf', 'Ohne',     'aktiv', false);  -- aktiv, NICHT freigeschaltet

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000d0001', 'mem@doc.example'),
  ('00000000-0000-0000-0000-0000000d0002', 'pub@doc.example');

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'pub@doc.example' and a.key = 'praesident'; -- hat publish_content

-- Ein Dokument als Superuser (für Lese- und FTS-Test).
insert into public.document (id, title, category, content_text)
values ('00000000-0000-0000-0000-0000000dc001', 'Protokoll Mai', 'protokoll_clubabend',
        'Beschluss zum Sommerfest und Kassenbericht.');

-- ── Rolle: normales Mitglied ────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000d0001","role":"authenticated"}';

-- (1) Alle Mitglieder dürfen lesen.
select is(
  (select count(*)::int from public.document),
  1, 'Mitglied sieht Dokumente (Lesen für alle)'
);

-- (2) Ohne publish_content kein Anlegen.
select throws_ok(
  $$ insert into public.document (title, category) values ('X', 'sonstige') $$,
  '42501', null, 'Mitglied ohne publish_content kann nicht anlegen'
);

-- (3) Mitglied ohne Recht kann notify_document nicht auslösen.
select throws_ok(
  $$ select public.notify_document('00000000-0000-0000-0000-0000000dc001') $$,
  null, null, 'notify_document ohne publish_content wird abgewiesen'
);

-- ── Rolle: Publisher (Präsident) ────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000d0002","role":"authenticated"}';

-- (4) Mit publish_content darf angelegt werden.
select lives_ok(
  $$ insert into public.document (title, category) values ('Satzung', 'satzung') $$,
  'publish_content kann Dokument anlegen'
);

-- (5) notify_document läuft mit Recht.
select lives_ok(
  $$ select public.notify_document('00000000-0000-0000-0000-0000000dc001') $$,
  'notify_document mit publish_content erlaubt'
);

-- ── Auswertung als Superuser ────────────────────────────────────────────────
reset role;

-- (6) Benachrichtigung nur für aktive, freigeschaltete Mitglieder (mem + pub = 2).
select is(
  (select count(*)::int from public.notification where kind = 'document'),
  2, 'Dokument-Benachrichtigung respektiert das Empfänger-Gate'
);

-- (7) Nicht freigeschaltetes Mitglied bekommt nichts.
select is(
  (select count(*)::int from public.notification n
   join public.member m on m.id = n.recipient_id
   where n.kind = 'document' and m.email = 'off@doc.example'),
  0, 'Gate aus: keine Dokument-Benachrichtigung'
);

-- (8) Deutsche Volltextsuche findet das Dokument über den Inhalt (Stemming).
select is(
  (select count(*)::int from public.document
   where search_tsv @@ websearch_to_tsquery('german', 'Sommerfest')),
  1, 'Volltextsuche findet Dokument über Dateiinhalt'
);

select * from finish();
rollback;
