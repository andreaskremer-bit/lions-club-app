-- service_role hatte auf `member` bisher keinen Grant (nur `authenticated`), weil
-- die App member nie direkt als service_role über PostgREST liest — die Reminder-
-- Route prüft Rechte per Nutzer-Session und nutzt service_role nur für die
-- SECURITY-DEFINER-RPC. Für serverseitige Admin-Aufgaben (Daten-Import, künftiger
-- Außen-Versand der Edge Function: member.email / notifications_enabled) wird
-- lesender + aktualisierender Zugriff benötigt. Minimal: kein insert/delete
-- (Neuanlage/Löschung bleibt der Nutzer-Session mit RLS vorbehalten).

grant select, update on public.member to service_role;
