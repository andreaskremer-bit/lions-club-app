-- Go-live-Feinschliff (2026-07-16): automatischer Trigger für Benachrichtigungen.
--
-- Vorher lief auf Prod KEIN Automatismus (pg_cron/pg_net waren nicht installiert),
-- d. h. der Tageslauf feuerte nie von allein und die Outbox wurde nie zugestellt.
-- Diese Migration aktiviert die Extensions und legt zwei Cron-Jobs an:
--
--   1) 'reminders-daily'      stündlich, feuert real nur um 09:00 Berlin
--                             -> enqueue_due_reminders() (Termin-Reminder + Geburtstage)
--   2) 'send-notifications'   alle 15 min -> Edge Function send-notifications
--
-- ZEIT: pg_cron rechnet in UTC und kennt keine Sommerzeit — ein fester UTC-Offset
-- kann "immer 09:00 Berlin" NICHT liefern (Berlin wechselt UTC+1/UTC+2). Deshalb
-- läuft der Tages-Job stündlich und erledigt den Insert nur, wenn es in
-- 'Europe/Berlin' gerade 09 Uhr ist (DST-korrekt). enqueue ist idempotent, ein
-- zusätzlicher Lauf wäre ohnehin folgenlos.
--
-- KEIN Secret / keine projektspezifische URL in dieser (committeten, öffentlichen)
-- Datei: der Sende-Job liest URL und Service-Token zur Laufzeit aus dem Supabase
-- Vault (verschlüsselt). Der pooled `postgres`-Rolle fehlt das Recht für
-- `alter database ... set`, deshalb Vault statt DB-Settings.
--
-- EINMALIG (uncommitted, nur Produktion) VOR/nach dieser Migration setzen:
--   select vault.create_secret('https://<ref>.functions.supabase.co/send-notifications',
--                              'edge_send_url',   'Ziel der Reminder-Zustellung');
--   select vault.create_secret('<service_role_key>',
--                              'edge_send_token', 'Bearer-Token für send-notifications');
-- Fehlen die Vault-Einträge (z. B. lokal/Dev), wird der Sende-Job NICHT angelegt.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotent (re)schedule: bestehende Jobs gleichen Namens zuerst lösen.
do $$
begin
  perform cron.unschedule('reminders-daily');
exception when others then null;
end $$;

do $$
begin
  perform cron.unschedule('send-notifications');
exception when others then null;
end $$;

-- 1) Tageslauf: fällige Reminder erzeugen (Termin-Reminder + Geburtstage,
--    s. 20260716120100). Stündlich geplant, aber nur um 09:00 Berlin (DST-korrekt)
--    tatsächlich ausgeführt.
select cron.schedule('reminders-daily', '0 * * * *', $cron$
  select case
    when to_char(now() at time zone 'Europe/Berlin', 'HH24') = '09'
    then public.enqueue_due_reminders()
  end;
$cron$);

-- 2) Outbox alle 15 Minuten zustellen — nur wenn URL + Token im Vault liegen
--    (sonst gar kein Job -> lokal/Dev feuert nichts an Produktion). Die Edge
--    Function respektiert zusätzlich REMINDERS_ARMED (Dry-Run bis scharfgestellt).
do $$
begin
  if exists (select 1 from vault.secrets where name = 'edge_send_url')
     and exists (select 1 from vault.secrets where name = 'edge_send_token') then
    -- timeout_milliseconds hochgesetzt: pg_net-Default 5 s reicht für Deno-Cold-Starts
    -- der Edge Function (npm-Imports) nicht -> sonst Timeout, obwohl die Function läuft.
    perform cron.schedule('send-notifications', '*/15 * * * *', $cron$
      select net.http_post(
        url     := (select decrypted_secret from vault.decrypted_secrets where name = 'edge_send_url'),
        headers := jsonb_build_object(
                     'Content-Type', 'application/json',
                     'Authorization', 'Bearer ' ||
                       (select decrypted_secret from vault.decrypted_secrets where name = 'edge_send_token')),
        body    := '{}'::jsonb,
        timeout_milliseconds := 30000
      );
    $cron$);
  end if;
end $$;
