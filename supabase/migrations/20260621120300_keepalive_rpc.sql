-- KeepAlive-RPC: minimaler, anon-aufrufbarer DB-Roundtrip für den externen
-- GitHub-Action-Ping (Supabase Free pausiert sonst nach 7 Tagen ohne Aktivität).
-- Gibt nur die Uhrzeit zurück — KEIN Tabellen-/Datenzugriff, kein Leak. Geht aber
-- bis Postgres durch (echte DB-Aktivität) und liefert sauberes 200 via
-- POST /rest/v1/rpc/keepalive. Anders als /auth/v1/health (nur Gateway/Auth)
-- nimmt das die Frage „zählt als DB-Aktivität?" endgültig vom Tisch.

create or replace function public.keepalive()
returns timestamptz
language sql
security definer
set search_path = public
as $$
  select now();
$$;

comment on function public.keepalive() is
  'Externer Keep-alive-Ping (GitHub Action). Liefert now(); kein Datenzugriff.';

-- Aufrufbar für anon (der Action-Ping nutzt den Publishable-/Anon-Key).
grant execute on function public.keepalive() to anon;
