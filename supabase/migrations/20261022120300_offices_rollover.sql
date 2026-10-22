-- Ämter-Jahreswechsel ohne Lockout (Rollen-Durchgang 2026-10-22, A1).
--
-- Rechte zählen nur im aktuellen Lions-Jahr (has_permission). Die Übernahme ins
-- Folgejahr lief nur EINMAL beim Einspielen von 20260620120500 – für 2027/28 war am
-- 2026-10-22 kein einziges Amt eingetragen. Ohne Eintrag hätte am 1.7.2027 niemand
-- mehr manage_roles gehabt, und Ämter wären nur noch per SQL zu vergeben gewesen.
--
-- 1) rollover_offices(): Ist das aktuelle LJ leer, werden die Ämter des Vorjahres
--    übernommen. Stündlich geprüft (No-op, sobald das LJ besetzt ist) – so greift es
--    kurz nach Mitternacht am 1.7. in Berliner Zeit, egal ob Sommer- oder Winterzeit.
-- 2) Sperre: Im aktuellen LJ muss mindestens eine Person manage_roles behalten. Sonst
--    könnte sich der Sekretär versehentlich selbst aussperren (oder sein Konto wird
--    gelöscht), und niemand vergibt mehr Ämter.

create or replace function public.rollover_offices(p_now timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year     int := public.lions_year_at(p_now);
  v_inserted integer;
begin
  if exists (select 1 from public.member_amt where lions_year = v_year) then
    return 0;
  end if;
  insert into public.member_amt (member_id, amt_id, lions_year, since)
  select member_id, amt_id, v_year, since
  from public.member_amt
  where lions_year = v_year - 1
  on conflict do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

revoke execute on function public.rollover_offices(timestamptz) from public, anon, authenticated;

do $$
begin
  perform cron.unschedule('offices-rollover');
exception when others then null;
end $$;

select cron.schedule('offices-rollover', '7 * * * *', $cron$
  select public.rollover_offices();
$cron$);

-- 2) Letzte Person mit manage_roles im aktuellen LJ nicht entfernen.
create or replace function public.keep_role_manager()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := public.current_lions_year();
begin
  if old.lions_year <> v_year then
    return null;
  end if;
  if not exists (
    select 1 from public.amt_permission
    where amt_id = old.amt_id and permission = 'manage_roles'
  ) then
    return null;
  end if;
  if not exists (
    select 1
    from public.member_amt ma
    join public.amt_permission ap on ap.amt_id = ma.amt_id
    where ma.lions_year = v_year
      and ap.permission = 'manage_roles'
  ) then
    raise exception 'Mindestens eine Person muss im laufenden Lions-Jahr Ämter vergeben dürfen (Sekretär oder Webmaster). Trage zuerst die Nachfolge ein.'
      using errcode = 'P0001';
  end if;
  return null;
end;
$$;

create trigger member_amt_keep_role_manager
  after delete or update on public.member_amt
  for each row execute function public.keep_role_manager();
