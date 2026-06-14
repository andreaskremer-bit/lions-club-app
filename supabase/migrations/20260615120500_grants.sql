-- M1 — Tabellen-Rechte für die Rolle `authenticated`.
-- RLS gilt erst, wenn die Rolle überhaupt DML-Recht hat; die Zeilen-Filterung
-- übernehmen die Policies (20260615120400_rls_policies.sql).
-- `anon` (nicht eingeloggt) erhält bewusst KEINEN Zugriff auf Mitgliederdaten.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.member         to authenticated;
grant select, insert, update, delete on public.amt            to authenticated;
grant select, insert, update, delete on public.amt_permission to authenticated;
grant select, insert, update, delete on public.member_amt     to authenticated;
