-- M1 — RLS-Policies. Permissive Policies werden je Kommando OR-verknüpft.

-- ── member ──────────────────────────────────────────────────────────────────
-- Verzeichnis: jedes eingeloggte Mitglied liest alle Stammdaten (clubintern).
create policy member_select_authenticated
  on public.member for select
  to authenticated
  using (true);

-- Selbstpflege: eigene Zeile bearbeiten (Spaltenschutz via Trigger unten).
create policy member_update_self
  on public.member for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Fremde Stammdaten pflegen (Präsident/Vize/Sekretär/Webmaster).
create policy member_update_privileged
  on public.member for update
  to authenticated
  using (public.has_permission('edit_member_master'))
  with check (public.has_permission('edit_member_master'));

-- Neumitglieder anlegen (Sekretär/Webmaster).
create policy member_insert_privileged
  on public.member for insert
  to authenticated
  with check (public.has_permission('manage_members'));

-- Mitglieder löschen (Webmaster).
create policy member_delete_privileged
  on public.member for delete
  to authenticated
  using (public.has_permission('delete_member'));

-- Spaltenschutz: bei Selbstpflege dürfen Status / Konto / E-Mail NICHT geändert
-- werden — nur berechtigte Ämter (edit_member_master) dürfen das.
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
     or lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, '')) then
    raise exception
      'Geschützte Felder (Status, E-Mail, Konto) dürfen nur durch berechtigte Ämter geändert werden.';
  end if;
  return new;
end;
$$;

create trigger member_protect_columns
  before update on public.member
  for each row execute function public.protect_member_columns();

-- ── amt / amt_permission / member_amt ────────────────────────────────────────
-- Lesen für alle eingeloggten Mitglieder; Schreiben nur mit manage_roles.
create policy amt_select_authenticated
  on public.amt for select to authenticated using (true);
create policy amt_write_privileged
  on public.amt for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

create policy amt_permission_select_authenticated
  on public.amt_permission for select to authenticated using (true);
create policy amt_permission_write_privileged
  on public.amt_permission for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));

create policy member_amt_select_authenticated
  on public.member_amt for select to authenticated using (true);
create policy member_amt_write_privileged
  on public.member_amt for all to authenticated
  using (public.has_permission('manage_roles'))
  with check (public.has_permission('manage_roles'));
