-- Datensparsamkeit (Review 2026-10-22, Befund 9): Die RLS auf member prüft nur, OB
-- jemand Clubmitglied ist – nicht WELCHE Spalten er liest. Damit konnte jedes Mitglied
-- über die API Login-Zeiten, Einladungsdatum und App-Nutzung (installiert/Browser)
-- aller anderen auslesen. Diese Felder sind jetzt per Spaltenrecht für `authenticated`
-- gesperrt, auch in der eigenen Zeile. Die Mitgliederverwaltung bekommt Login- und
-- Einladungsdatum über member_access_info(); Telemetrie bleibt SQL-Auswertungen
-- vorbehalten. Edge Functions (service_role) und security-definer-Funktionen
-- (Login-Tracking, track_display_mode) sind nicht betroffen.
--
-- ACHTUNG für künftige Migrationen: Eine neue member-Spalte ist für die App erst
-- lesbar, wenn sie hier ausdrücklich per `grant select (spalte)` freigegeben wird.
-- Der pgTAP-Test member_column_privileges_test.sql erzwingt die Entscheidung.

revoke select on public.member from authenticated;

grant select (
  id, user_id, email, first_name, last_name, title, status,
  phone, phone_office, mobile, street, zip, city, photo_path,
  birthday, joined_on, lions_member_no,
  partner_title, partner_first_name, partner_last_name, partner_birthday,
  partner_birthday_show_age, partner_email, partner_mobile,
  notifications_enabled, notification_channel,
  created_at, updated_at
) on public.member to authenticated;

-- Gesperrt (kein grant): first_login_at, last_login_at, invite_sent_at,
-- first_standalone_at, last_standalone_at, last_browser_at, notes.

-- Zugangsstatus für die Profilseite, nur mit manage_members.
create or replace function public.member_access_info(p_member_id uuid)
returns table (first_login_at timestamptz, last_login_at timestamptz, invite_sent_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_permission('manage_members') then
    raise exception 'Keine Berechtigung' using errcode = '42501';
  end if;
  return query
    select m.first_login_at, m.last_login_at, m.invite_sent_at
    from public.member m
    where m.id = p_member_id;
end;
$$;

comment on function public.member_access_info(uuid) is
  'Login- und Einladungsdatum eines Mitglieds; nur für manage_members (Spalten sind sonst gesperrt).';

-- Supabase vergibt EXECUTE per Default direkt an anon/authenticated –
-- revoke from public allein reicht nicht.
revoke all on function public.member_access_info(uuid) from public, anon;
grant execute on function public.member_access_info(uuid) to authenticated;
