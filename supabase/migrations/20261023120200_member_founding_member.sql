-- Gründungsmitglied (2026-10-23): Lions Deutschland vermerkt es bei den Mitgliedern
-- der Gründung 1993; das Profil zeigt einen Hinweis. Stammdatum wie die
-- Mitgliedsnummer: lesbar für alle Mitglieder, änderbar nur mit edit_member_master.

alter table public.member add column founding_member boolean not null default false;

comment on column public.member.founding_member is
  'Gründungsmitglied des Clubs (1993); nur Anzeige im Profil.';

-- Spaltenrechte (20261022120200): neue member-Spalten ausdrücklich freigeben.
grant select (founding_member) on public.member to authenticated;

-- Fassung aus 20261023120000, erweitert um founding_member.
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
     or new.founding_member is distinct from old.founding_member
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
