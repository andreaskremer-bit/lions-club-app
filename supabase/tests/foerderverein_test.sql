-- Förderverein, Übernahme je Verein, Chronik beim Löschen, Juni-Hinweis
-- (Migration 20261023120400).
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

truncate auth.users, public.member cascade;
truncate public.praesident_chronik;
delete from public.notification;

insert into public.member (id, email, first_name, last_name, status, notifications_enabled) values
  ('00000000-0000-0000-0000-0000000f0001', 'sek@fv.example', 'Sina', 'Sekretär',  'aktiv', true),
  ('00000000-0000-0000-0000-0000000f0002', 'fv@fv.example',  'Fritz', 'Vorsitz',  'aktiv', true),
  ('00000000-0000-0000-0000-0000000f0003', 'alt@fv.example', 'Paul', 'Präsident', 'aktiv', true),
  ('00000000-0000-0000-0000-0000000f0004', 'mi@fv.example',  'Mia', 'Mitglied',   'aktiv', true);
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000f00a1', 'sek@fv.example'),
  ('00000000-0000-0000-0000-0000000f00a2', 'fv@fv.example'),
  ('00000000-0000-0000-0000-0000000f00a3', 'alt@fv.example'),
  ('00000000-0000-0000-0000-0000000f00a4', 'mi@fv.example');

-- (1) Förderverein-Ämter geben keine Rechte.
select is(
  (select count(*)::int from public.amt a
   join public.amt_permission ap on ap.amt_id = a.id
   where a.cluster = 'foerderverein'),
  0, 'Förderverein-Ämter haben keine Rechte'
);
select is(
  (select count(*)::int from public.amt where cluster = 'foerderverein' and display_only),
  4, 'Vier Förderverein-Ämter, alle nur zur Anzeige'
);

-- ── Übernahme je Verein ─────────────────────────────────────────────────────
insert into public.member_amt (member_id, amt_id, lions_year)
select v.mid::uuid, a.id, v.y
from (values
  ('00000000-0000-0000-0000-0000000f0001', 'sekretaer', 2030),
  ('00000000-0000-0000-0000-0000000f0002', 'fv_vorsitz', 2030),
  -- Clubvorstand 2031 schon vorab eingetragen, Förderverein nicht.
  ('00000000-0000-0000-0000-0000000f0001', 'sekretaer', 2031)
) as v(mid, amt_key, y)
join public.amt a on a.key = v.amt_key;

-- (3) Nur der Förderverein wird übernommen, der vorab eingetragene Club bleibt.
select is(public.rollover_offices(timestamptz '2031-07-01 00:30+02'), 1,
  'Förderverein wird übernommen, obwohl der Clubvorstand schon eingetragen ist');
select is(
  (select count(*)::int from public.member_amt where lions_year = 2031), 2,
  'Im neuen Jahr: vorab eingetragener Sekretär + übernommener Vorsitz Förderverein'
);
select is(public.rollover_offices(timestamptz '2031-07-01 01:30+02'), 0,
  'Zweiter Lauf: nichts mehr zu tun');

-- ── Chronik beim Löschen ────────────────────────────────────────────────────
insert into public.member_amt (member_id, amt_id, lions_year)
select '00000000-0000-0000-0000-0000000f0003', a.id, y
from public.amt a, (values (2010), (2011)) as v(y)
where a.key = 'praesident';
insert into public.praesident_chronik (lions_year, name) values (2011, 'Schon eingetragen');

delete from public.member where id = '00000000-0000-0000-0000-0000000f0003';

-- (6) Präsidentenjahr landet mit Namen in der Chronik.
select is(
  (select name from public.praesident_chronik where lions_year = 2010), 'Paul Präsident',
  'Gelöschter Präsident bleibt in der Chronik'
);
-- (7) Vorhandener Eintrag wird nicht überschrieben.
select is(
  (select name from public.praesident_chronik where lions_year = 2011), 'Schon eingetragen',
  'Bestehender Chronik-Eintrag bleibt unverändert'
);

-- ── Juni-Hinweis ────────────────────────────────────────────────────────────
-- Laufendes LJ 2031: Sekretär hat manage_roles (2031 vorab eingetragen), 2032 ist leer.
delete from public.notification;
select public.enqueue_due_reminders(date '2032-06-01');

-- (8) Nur wer manage_roles hat, bekommt den Hinweis.
select is(
  (select array_agg(recipient_id::text) from public.notification where kind = 'board_missing'),
  array['00000000-0000-0000-0000-0000000f0001'],
  'Hinweis geht nur an manage_roles'
);
-- (9) Nur am 1., 15. und 25. Juni.
delete from public.notification;
select public.enqueue_due_reminders(date '2032-06-02');
select is(
  (select count(*)::int from public.notification where kind = 'board_missing'), 0,
  'An anderen Tagen kein Hinweis'
);
-- (10) Förderverein-Eintrag im neuen Jahr zählt nicht als Vorstand.
insert into public.member_amt (member_id, amt_id, lions_year)
select '00000000-0000-0000-0000-0000000f0002', a.id, 2032 from public.amt a where a.key = 'fv_vorsitz';
select public.enqueue_due_reminders(date '2032-06-15');
select is(
  (select count(*)::int from public.notification where kind = 'board_missing'), 1,
  'Nur Förderverein eingetragen: Hinweis kommt trotzdem'
);
-- (11) Clubvorstand eingetragen: kein Hinweis mehr.
insert into public.member_amt (member_id, amt_id, lions_year)
select '00000000-0000-0000-0000-0000000f0001', a.id, 2032 from public.amt a where a.key = 'sekretaer';
delete from public.notification;
select public.enqueue_due_reminders(date '2032-06-25');
select is(
  (select count(*)::int from public.notification where kind = 'board_missing'), 0,
  'Vorstand eingetragen: kein Hinweis'
);

select * from finish();
rollback;
