-- Erfasst, ob ein Mitglied die App als installierte PWA (Homescreen) oder im
-- Browser-Tab öffnet.
--
-- Warum: bislang war das nur indirekt über `push_subscription` zu raten (ein
-- Apple-Endpunkt setzt auf iOS eine Installation voraus). Das übersieht alle,
-- die installiert haben ohne Push zu aktivieren, und kann macOS-Safari nicht
-- vom iPhone unterscheiden. Der Browser selbst weiß es dagegen genau:
-- `display-mode: standalone` trifft genau dann zu, wenn die App aus dem
-- Homescreen heraus läuft.
--
-- Drei Spalten statt einer, damit „hat sich noch nie gemeldet" von „meldet sich,
-- aber aus dem Browser" unterscheidbar bleibt. Direkt nach dem Rollout hat noch
-- niemand gemeldet — das ist kein Nutzungsbefund, sondern fehlende Datenlage.
-- Belastbar „nutzt die App im Browser" heißt erst:
--   last_browser_at is not null and last_standalone_at is null

alter table public.member
	add column if not exists first_standalone_at timestamptz,
	add column if not exists last_standalone_at timestamptz,
	add column if not exists last_browser_at timestamptz;

comment on column public.member.first_standalone_at is
	'Erster App-Start aus einer installierten PWA (Homescreen). NULL = nie als installierte App gestartet.';
comment on column public.member.last_standalone_at is
	'Letzter App-Start aus einer installierten PWA (Homescreen).';
comment on column public.member.last_browser_at is
	'Letzter App-Start in einem normalen Browser-Tab (nicht installiert). Trennt „nie gemeldet" von „nutzt den Browser".';

-- security definer: spart eine breite UPDATE-Policy auf `member`. Ein Mitglied
-- darf seine eigene Zeile sonst nicht schreiben, und genau so soll es bleiben —
-- die Funktion schreibt ausschließlich die drei Telemetriespalten und
-- ausschließlich für die AUFRUFENDE Person. Die member-ID kommt aus
-- current_member_id() (also aus dem JWT), nie aus einem Aufrufparameter:
-- fremde Zeilen sind damit prinzipiell unerreichbar.
create or replace function public.track_display_mode(standalone boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
	mid uuid := public.current_member_id();
begin
	-- Konto ohne verknüpfte member-Zeile: still aussteigen, kein Fehler.
	-- Der Aufruf ist reine Telemetrie und darf den App-Start nie stören.
	if mid is null then
		return;
	end if;

	if standalone then
		update public.member
		   set first_standalone_at = coalesce(first_standalone_at, now()),
		       last_standalone_at = now()
		 where id = mid;
	else
		update public.member
		   set last_browser_at = now()
		 where id = mid;
	end if;
end;
$$;

comment on function public.track_display_mode(boolean) is
	'Vermerkt beim App-Start, ob die aufrufende Person die installierte PWA oder den Browser nutzt.';

revoke all on function public.track_display_mode(boolean) from public;
grant execute on function public.track_display_mode(boolean) to authenticated;
