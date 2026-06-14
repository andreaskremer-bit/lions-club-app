-- M1 — Mitglieder: Basistabelle `member` inkl. Partner-Stammdaten.
-- Verknüpfung zu auth.users über user_id (gesetzt beim Erst-Login per Trigger,
-- siehe 20260615120300_auth_link_and_helpers.sql). Kein Self-Signup.

create type public.member_status as enum ('aktiv', 'inaktiv', 'ehrenmitglied');

create table public.member (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users (id) on delete set null,
  email         text not null,
  first_name    text not null,
  last_name     text not null,
  title         text,                                  -- akad. Titel, z. B. "Dr."
  status        public.member_status not null default 'aktiv',
  phone         text,                                  -- Festnetz
  mobile        text,                                  -- Handy
  street        text,
  zip           text,
  city          text,
  photo_path    text,                                  -- Pfad im Storage-Bucket
  birthday      date,
  joined_on     date,                                  -- Beitrittsdatum
  -- Partner/in (genau eine Person je Mitglied, daher inline)
  partner_name      text,
  partner_birthday  date,
  partner_email     text,
  partner_mobile    text,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.member is
  'Clubmitglied inkl. Partner-Stammdaten; Verknüpfung zu auth.users via user_id. Kein Status "ausgetreten" — Ausgeschiedene werden gelöscht.';

-- E-Mail case-insensitiv eindeutig
create unique index member_email_unique on public.member (lower(email));

-- Verzeichnis-Filter
create index member_status_idx on public.member (status);
create index member_last_name_idx on public.member (last_name);

-- updated_at automatisch pflegen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger member_set_updated_at
  before update on public.member
  for each row execute function public.set_updated_at();

alter table public.member enable row level security;
