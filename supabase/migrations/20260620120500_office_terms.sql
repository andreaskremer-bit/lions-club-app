-- P2 — Lions-Jahr-Dimension für Ämter, Cluster, abgeleiteter Past-Präsident, Vereinslokal.
-- Ämter gelten je Lions-Jahr (1.7.–30.6.); Rechte zählen nur im AKTUELLEN LJ.
-- Umstellung zum 1.7. ergibt sich datumsbasiert (kein Cron).

-- 1) Aktuelles Lions-Jahr (Startjahr, analog src/lib/dates.ts lionsStartYear()).
create or replace function public.current_lions_year()
returns int
language sql
stable
set search_path = public
as $$
  select case
    when extract(month from current_date) >= 7 then extract(year from current_date)::int
    else extract(year from current_date)::int - 1
  end;
$$;
grant execute on function public.current_lions_year() to authenticated;

-- 2) Zeitdimension auf member_amt. Default = aktuelles LJ: backfillt Bestand und
-- erlaubt bequeme Inserts (Tests/Seed ohne lions_year landen im aktuellen LJ).
alter table public.member_amt
  add column lions_year int not null default public.current_lions_year();
alter table public.member_amt drop constraint member_amt_pkey;
alter table public.member_amt add primary key (member_id, amt_id, lions_year);

-- Kontinuität / kein Lockout zum 1.7.: aktuelle Zuordnungen als Startwert ins
-- kommende LJ kopieren (nach der Frühjahrs-MV im Vorstandsbereich anpassbar).
insert into public.member_amt (member_id, amt_id, lions_year, since)
select member_id, amt_id, public.current_lions_year() + 1, since
from public.member_amt
where lions_year = public.current_lions_year()
on conflict do nothing;

-- 3) has_permission: nur Ämter des AKTUELLEN Lions-Jahres werten (sonst identisch).
create or replace function public.has_permission(perm public.app_permission)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member m
    join public.member_amt ma on ma.member_id = m.id
    join public.amt_permission ap on ap.amt_id = ma.amt_id
    where m.user_id = auth.uid()
      and ma.lions_year = public.current_lions_year()
      and ap.permission = perm
  );
$$;

-- 4) Ämter clustern + neue Beauftragte; past_praesident als Amt entfernen (-> abgeleitet).
create type public.amt_cluster as enum ('clubvorstand', 'weiterer_vorstand', 'beauftragte');
alter table public.amt add column cluster public.amt_cluster;

update public.amt set cluster = 'clubvorstand' where key in ('praesident', 'sekretaer', 'schatzmeister');
update public.amt set cluster = 'weiterer_vorstand' where key in ('vize', 'clubmaster');
update public.amt set cluster = 'beauftragte' where key in ('webmaster', 'activity');

delete from public.amt where key = 'past_praesident'; -- cascadet member_amt

insert into public.amt (key, label, sort_order, display_only, cluster) values
  ('mitgliedschaftsbeauftragter', 'Mitgliedschaftsbeauftragter', 45, true, 'clubvorstand'),
  ('presse', 'Presse', 90, true, 'beauftragte'),
  ('leo_club', 'Leo-Club', 100, true, 'beauftragte'),
  ('lions_quest', 'Lions Quest', 110, true, 'beauftragte'),
  ('klasse2000', 'Klasse2000', 120, true, 'beauftragte'),
  ('jumelage', 'Jumelage', 130, true, 'beauftragte'),
  ('umwelt', 'Umwelt-Beauftragte*r', 140, true, 'beauftragte')
on conflict (key) do nothing;

-- 5) Past-Präsident abgeleitet: Präsident des Vorjahres.
create or replace function public.past_praesident_member_id()
returns uuid
language sql
stable
set search_path = public
as $$
  select ma.member_id
  from public.member_amt ma
  join public.amt a on a.id = ma.amt_id
  where a.key = 'praesident'
    and ma.lions_year = public.current_lions_year() - 1
  limit 1;
$$;
grant execute on function public.past_praesident_member_id() to authenticated;

-- 6) Vereinslokal (Single-Row): Default-Ort für Clubabend/MV.
create table public.club_venue (
  id         int primary key default 1 check (id = 1),
  name       text,
  street     text,
  zip        text,
  city       text,
  updated_at timestamptz not null default now()
);
insert into public.club_venue (id) values (1) on conflict do nothing;

alter table public.club_venue enable row level security;
create policy club_venue_select_all
  on public.club_venue for select to authenticated using (true);
create policy club_venue_write_roles
  on public.club_venue for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));
grant select, insert, update on public.club_venue to authenticated;
grant select, insert, update on public.club_venue to service_role;
