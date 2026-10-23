-- Förderverein, Ämter-Übernahme je Verein, Chronik-Schutz beim Löschen und
-- Juni-Hinweis zum neuen Vorstand (User-Entscheidungen 2026-10-23).
--
-- (1) Ämter des Lions-Förderverein Bonn-Rheinaue e.V. als eigener Cluster. Nur Anzeige
--     (display_only, keine amt_permission): Der Förderverein ist ein eigener Verein,
--     seine Ämter geben in der App keine Rechte. Die Historie kommt wie die Clubämter
--     aus dem Lions-Deutschland-Portal (Einträge „…/HLC“).
-- (2) rollover_offices() prüft Club und Förderverein getrennt. Bisher galt: Steht im
--     neuen Lions-Jahr irgendein Amt, wird nichts übernommen. Trägt der Sekretär den
--     neuen Clubvorstand im Juni vorab ein, fiele der Förderverein-Vorstand (eigene
--     Wahl, meist mehrjährig) sonst am 1.7. weg.
-- (3) Löschen eines Mitglieds: Präsidentenjahre wandern mit Namen in die
--     praesident_chronik, bevor member_amt per Cascade verschwindet. Die übrigen Ämter
--     gehen bewusst mit verloren (Löschen heißt Löschen); wer nur ausscheidet, wird
--     auf „inaktiv“ gesetzt und behält seine Historie.
-- (4) enqueue_due_reminders(): am 1., 15. und 25. Juni ein Hinweis an alle mit
--     manage_roles, solange für das kommende Lions-Jahr kein Clubamt eingetragen ist.
--     Sonst übernimmt die App am 1.7. den alten Vorstand, und die Historie zeigte ihn
--     auch für das neue Jahr.

-- (1) ─────────────────────────────────────────────────────────────────────────
insert into public.amt (key, label, abbr, sort_order, display_only, cluster) values
  ('fv_vorsitz',        'Vorsitzende(r)',      'FV-V',   200, true, 'foerderverein'),
  ('fv_stv_vorsitz',    'Stv. Vorsitzende(r)', 'FV-stV', 210, true, 'foerderverein'),
  ('fv_schatzmeister',  'Schatzmeister(in)',   'FV-SCH', 220, true, 'foerderverein'),
  ('fv_schriftfuehrer', 'Schriftführer(in)',   'FV-SF',  230, true, 'foerderverein')
on conflict (key) do nothing;

-- (2) ─────────────────────────────────────────────────────────────────────────
-- Fassung aus 20261022120300, je Verein getrennt.
create or replace function public.rollover_offices(p_now timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year  int := public.lions_year_at(p_now);
  v_total integer := 0;
  v_rows  integer;
  v_fv    boolean;
begin
  foreach v_fv in array array[false, true] loop
    if exists (
      select 1 from public.member_amt ma join public.amt a on a.id = ma.amt_id
      where ma.lions_year = v_year
        and (a.cluster is not distinct from 'foerderverein') = v_fv
    ) then
      continue;
    end if;
    insert into public.member_amt (member_id, amt_id, lions_year, since)
    select ma.member_id, ma.amt_id, v_year, ma.since
    from public.member_amt ma join public.amt a on a.id = ma.amt_id
    where ma.lions_year = v_year - 1
      and (a.cluster is not distinct from 'foerderverein') = v_fv
    on conflict do nothing;
    get diagnostics v_rows = row_count;
    v_total := v_total + v_rows;
  end loop;
  return v_total;
end;
$$;

revoke execute on function public.rollover_offices(timestamptz) from public, anon, authenticated;

-- (3) ─────────────────────────────────────────────────────────────────────────
create or replace function public.keep_president_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.praesident_chronik (lions_year, name)
  select ma.lions_year, old.first_name || ' ' || old.last_name
  from public.member_amt ma
  join public.amt a on a.id = ma.amt_id and a.key = 'praesident'
  where ma.member_id = old.id
  on conflict (lions_year) do nothing;
  return old;
end;
$$;

revoke execute on function public.keep_president_history() from public, anon, authenticated;

-- BEFORE: Die Cascade auf member_amt läuft erst danach, die Präsidentenjahre sind
-- hier noch lesbar.
create trigger member_keep_president_history
  before delete on public.member
  for each row execute function public.keep_president_history();

-- (4) ─────────────────────────────────────────────────────────────────────────
-- Fassung aus 20261022120800 + Vorstand-Hinweis.
create or replace function public.enqueue_due_reminders(
  p_today date default (now() at time zone 'Europe/Berlin')::date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_at timestamptz := case
    when p_today = (now() at time zone 'Europe/Berlin')::date then now()
    else (p_today + time '09:00') at time zone 'Europe/Berlin'
  end;
  v_next int := extract(year from p_today)::int; -- im Juni beginnt das nächste LJ im selben Kalenderjahr
begin
  insert into public.notification (kind, recipient_id, event_id, for_date, title, body)
  select 'event_reminder'::public.notification_kind, m.id, e.id, p_today,
         'Rückmeldung fehlt: ' || e.title,
         'Bitte sage zu oder ab.'
  from public.event e
  join public.member m
    on m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
  where ((e.starts_at at time zone 'Europe/Berlin')::date - p_today)
          between 0 and e.reminder_days_before
    and e.starts_at > v_at
    and not exists (
      select 1 from public.event_response r where r.event_id = e.id and r.member_id = m.id
    )
    and not exists (
      select 1 from public.notification n
      where n.kind = 'event_reminder' and n.event_id = e.id and n.recipient_id = m.id
    )
  on conflict do nothing;

  insert into public.notification (kind, recipient_id, subject_member_id, for_date, title)
  select 'birthday'::public.notification_kind, r.id, b.id, p_today,
         'Geburtstag: ' || coalesce(b.title || ' ', '') || b.first_name || ' ' || b.last_name
  from public.member b
  join public.member r
    on r.status = 'aktiv' and r.notifications_enabled and r.user_id is not null
   and r.id <> b.id
  where b.birthday is not null
    and extract(month from b.birthday) = extract(month from p_today)
    and extract(day from b.birthday) = extract(day from p_today)
  on conflict do nothing;

  if extract(month from p_today) = 6
     and extract(day from p_today) in (1, 15, 25)
     and not exists (
       select 1 from public.member_amt ma join public.amt a on a.id = ma.amt_id
       where ma.lions_year = v_next
         and a.cluster is distinct from 'foerderverein'
     ) then
    insert into public.notification (kind, recipient_id, for_date, title, body)
    select distinct 'board_missing'::public.notification_kind, m.id, p_today,
           'Vorstand ' || v_next || '/' || lpad(((v_next + 1) % 100)::text, 2, '0')
             || ' noch nicht eingetragen',
           'Trag die Ämter für das kommende Lions-Jahr ein. Sonst übernimmt die App am '
             || '1. Juli den bisherigen Vorstand – auch in die Ämter-Historie.'
    from public.member m
    join public.member_amt ma on ma.member_id = m.id and ma.lions_year = v_next - 1
    join public.amt_permission ap on ap.amt_id = ma.amt_id and ap.permission = 'manage_roles'
    where m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
    on conflict do nothing;
  end if;
end;
$$;

revoke execute on function public.enqueue_due_reminders(date) from public, anon, authenticated;
grant execute on function public.enqueue_due_reminders(date) to service_role;
