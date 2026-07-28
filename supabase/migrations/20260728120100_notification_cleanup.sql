-- Benachrichtigungen automatisch aufräumen (2026-07-28).
--
-- Die Outbox `notification` wuchs bisher unbegrenzt: Mitglieder haben bewusst
-- kein Delete-Recht, und einen Aufräum-Job gab es nicht — die In-App-Liste wird
-- über die Zeit beliebig lang. ENTSCHIEDEN (2026-07-28): kein manuelles Löschen
-- in der App, stattdessen serverseitige Bereinigung (Datenminimierung):
--   * gelesene Benachrichtigungen nach 30 Tagen
--   * alle übrigen (auch nie gelesene) nach 90 Tagen
-- Die Zustellung (Edge Function) verarbeitet Zeilen binnen Minuten; die Fristen
-- liegen weit darüber, ein Konflikt mit dem Versand ist ausgeschlossen.

create or replace function public.cleanup_notifications(p_now timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.notification
  where (read_at is not null and created_at < p_now - interval '30 days')
     or created_at < p_now - interval '90 days';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Nur Cron/Service räumen auf — kein RPC-Aufruf durch App-Rollen.
revoke execute on function public.cleanup_notifications(timestamptz) from public, anon, authenticated;

-- Täglicher Lauf, idempotent (re)geplant. Die Uhrzeit ist unkritisch (reine
-- Hygiene), daher fester UTC-Slot statt des Berlin-Gates der Reminder-Jobs.
do $$
begin
  perform cron.unschedule('notifications-cleanup');
exception when others then null;
end $$;

select cron.schedule('notifications-cleanup', '30 2 * * *', $cron$
  select public.cleanup_notifications();
$cron$);
