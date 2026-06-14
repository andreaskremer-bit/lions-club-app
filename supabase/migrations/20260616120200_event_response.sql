-- M2 — An-/Abmeldungen + Begleitpersonen.
-- Eigener RSVP-Status: Zugesagt/Abgesagt als Zeile; "Offen" = keine Zeile.
-- Vergangene Termine sind schreibgeschützt (Policy-Subquery auf starts_at).

create type public.rsvp_status as enum ('zugesagt', 'abgesagt');

create table public.event_response (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.event (id) on delete cascade,
  member_id    uuid not null references public.member (id) on delete cascade,
  status       public.rsvp_status not null,
  comment      text,
  responded_at timestamptz not null default now(),
  unique (event_id, member_id)
);

create index event_response_event_idx on public.event_response (event_id);
create index event_response_member_idx on public.event_response (member_id);

-- responded_at bei jeder Änderung aktualisieren
create or replace function public.touch_responded_at()
returns trigger language plpgsql as $$
begin
  new.responded_at = now();
  return new;
end;
$$;
create trigger event_response_touch
  before update on public.event_response
  for each row execute function public.touch_responded_at();

create table public.companion (
  id                uuid primary key default gen_random_uuid(),
  event_response_id uuid not null references public.event_response (id) on delete cascade,
  name              text not null,
  created_at        timestamptz not null default now()
);
create index companion_response_idx on public.companion (event_response_id);

alter table public.event_response enable row level security;
alter table public.companion       enable row level security;

-- ── event_response ──────────────────────────────────────────────────────────
-- Lesen: alle eingeloggten Mitglieder (Rückmeldezahlen + Meldungen-Listen).
create policy er_select_authenticated
  on public.event_response for select to authenticated using (true);

-- Schreiben: nur eigene Rückmeldung, und nur solange der Termin in der Zukunft liegt.
create policy er_insert_own
  on public.event_response for insert to authenticated
  with check (
    member_id = public.current_member_id()
    and (select e.starts_at from public.event e where e.id = event_id) > now()
  );
create policy er_update_own
  on public.event_response for update to authenticated
  using (
    member_id = public.current_member_id()
    and (select e.starts_at from public.event e where e.id = event_id) > now()
  )
  with check (
    member_id = public.current_member_id()
    and (select e.starts_at from public.event e where e.id = event_id) > now()
  );
create policy er_delete_own
  on public.event_response for delete to authenticated
  using (
    member_id = public.current_member_id()
    and (select e.starts_at from public.event e where e.id = event_id) > now()
  );

-- ── companion ───────────────────────────────────────────────────────────────
-- Lesen: alle eingeloggten Mitglieder. Schreiben: nur zur eigenen Rückmeldung,
-- nur wenn der Typ Begleitpersonen erlaubt und der Termin in der Zukunft liegt.
create policy comp_select_authenticated
  on public.companion for select to authenticated using (true);

create policy comp_write_own
  on public.companion for all to authenticated
  using (
    exists (
      select 1 from public.event_response r
      join public.event e on e.id = r.event_id
      where r.id = event_response_id
        and r.member_id = public.current_member_id()
        and e.companion_allowed
        and e.starts_at > now()
    )
  )
  with check (
    exists (
      select 1 from public.event_response r
      join public.event e on e.id = r.event_id
      where r.id = event_response_id
        and r.member_id = public.current_member_id()
        and e.companion_allowed
        and e.starts_at > now()
    )
  );

grant select, insert, update, delete on public.event_response to authenticated;
grant select, insert, update, delete on public.companion       to authenticated;
