-- M6 — RLS- + Funktions-Tests für News (pgTAP). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

truncate auth.users, public.member cascade;

insert into public.member (email, first_name, last_name, status, notifications_enabled) values
  ('mem@news.example', 'Mara', 'Mitglied', 'aktiv', true),
  ('pub@news.example', 'Paul', 'Publish',  'aktiv', true),
  ('off@news.example', 'Olaf', 'Ohne',     'aktiv', false);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000e0001', 'mem@news.example'),
  ('00000000-0000-0000-0000-0000000e0002', 'pub@news.example');

insert into public.member_amt (member_id, amt_id)
select m.id, a.id from public.member m, public.amt a
where m.email = 'pub@news.example' and a.key = 'praesident'; -- publish_content

insert into public.news_post (id, title, body)
values ('00000000-0000-0000-0000-0000000e9001', 'Willkommen', 'Erste Vereinsnachricht.');

-- ── Normales Mitglied ───────────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0001","role":"authenticated"}';

select is((select count(*)::int from public.news_post), 1, 'Mitglied sieht News (Lesen für alle)');

select throws_ok(
  $$ insert into public.news_post (title, body) values ('X', 'Y') $$,
  '42501', null, 'Mitglied ohne publish_content kann nicht veröffentlichen'
);

select throws_ok(
  $$ select public.notify_news('00000000-0000-0000-0000-0000000e9001') $$,
  null, null, 'notify_news ohne publish_content wird abgewiesen'
);

-- ── Publisher (Präsident) ───────────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"00000000-0000-0000-0000-0000000e0002","role":"authenticated"}';

select lives_ok(
  $$ insert into public.news_post (title, body) values ('Sommerfest', 'Am 12. Juli.') $$,
  'publish_content kann veröffentlichen'
);

select lives_ok(
  $$ select public.notify_news('00000000-0000-0000-0000-0000000e9001') $$,
  'notify_news mit publish_content erlaubt'
);

-- ── Auswertung ──────────────────────────────────────────────────────────────
reset role;

select is(
  (select count(*)::int from public.notification where kind = 'news'),
  2, 'News-Benachrichtigung respektiert das Empfänger-Gate (mem + pub)'
);

select is(
  (select count(*)::int from public.notification n
   join public.member m on m.id = n.recipient_id
   where n.kind = 'news' and m.email = 'off@news.example'),
  0, 'Gate aus: keine News-Benachrichtigung'
);

select * from finish();
rollback;
