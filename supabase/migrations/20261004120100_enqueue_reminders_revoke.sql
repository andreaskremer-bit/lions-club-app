-- Security-Scan 2026-10-04 (F1): enqueue_due_reminders() ist SECURITY DEFINER und war
-- über PostgREST für anon UND authenticated aufrufbar (POST /rest/v1/rpc/…). Weil
-- p_today frei wählbar ist und in den Dedupe-Schlüssel eingeht, ließ sich mit jedem
-- neuen Datum ein neuer Satz Geburtstags-/Termin-Benachrichtigungen für alle Mitglieder
-- erzeugen – und send-notifications hätte sie als Push/E-Mail verschickt.
--
-- `revoke … from public` allein reicht in Supabase nicht: die Default-Privilegien
-- vergeben EXECUTE auf neue Funktionen im Schema public zusätzlich direkt an anon,
-- authenticated und service_role. Deshalb alle drei App-Rollen explizit.
--
-- Aufrufer danach: pg_cron (läuft als postgres = Owner) und die Admin-Route
-- /api/admin/reminders/run (Service-Key = service_role).

revoke execute on function public.enqueue_due_reminders(date) from public, anon, authenticated;
grant execute on function public.enqueue_due_reminders(date) to service_role;
