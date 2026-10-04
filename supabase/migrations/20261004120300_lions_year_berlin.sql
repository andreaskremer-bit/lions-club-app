-- Security-Scan 2026-10-04 (F7): Lions-Jahr unabhängig von der Sitzungs-Zeitzone.
--
-- current_lions_year() rechnete mit current_date, und das folgt der Zeitzone der
-- Sitzung. Die setzt ein PostgREST-Client pro Anfrage selbst (Header
-- `Prefer: timezone=…`). Rund um den 1. Juli konnte ein Aufrufer so wählen, welches
-- Lions-Jahr für has_permission() gilt – ausscheidende Amtsträger behielten ihre Rechte
-- bis zu ~12 Stunden länger, neue bekamen sie früher.
--
-- Jetzt fest Europe/Berlin (wie der 09:00-Tageslauf und lionsStartYear() im Client, der
-- mit der Gerätezeit der Mitglieder rechnet). Der Kern liegt in lions_year_at(), damit
-- sich der Jahreswechsel mit festem Zeitpunkt testen lässt.

create or replace function public.lions_year_at(p_at timestamptz)
returns int
language sql
immutable
set search_path = public
as $$
  select case
    when extract(month from (p_at at time zone 'Europe/Berlin')) >= 7
      then extract(year from (p_at at time zone 'Europe/Berlin'))::int
    else extract(year from (p_at at time zone 'Europe/Berlin'))::int - 1
  end;
$$;

create or replace function public.current_lions_year()
returns int
language sql
stable
set search_path = public
as $$
  select public.lions_year_at(now());
$$;
