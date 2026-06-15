-- Edge Functions laufen als service_role. Der RLS-Bypass ersetzt NICHT die
-- Tabellen-Grants — die wurden bei diesen Tabellen bisher nur an `authenticated`
-- vergeben. Ohne diese Grants schlägt z. B. extract-document-text mit
-- "permission denied for table document" (42501) fehl.

grant select, insert, update, delete on public.document to service_role;
grant select, update, delete on public.notification to service_role;
grant select, insert, update, delete on public.push_subscription to service_role;
