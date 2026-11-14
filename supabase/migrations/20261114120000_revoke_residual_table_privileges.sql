-- Restrechte von anon/authenticated auf den Tabellen in public entfernen.
--
-- Supabase vergibt für neue Tabellen standardmäßig TRUNCATE, REFERENCES, TRIGGER
-- und MAINTAIN an anon und authenticated. Gebraucht wird davon nichts: die App
-- arbeitet nur mit SELECT/INSERT/UPDATE/DELETE, die je Tabelle ausdrücklich
-- vergeben sind.
--
-- Erreichbar war das bisher nicht (PostgREST kennt kein TRUNCATE, die anderen
-- drei brauchen DDL bzw. Wartungsbefehle). TRUNCATE umgeht aber RLS und die
-- Zeilen-Trigger (z. B. keep_role_manager, event_guard_attendance) – der Schutz
-- der Daten hing an dieser Stelle an der API-Schicht statt an der Datenbank.
--
-- service_role bleibt unverändert (Server-Routen und Edge Functions).

revoke truncate, references, trigger, maintain
  on all tables in schema public
  from anon, authenticated;

-- Gilt auch für künftige Tabellen: Migrationen laufen als postgres, dessen
-- Default-Rechte hier angepasst werden. Neue Tabellen bekommen damit für
-- anon/authenticated gar nichts mehr automatisch – wie bisher vergibt jede
-- Migration die nötigen Rechte ausdrücklich.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger, maintain on tables from anon, authenticated;
