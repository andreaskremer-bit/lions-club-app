-- Historie aus dem Lions-Deutschland-Portal (2026-10-23): Eintritt bei Lions, Ämter
-- früherer Lions-Jahre, Präsidenten-Chronik.
--
-- (1) member.lions_joined_on: Eintritt bei Lions (kann vor oder nach dem Clubeintritt
--     liegen, z. B. bei Wechslern aus anderen Clubs). Reine Anzeige; joined_on bleibt
--     das Clubeintrittsdatum, das die Anwesenheitserfassung steuert. Stammdatum wie
--     die Mitgliedsnummer: nur mit edit_member_master änderbar.
-- (2) Amt „2. Vizepräsident(in)“ (nur Anzeige), damit die Historie ihn abbilden kann.
-- (3) praesident_chronik: Präsidenten, die nicht mehr als Mitglied geführt werden.
--     Bewusst KEINE member-Zeilen für Ehemalige – sie tauchten sonst in Verzeichnis,
--     Benachrichtigungen und Anwesenheit auf. Präsidenten, die (noch) Mitglied sind,
--     stehen weiter in member_amt; die Chronik in der App führt beides zusammen.
--
-- Ämter früherer Lions-Jahre sind ganz normale member_amt-Zeilen: Alle Rechte-Leser
-- (has_permission, Layout, /api) filtern auf das laufende Lions-Jahr, alte Zeilen
-- vergeben also keine Rechte.

-- (1) ─────────────────────────────────────────────────────────────────────────
alter table public.member add column lions_joined_on date;

comment on column public.member.lions_joined_on is
  'Eintritt bei Lions (laut Lions Deutschland); nur Anzeige. Clubeintritt = joined_on.';

-- Spaltenrechte (20261022120200): neue member-Spalten ausdrücklich freigeben.
grant select (lions_joined_on) on public.member to authenticated;

-- Fassung aus 20261022120600, erweitert um lions_joined_on.
create or replace function public.protect_member_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Kein eingeloggter Nutzer (System-Trigger/service_role), keine App-Anfrage (Rolle
  -- nicht `authenticated`, z. B. Admin per psql), berechtigtes Amt oder eine
  -- vertrauenswürdige Systemfunktion: Spaltenschutz greift nicht.
  if auth.uid() is null
     or coalesce(current_setting('role', true), 'none') <> 'authenticated'
     or public.has_permission('edit_member_master')
     or current_setting('app.member_system_write', true) = 'on' then
    return new;
  end if;
  if new.status   is distinct from old.status
     or new.user_id is distinct from old.user_id
     or new.lions_member_no is distinct from old.lions_member_no
     or new.lions_joined_on is distinct from old.lions_joined_on
     or new.joined_on is distinct from old.joined_on
     or lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, '')) then
    raise exception
      'Geschützte Felder (Status, E-Mail, Konto, Mitgliedsnummer, Eintrittsdaten) dürfen nur durch berechtigte Ämter geändert werden.';
  end if;
  if new.notifications_enabled is distinct from old.notifications_enabled
     or new.first_login_at is distinct from old.first_login_at
     or new.last_login_at is distinct from old.last_login_at
     or new.first_standalone_at is distinct from old.first_standalone_at
     or new.last_standalone_at is distinct from old.last_standalone_at
     or new.last_browser_at is distinct from old.last_browser_at
     or new.invite_sent_at is distinct from old.invite_sent_at then
    raise exception 'Systemfelder (Benachrichtigungs-Freigabe, Einladung, Login- und Nutzungsdaten) sind nicht änderbar.';
  end if;
  return new;
end;
$$;

-- (2) ─────────────────────────────────────────────────────────────────────────
insert into public.amt (key, label, abbr, sort_order, display_only, cluster) values
  ('vize2', '2. Vizepräsident(in)', '2.VP', 21, true, 'weiterer_vorstand')
on conflict (key) do nothing;

-- (3) ─────────────────────────────────────────────────────────────────────────
create table public.praesident_chronik (
  lions_year int primary key check (lions_year between 1950 and 2100),
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

comment on table public.praesident_chronik is
  'Präsidenten früherer Lions-Jahre, die nicht (mehr) als Mitglied geführt werden. '
  'Präsidenten mit member-Zeile stehen in member_amt.';
comment on column public.praesident_chronik.lions_year is
  'Startjahr des Lions-Jahres (2004 = 2004/05).';

alter table public.praesident_chronik enable row level security;

create policy praesident_chronik_select on public.praesident_chronik
  for select to authenticated
  using (public.current_member_id() is not null);

create policy praesident_chronik_write on public.praesident_chronik
  for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

revoke all on public.praesident_chronik from anon;
grant select, insert, update, delete on public.praesident_chronik to authenticated;
