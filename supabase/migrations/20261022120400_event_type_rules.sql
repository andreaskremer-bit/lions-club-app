-- Termin-Regeln aus dem Rollen-Durchgang 2026-10-22 (A3, B4).

-- A3) Erfasste Anwesenheit ist die Grundlage der Abwesenheitsspende. Mit manage_events
-- allein (Clubmaster) ließ sich ein Termin mit erfasster Anwesenheit löschen – die
-- Zeilen fielen per Cascade weg – oder im Typ ändern, womit er still aus der
-- Auswertung verschwand (donation_required ist aus dem Typ abgeleitet). Beides
-- verlangt jetzt zusätzlich record_attendance. Ohne JWT (Cron, SQL-Konsole) keine Sperre.
create or replace function public.guard_event_with_attendance()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.has_permission('record_attendance') then
    return coalesce(new, old);
  end if;
  if tg_op = 'UPDATE' and new.type is not distinct from old.type then
    return new;
  end if;
  if exists (select 1 from public.attendance where event_id = old.id) then
    raise exception 'Für diesen Termin ist Anwesenheit erfasst. Löschen oder Typ ändern darf nur, wer Anwesenheit erfassen darf.'
      using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger event_guard_attendance
  before delete or update of type on public.event
  for each row execute function public.guard_event_with_attendance();

-- B4) Typwechsel auf einen Typ ohne Begleitung (MV, Lions-Termin): Angemeldete
-- Begleitpersonen zählten weiter in „Zugesagt“ und standen in der Teilnehmerliste, das
-- Mitglied konnte sie aber weder sehen noch entfernen (RLS verlangt companion_allowed).
-- Jetzt werden sie mit dem Typwechsel entfernt (ihre Antworten per Cascade).
create or replace function public.drop_companions_when_disallowed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.companion_allowed and not new.companion_allowed then
    delete from public.companion c
    using public.event_response r
    where r.id = c.event_response_id
      and r.event_id = new.id;
  end if;
  return null;
end;
$$;

create trigger event_drop_companions
  after update of type on public.event
  for each row execute function public.drop_companions_when_disallowed();

-- B2) Zusatzfragen: Die eigene Antwort setzt eine Zusage voraus. Bisher ließ sich ohne
-- Rückmeldung antworten – das Mitglied hielt sich für angemeldet, zählte aber weiter
-- als „offen“, und die Antwort tauchte in keiner Teilnehmerliste auf. Antworten für
-- Begleitpersonen bleiben auch nach eigener Absage möglich (Entscheidung 2026-10-04).
create or replace function public.may_answer(p_question uuid, p_companion uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (select e.starts_at from public.question q join public.event e on e.id = q.event_id
      where q.id = p_question) > now()
    and (
      (
        p_companion is null
        and exists (
          select 1
          from public.event_response r
          join public.question q on q.id = p_question
          where r.event_id = q.event_id
            and r.member_id = public.current_member_id()
            and r.status = 'zugesagt'
        )
      )
      or exists (
        select 1
        from public.companion c
        join public.event_response r on r.id = c.event_response_id
        join public.question q on q.id = p_question
        where c.id = p_companion
          and r.member_id = public.current_member_id()
          and r.event_id = q.event_id
      )
    );
$$;

-- Zu A3: Wie viele Anwesenheiten sind erfasst? Damit die Bearbeiten-Seite vorab sagen
-- kann, warum Löschen/Typwechsel gesperrt sind – manage_events allein darf attendance
-- nicht lesen (Spendengrundlage). Liefert nur die Anzahl, keine Namen.
create or replace function public.event_attendance_count(p_event uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (public.has_permission('manage_events') or public.has_permission('record_attendance')) then
    raise exception 'Keine Berechtigung' using errcode = '42501';
  end if;
  return (select count(*)::int from public.attendance where event_id = p_event);
end;
$$;

revoke all on function public.event_attendance_count(uuid) from public, anon;
grant execute on function public.event_attendance_count(uuid) to authenticated;
