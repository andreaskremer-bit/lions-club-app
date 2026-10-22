-- RLS-Tests für Termin-Dokumente: manage_events (Clubmaster) darf NUR
-- event-gebundene Termin-Unterlagen schreiben (keine Protokolle, auch nicht mit Termin),
-- publish_content weiterhin alle, normale Mitglieder keine. (pgTAP – Lauf: `npx supabase test db`.)

begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

truncate auth.users, public.member cascade;

-- Fixtures (Superuser).
insert into public.member (email, first_name, last_name, status) values
  ('mem@evt.example', 'Mara', 'Mitglied',  'aktiv'),   -- normales Mitglied
  ('cm@evt.example',  'Cleo', 'Clubmaster','aktiv'),   -- manage_events, KEIN publish_content
  ('pub@evt.example', 'Paul', 'Publish',   'aktiv');   -- publish_content (Präsident)

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000e0001', 'mem@evt.example'),
  ('00000000-0000-0000-0000-0000000e0002', 'cm@evt.example'),
  ('00000000-0000-0000-0000-0000000e0003', 'pub@evt.example');

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'cm@evt.example' and a.key = 'clubmaster';   -- manage_events
insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'pub@evt.example' and a.key = 'praesident';  -- publish_content

-- Ein Termin, an den angehängt wird.
insert into public.event (id, title, type, starts_at)
values ('00000000-0000-0000-0000-0000000ee001', 'Club-Reise', 'reise', now());

-- ── Rolle: Clubmaster (manage_events) ───────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0002","role":"authenticated"}';

-- (1) Darf eine Termin-Unterlage anlegen.
select lives_ok(
  $$ insert into public.document (title, category, event_id)
     values ('Ablaufplan', 'termin_unterlage', '00000000-0000-0000-0000-0000000ee001') $$,
  'Clubmaster kann Termin-Unterlage anlegen'
);

-- (2) Darf KEIN freies Dokument (ohne Termin) anlegen.
select throws_ok(
  $$ insert into public.document (title, category) values ('Frei', 'termin_unterlage') $$,
  '42501', null, 'Clubmaster kann kein termin-loses Dokument anlegen'
);

-- (2a) Darf kein Protokoll anlegen, auch nicht mit Termin – es stünde in der Ablage.
select throws_ok(
  $$ insert into public.document (title, category, event_id)
     values ('Protokoll', 'protokoll_clubabend', '00000000-0000-0000-0000-0000000ee001') $$,
  '42501', null, 'Clubmaster kann kein Protokoll mit Termin anlegen'
);

-- (2b) Darf eine Termin-Unterlage nicht in eine Ablage-Kategorie umwandeln.
select throws_ok(
  $$ update public.document set category = 'sonstige'
     where event_id = '00000000-0000-0000-0000-0000000ee001' $$,
  '42501', null, 'Clubmaster kann Termin-Unterlage nicht in die Ablage verschieben'
);

-- (3) Darf ein event-gebundenes Dokument NICHT vom Termin entkoppeln.
select throws_ok(
  $$ update public.document set event_id = null
     where event_id = '00000000-0000-0000-0000-0000000ee001' $$,
  '42501', null, 'Clubmaster kann event_id nicht auf NULL setzen'
);

-- (4) Darf die Termin-Unterlage löschen.
select lives_ok(
  $$ delete from public.document where event_id = '00000000-0000-0000-0000-0000000ee001' $$,
  'Clubmaster kann Termin-Unterlage löschen'
);

-- ── Rolle: normales Mitglied ────────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0001","role":"authenticated"}';

-- (5) Kein Schreiben – auch nicht event-gebunden.
select throws_ok(
  $$ insert into public.document (title, category, event_id)
     values ('X', 'sonstige', '00000000-0000-0000-0000-0000000ee001') $$,
  '42501', null, 'Mitglied kann kein (event-)Dokument anlegen'
);

-- ── Rolle: Publisher (Präsident) ────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0003","role":"authenticated"}';

-- (6) publish_content darf weiterhin freie Dokumente anlegen.
select lives_ok(
  $$ insert into public.document (title, category) values ('Satzung', 'satzung') $$,
  'publish_content kann termin-loses Dokument anlegen'
);

-- (7) publish_content darf auch event-gebundene Dokumente anlegen.
select lives_ok(
  $$ insert into public.document (title, category, event_id)
     values ('Protokoll', 'protokoll_clubabend', '00000000-0000-0000-0000-0000000ee001') $$,
  'publish_content kann event-gebundenes Dokument anlegen'
);

-- ── Zurück zum Clubmaster: verknüpftes Protokoll ist tabu ───────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0002","role":"authenticated"}';

-- (8) Löschen eines verknüpften Protokolls trifft unter RLS keine Zeile.
delete from public.document where category = 'protokoll_clubabend';
reset role;
select is(
  (select count(*)::int from public.document where category = 'protokoll_clubabend'),
  1, 'Clubmaster kann verknüpftes Protokoll nicht löschen'
);

-- (9) Ändern ebenso wirkungslos.
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0002","role":"authenticated"}';
update public.document set title = 'Geändert' where category = 'protokoll_clubabend';
reset role;
select is(
  (select title from public.document where category = 'protokoll_clubabend'),
  'Protokoll', 'Clubmaster kann verknüpftes Protokoll nicht ändern'
);

select * from finish();
rollback;
