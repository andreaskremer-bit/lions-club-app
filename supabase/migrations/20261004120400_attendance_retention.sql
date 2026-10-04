-- Anwesenheitsdaten nach zwei Lions-Jahren löschen (Entscheidung 2026-10-04).
--
-- Die Anwesenheit dient nur der Abwesenheitsspende: Der Schatzmeister wertet zu Beginn
-- eines Lions-Jahres das abgeschlossene Vorjahr aus und zieht die Spenden ein. Ältere
-- Zeilen braucht niemand mehr (Datenminimierung). Es bleiben immer das laufende und das
-- abgeschlossene Vorjahr vollständig erhalten; gelöscht wird, was zu Terminen VOR dem
-- 1. Juli des Vorjahres gehört. Termine selbst bleiben bestehen.

create or replace function public.cleanup_attendance(p_now timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cutoff  timestamptz;
  v_deleted integer;
begin
  -- 1. Juli 00:00 Berliner Zeit des abgeschlossenen Vorjahres.
  v_cutoff := make_timestamptz(public.lions_year_at(p_now) - 1, 7, 1, 0, 0, 0, 'Europe/Berlin');
  delete from public.attendance a
  using public.event e
  where e.id = a.event_id
    and e.starts_at < v_cutoff;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- Nur Cron/Service räumen auf – kein RPC-Aufruf durch App-Rollen (Supabase vergibt
-- EXECUTE sonst direkt an anon/authenticated, vgl. 20261004120100).
revoke execute on function public.cleanup_attendance(timestamptz) from public, anon, authenticated;

-- Monatlich am 1. um 03:15 UTC, idempotent (re)geplant.
do $$
begin
  perform cron.unschedule('attendance-cleanup');
exception when others then null;
end $$;

select cron.schedule('attendance-cleanup', '15 3 1 * *', $cron$
  select public.cleanup_attendance();
$cron$);
