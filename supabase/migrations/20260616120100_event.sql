-- M2 — Termine. Titel = Programm/Thema, Typ nur als Eigenschaft/Badge.
-- Begleitperson- und Spendenpflicht-Regel werden aus dem Typ ABGELEITET
-- (Matrix Spec §4.2) und als generierte Spalten gehalten — single source of truth.

create type public.event_type as enum (
  'clubabend',     -- Begleitperson ja, spendenpflichtig
  'versammlung',   -- Mitglieder-Versammlung: Begleitperson nein, spendenpflichtig
  'reise',         -- Club-Reise: Begleitperson ja, nicht spendenpflichtig
  'gesellig',      -- gesellige Termine: Begleitperson ja, nicht spendenpflichtig
  'lions_termin'   -- offizielle Lions-Termine: Begleitperson nein, nicht spendenpflichtig
);

create table public.event (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,                 -- Programm/Thema
  type          public.event_type not null,
  location      text,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  description   text,
  -- abgeleitete Regeln (Spec §4.2):
  companion_allowed boolean generated always as (type in ('clubabend', 'reise', 'gesellig')) stored,
  donation_required boolean generated always as (type in ('clubabend', 'versammlung')) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.event is
  'Termin/Veranstaltung. companion_allowed & donation_required sind aus type abgeleitet (Matrix Spec §4.2).';

create index event_starts_at_idx on public.event (starts_at);

create trigger event_set_updated_at
  before update on public.event
  for each row execute function public.set_updated_at();

alter table public.event enable row level security;

-- Alle eingeloggten Mitglieder sehen Termine; verwalten nur mit manage_events.
create policy event_select_authenticated
  on public.event for select to authenticated using (true);
create policy event_write_privileged
  on public.event for all to authenticated
  using (public.has_permission('manage_events'))
  with check (public.has_permission('manage_events'));

grant select, insert, update, delete on public.event to authenticated;
