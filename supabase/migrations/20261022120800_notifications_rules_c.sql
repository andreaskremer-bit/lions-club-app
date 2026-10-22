-- Gruppe C aus dem Rollen-Durchgang (User-Entscheidungen 2026-10-22).
--
-- Empfängerregel überall gleich: status = 'aktiv' UND notifications_enabled UND
-- Login-Konto vorhanden (user_id). Ehrenmitglieder und Inaktive bekommen keine
-- Benachrichtigungen (C5) – bisher landeten Geburtstage bei ihnen noch in der App.
-- Ohne Login-Konto gibt es keine (C4): Ein frisch angelegtes Mitglied bekam sofort
-- Reminder- und News-Mails, bevor es eingeladen war und sich anmelden konnte.

-- 1) Tageslauf (Fassung aus 20261022120500 + Empfängerregel).
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
end;
$$;

revoke execute on function public.enqueue_due_reminders(date) from public, anon, authenticated;
grant execute on function public.enqueue_due_reminders(date) to service_role;

-- 2) News (Fassung aus 20260620120300 + Empfängerregel).
create or replace function public.notify_news(p_news_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_body  text;
begin
  if not public.has_permission('publish_content') then
    raise exception 'Keine Berechtigung';
  end if;
  select title, body into v_title, v_body from public.news_post where id = p_news_post_id;
  if not found then
    raise exception 'Nachricht nicht gefunden';
  end if;
  insert into public.notification (kind, recipient_id, news_post_id, for_date, title, body)
  select 'news'::public.notification_kind, m.id, p_news_post_id, current_date, v_title, left(v_body, 140)
  from public.member m
  where m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
  on conflict do nothing;
end;
$$;

-- 3) Dokumente: Termin-Unterlagen gehen an die Zugesagten des Termins und verlinken
-- auf den Termin (event_id gesetzt), alle anderen an alle (C8). Termin-Unterlagen
-- darf auch manage_events melden (der Clubmaster lädt sie hoch).
create or replace function public.notify_document(p_document_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title    text;
  v_category public.document_category;
  v_event    uuid;
  v_ev_title text;
begin
  select d.title, d.category, d.event_id, e.title
    into v_title, v_category, v_event, v_ev_title
  from public.document d left join public.event e on e.id = d.event_id
  where d.id = p_document_id;
  if not found then
    raise exception 'Dokument nicht gefunden';
  end if;

  if v_category = 'termin_unterlage' and v_event is not null then
    if not (public.has_permission('publish_content') or public.has_permission('manage_events')) then
      raise exception 'Keine Berechtigung';
    end if;
    insert into public.notification (kind, recipient_id, document_id, event_id, for_date, title, body)
    select 'document'::public.notification_kind, m.id, p_document_id, v_event, current_date,
           'Neue Unterlage: ' || v_title,
           'Zum Termin „' || v_ev_title || '“.'
    from public.member m
    join public.event_response r on r.member_id = m.id and r.event_id = v_event
    where r.status = 'zugesagt'
      and m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
    on conflict do nothing;
    return;
  end if;

  if not public.has_permission('publish_content') then
    raise exception 'Keine Berechtigung';
  end if;
  insert into public.notification (kind, recipient_id, document_id, for_date, title, body)
  select 'document'::public.notification_kind, m.id, p_document_id, current_date,
         'Neues Dokument: ' || v_title,
         'Im Bereich Dokumente verfügbar.'
  from public.member m
  where m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
  on conflict do nothing;
end;
$$;

-- 4) Termin-Benachrichtigungen (C1–C3). Nur mit manage_events. Der Text (z. B. neues
-- Datum/neuer Ort) kommt aus der App, die weiß, was sich geändert hat.
--   event_new      → alle Empfänger
--   event_changed  → alle mit Rückmeldung (zu- oder abgesagt)
--   event_question → alle mit Zusage
-- Mehrere Änderungen am selben Tag: die jüngste ersetzt eine noch nicht versandte.
create or replace function public.notify_event(p_event uuid, p_kind text, p_body text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_kind  public.notification_kind;
  v_head  text;
begin
  if not public.has_permission('manage_events') then
    raise exception 'Keine Berechtigung' using errcode = '42501';
  end if;
  if p_kind not in ('event_new', 'event_changed', 'event_question') then
    raise exception 'Unbekannte Art: %', p_kind;
  end if;
  select title into v_title from public.event where id = p_event;
  if not found then
    raise exception 'Termin nicht gefunden';
  end if;
  v_kind := p_kind::public.notification_kind;
  v_head := case p_kind
    when 'event_new' then 'Neuer Termin: '
    when 'event_changed' then 'Geändert: '
    else 'Neue Frage: '
  end;

  insert into public.notification (kind, recipient_id, event_id, for_date, title, body)
  select v_kind, m.id, p_event, current_date, v_head || v_title, p_body
  from public.member m
  where m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
    and (
      p_kind = 'event_new'
      or exists (
        select 1 from public.event_response r
        where r.event_id = p_event and r.member_id = m.id
          and (p_kind = 'event_changed' or r.status = 'zugesagt')
      )
    )
  on conflict (
    kind, recipient_id,
    coalesce(event_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(subject_member_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(document_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(news_post_id, '00000000-0000-0000-0000-000000000000'::uuid),
    for_date
  ) do update
    set title = excluded.title, body = excluded.body, created_at = now(), read_at = null
    where notification.sent_at is null;
end;
$$;

revoke all on function public.notify_event(uuid, text, text) from public, anon;
grant execute on function public.notify_event(uuid, text, text) to authenticated;

-- 5) Absage (C1): Löschen und Benachrichtigen in EINER Transaktion – sonst wäre die
-- Absage schon verschickt, wenn das Löschen danach scheitert (z. B. am Anwesenheits-
-- Schutz event_guard_attendance, der auch hier greift: auth.uid() bleibt gesetzt).
-- Benachrichtigung ohne event_id (fiele sonst per Cascade mit dem Termin weg);
-- for_date = Termindatum trennt zwei Absagen. Empfänger: alle, denn auch wer noch
-- nicht reagiert hat, plant evtl. mit dem Termin.
create or replace function public.cancel_event(p_event uuid, p_notify boolean, p_body text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_day   date;
begin
  if not public.has_permission('manage_events') then
    raise exception 'Keine Berechtigung' using errcode = '42501';
  end if;
  select title, (starts_at at time zone 'Europe/Berlin')::date into v_title, v_day
  from public.event where id = p_event;
  if not found then
    raise exception 'Termin nicht gefunden';
  end if;
  if p_notify then
    insert into public.notification (kind, recipient_id, for_date, title, body)
    select 'event_cancelled'::public.notification_kind, m.id, v_day, 'Abgesagt: ' || v_title, p_body
    from public.member m
    where m.status = 'aktiv' and m.notifications_enabled and m.user_id is not null
    on conflict do nothing;
  end if;
  delete from public.event where id = p_event;
end;
$$;

revoke all on function public.cancel_event(uuid, boolean, text) from public, anon;
grant execute on function public.cancel_event(uuid, boolean, text) to authenticated;

-- 6) Versand: dieselbe Empfängerregel auch beim Abholen (Fassung aus 20261004120600).
create or replace function public.claim_notifications(p_limit integer default 100)
returns table (
  id uuid,
  kind public.notification_kind,
  recipient_id uuid,
  event_id uuid,
  document_id uuid,
  news_post_id uuid,
  title text,
  body text,
  attempts integer,
  email text,
  notification_channel text
)
language sql
security invoker
set search_path = public
as $$
  with claimed as (
    update public.notification n
       set claimed_at = now()
     where n.id in (
       select x.id
         from public.notification x
         join public.member m on m.id = x.recipient_id
        where x.sent_at is null
          and x.attempts < 5
          and m.status = 'aktiv'
          and m.notifications_enabled
          and m.user_id is not null
          and (x.claimed_at is null or x.claimed_at < now() - interval '10 minutes')
          and (x.last_attempt_at is null or x.last_attempt_at < now() - x.attempts * interval '1 hour')
        order by x.created_at
        limit p_limit
        for update of x skip locked
     )
    returning n.*
  )
  select c.id, c.kind, c.recipient_id, c.event_id, c.document_id, c.news_post_id,
         c.title, c.body, c.attempts, m.email, m.notification_channel::text
    from claimed c
    join public.member m on m.id = c.recipient_id
   order by c.created_at;
$$;

revoke execute on function public.claim_notifications(integer) from public, anon, authenticated;
grant execute on function public.claim_notifications(integer) to service_role;

-- 7) Versandkanal (C6): „Nur Push“ und „Beide“ verhielten sich gleich (Push, E-Mail nur
-- ohne erreichbares Gerät). Es bleiben „push“ (Push, sonst E-Mail) und „email“.
update public.member set notification_channel = 'push' where notification_channel = 'both';
alter table public.member alter column notification_channel set default 'push';
alter table public.member
  add constraint member_notification_channel_no_both check (notification_channel <> 'both');
