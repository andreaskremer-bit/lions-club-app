-- RLS-Tests für Termin-Dokumente: manage_events (Clubmaster) darf NUR
-- event-gebundene Dokumente schreiben, publish_content weiterhin alle,
-- normale Mitglieder keine. (pgTAP — Lauf: `npx supabase test db`.)

begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

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

-- (1) Darf ein event-gebundenes Dokument anlegen.
select lives_ok(
  $$ insert into public.document (title, category, event_id)
     values ('Ablaufplan', 'sonstige', '00000000-0000-0000-0000-0000000ee001') $$,
  'Clubmaster kann event-gebundenes Dokument anlegen'
);

-- (2) Darf KEIN freies Dokument (ohne Termin) anlegen.
select throws_ok(
  $$ insert into public.document (title, category) values ('Frei', 'sonstige') $$,
  '42501', null, 'Clubmaster kann kein termin-loses Dokument anlegen'
);

-- (3) Darf ein event-gebundenes Dokument NICHT vom Termin entkoppeln.
select throws_ok(
  $$ update public.document set event_id = null
     where event_id = '00000000-0000-0000-0000-0000000ee001' $$,
  '42501', null, 'Clubmaster kann event_id nicht auf NULL setzen'
);

-- (4) Darf das event-gebundene Dokument löschen.
select lives_ok(
  $$ delete from public.document where event_id = '00000000-0000-0000-0000-0000000ee001' $$,
  'Clubmaster kann event-gebundenes Dokument löschen'
);

-- ── Rolle: normales Mitglied ────────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0001","role":"authenticated"}';

-- (5) Kein Schreiben — auch nicht event-gebunden.
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

select * from finish();
rollback;
