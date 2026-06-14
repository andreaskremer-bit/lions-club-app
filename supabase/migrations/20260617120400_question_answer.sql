-- M4 — flexible Abfrage-Engine je Termin (Spec §4.2). Wiederverwendbar für
-- den späteren Umfrage-Bereich (Phase 2). Antwort PRO PERSON: Mitglied
-- (companion_id NULL) oder einzelne Begleitperson.

create type public.question_type as enum ('single', 'multi', 'text', 'boolean', 'number');

create table public.question (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.event (id) on delete cascade,
  label      text not null,
  qtype      public.question_type not null,
  options    text[], -- nur bei single/multi
  required   boolean not null default false,
  sort_order int not null default 100,
  created_at timestamptz not null default now()
);
create index question_event_idx on public.question (event_id);

create table public.answer (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.question (id) on delete cascade,
  member_id    uuid not null references public.member (id) on delete cascade,
  companion_id uuid references public.companion (id) on delete cascade, -- NULL = Mitglied selbst
  value        jsonb not null,
  updated_at   timestamptz not null default now()
);
create index answer_question_idx on public.answer (question_id);
create index answer_member_idx on public.answer (member_id);

-- Genau eine Antwort je Frage pro Person (NULL-companion separat behandeln).
create unique index answer_self_unique
  on public.answer (question_id, member_id) where companion_id is null;
create unique index answer_companion_unique
  on public.answer (question_id, companion_id) where companion_id is not null;

create trigger answer_set_updated_at
  before update on public.answer
  for each row execute function public.set_updated_at();

-- Darf der eingeloggte Nutzer diese Antwort schreiben? Termin in Zukunft, und bei
-- Begleitperson muss diese zu einer eigenen Rückmeldung desselben Termins gehören.
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
      p_companion is null
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

revoke all on function public.may_answer(uuid, uuid) from public;
grant execute on function public.may_answer(uuid, uuid) to authenticated;

alter table public.question enable row level security;
alter table public.answer   enable row level security;

-- question: alle lesen; verwalten mit manage_events.
create policy question_select_authenticated
  on public.question for select to authenticated using (true);
create policy question_write_privileged
  on public.question for all to authenticated
  using (public.has_permission('manage_events'))
  with check (public.has_permission('manage_events'));

-- answer: eigene + Vorstand (manage_events für Teilnehmerliste/Export) lesen;
-- schreiben nur eigene, Zukunft, gültige Begleitperson.
create policy answer_select
  on public.answer for select to authenticated
  using (member_id = public.current_member_id() or public.has_permission('manage_events'));
create policy answer_insert
  on public.answer for insert to authenticated
  with check (member_id = public.current_member_id() and public.may_answer(question_id, companion_id));
create policy answer_update
  on public.answer for update to authenticated
  using (member_id = public.current_member_id() and public.may_answer(question_id, companion_id))
  with check (member_id = public.current_member_id() and public.may_answer(question_id, companion_id));
create policy answer_delete
  on public.answer for delete to authenticated
  using (member_id = public.current_member_id() and public.may_answer(question_id, companion_id));

grant select, insert, update, delete on public.question to authenticated;
grant select, insert, update, delete on public.answer   to authenticated;
