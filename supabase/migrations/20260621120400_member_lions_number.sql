-- Mitglieder-Feld: Lions-Mitgliedsnummer (von Lions Deutschland/International vergeben).
-- Text, weil führende Nullen vorkommen können. Stammdatum → wie Status nur durch
-- berechtigte Ämter (edit_member_master) änderbar, nicht in der Selbstpflege.

alter table public.member add column lions_member_no text;

comment on column public.member.lions_member_no is
  'Von Lions vergebene Mitgliedsnummer; nur durch edit_member_master änderbar.';

-- Spaltenschutz erweitern: Mitgliedsnummer in der Selbstpflege sperren.
create or replace function public.protect_member_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Kein eingeloggter Nutzer (System-Trigger/service_role) oder berechtigtes Amt:
  -- Spaltenschutz greift nur bei Selbstpflege durch eingeloggte Mitglieder.
  if auth.uid() is null or public.has_permission('edit_member_master') then
    return new;
  end if;
  if new.status   is distinct from old.status
     or new.user_id is distinct from old.user_id
     or new.lions_member_no is distinct from old.lions_member_no
     or lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, '')) then
    raise exception
      'Geschützte Felder (Status, E-Mail, Konto, Mitgliedsnummer) dürfen nur durch berechtigte Ämter geändert werden.';
  end if;
  return new;
end;
$$;
