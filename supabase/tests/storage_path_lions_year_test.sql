-- Security-Scan 2026-10-04: Storage-Pfade an den eigenen Datensatz gebunden (F9/F10/F12)
-- und Lions-Jahr unabhängig von der Sitzungs-Zeitzone (F7). Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name, status) values
  ('a@p.example', 'Anna', 'Angreifer', 'aktiv'),
  ('o@p.example', 'Olga', 'Opfer', 'aktiv');

-- (1) Eigener Pfad ist erlaubt.
select lives_ok(
  $$ update public.member set photo_path = id::text || '/avatar_1.jpg' where email = 'a@p.example' $$,
  'photo_path unter der eigenen Id ist erlaubt'
);

-- (2) Pfad eines anderen Mitglieds ist verboten.
select throws_ok(
  $$ update public.member
       set photo_path = (select id::text from public.member where email = 'o@p.example') || '/avatar_1.jpg'
     where email = 'a@p.example' $$,
  '23514', null,
  'photo_path auf das Foto eines anderen Mitglieds wird abgelehnt'
);

-- (3) Pfad-Tricks mit .. sind verboten.
select throws_ok(
  $$ update public.member set photo_path = id::text || '/../x.jpg' where email = 'a@p.example' $$,
  '23514', null,
  'photo_path mit .. wird abgelehnt'
);

-- (4) null bleibt erlaubt (Foto entfernen).
select lives_ok(
  $$ update public.member set photo_path = null where email = 'a@p.example' $$,
  'photo_path = null ist erlaubt'
);

insert into public.document (title, category) values ('Satzung', 'satzung'), ('Anhang', 'sonstige');

-- (5) Eigener Dateipfad ist erlaubt.
select lives_ok(
  $$ update public.document set file_path = id::text || '/Anhang.pdf' where title = 'Anhang' $$,
  'file_path unter der eigenen Id ist erlaubt'
);

-- (6) Dateipfad eines anderen Dokuments ist verboten.
select throws_ok(
  $$ update public.document
       set file_path = (select id::text from public.document where title = 'Satzung') || '/Satzung.pdf'
     where title = 'Anhang' $$,
  '23514', null,
  'file_path auf die Datei eines anderen Dokuments wird abgelehnt'
);

-- (7–9) Lions-Jahr: Wechsel am 1. Juli 00:00 Berliner Zeit, egal welche Zeitzone die
-- Sitzung hat (vorher entschied current_date der Sitzung).
set local timezone = 'Etc/GMT+12';
select is(
  public.lions_year_at(timestamptz '2026-07-01 00:30+02'), 2026,
  '1. Juli 00:30 Berlin zählt zum neuen LJ, auch wenn die Sitzung noch den 30. Juni hat'
);
select is(
  public.lions_year_at(timestamptz '2026-06-30 23:30+02'), 2025,
  '30. Juni 23:30 Berlin zählt zum alten LJ'
);
set local timezone = 'Pacific/Kiritimati';
select is(
  public.lions_year_at(timestamptz '2026-06-30 23:30+02'), 2025,
  'Auch mit Kiritimati-Zeitzone (dort schon 1. Juli) bleibt es beim alten LJ'
);

select * from finish();
rollback;
