-- Einladungs-Mail (2026-10-07): Das Anlegen des Login-Kontos verschickt keine Mail.
-- Die Edge Function `send-invite` schickt sie jetzt ausdrücklich und vermerkt hier den
-- Zeitpunkt – so zeigt die Mitgliederseite, ob und wann eine Einladung rausging.
-- NULL = noch keine Einladungs-Mail verschickt (auch bei allen vor diesem Tag
-- angelegten Konten, die damals ohne Mail freigeschaltet wurden).

alter table public.member add column invite_sent_at timestamptz;

comment on column public.member.invite_sent_at is
  'Zeitpunkt der letzten Einladungs-Mail (Edge Function send-invite); NULL = nie verschickt.';

-- Spaltenschutz: invite_sent_at ist ein Systemfeld wie die Login-Daten. Fassung aus
-- 20261004120600, erweitert um invite_sent_at.
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
     or lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, '')) then
    raise exception
      'Geschützte Felder (Status, E-Mail, Konto, Mitgliedsnummer) dürfen nur durch berechtigte Ämter geändert werden.';
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
