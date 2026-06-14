-- M3 — Anwesenheit. Erfasst NUR anwesend/abwesend (keine Beträge, keine Spenden-Datensätze).
-- Nur für spendenpflichtige Termine (Club-Abend + Versammlung). "Nicht erfasst" = keine Zeile.

create table public.attendance (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.event (id) on delete cascade,
  member_id   uuid not null references public.member (id) on delete cascade,
  present     boolean not null,                                   -- true = anwesend, false = abwesend
  recorded_by uuid references public.member (id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique (event_id, member_id)
);

create index attendance_event_idx on public.attendance (event_id);
create index attendance_member_idx on public.attendance (member_id);

create or replace function public.touch_recorded_at()
returns trigger language plpgsql as $$
begin
  new.recorded_at = now();
  return new;
end;
$$;
create trigger attendance_touch
  before update on public.attendance
  for each row execute function public.touch_recorded_at();

alter table public.attendance enable row level security;

-- Sehen: Vorstand (record_attendance) + Schatzmeister (view_donations). NICHT normale Mitglieder
-- (Abwesenheit ist spendenrelevant → Geldsicht nur Schatzmeister/Vorstand).
create policy attendance_select_privileged
  on public.attendance for select to authenticated
  using (public.has_permission('record_attendance') or public.has_permission('view_donations'));

-- Erfassen/ändern: nur record_attendance UND nur für spendenpflichtige Termine.
create policy attendance_write_record
  on public.attendance for all to authenticated
  using (public.has_permission('record_attendance'))
  with check (
    public.has_permission('record_attendance')
    and (select e.donation_required from public.event e where e.id = event_id)
  );

grant select, insert, update, delete on public.attendance to authenticated;
