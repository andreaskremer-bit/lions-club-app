-- M1 — Ämter als Rollen mit Rechten (Spec §3).
-- Rechte-tragende Ämter addieren Rechte zur Mitglieder-Basis;
-- reine Anzeige-Titel (display_only) tragen keine Rechte.

create type public.app_permission as enum (
  'manage_events',       -- Termine verwalten/anlegen/ändern
  'record_attendance',   -- Anwesenheit erfassen (löst Abwesenheits-Spende aus)
  'publish_content',     -- News/Dokumente/Protokolle veröffentlichen
  'edit_member_master',  -- fremde Stammdaten pflegen/korrigieren
  'manage_members',      -- Mitglieder anlegen/einladen/deaktivieren
  'export_lions',        -- Mitgliederdaten für Lions-Meldung (Wiesbaden) exportieren
  'view_donations',      -- Abwesenheits-Spenden-Auswertung einsehen
  'manage_roles',        -- Nutzer-/Rollen-/Ämterverwaltung
  'delete_member',       -- Mitglieder löschen
  'admin_system'         -- Systemeinstellungen
);

create table public.amt (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  label        text not null,
  sort_order   int not null default 100,
  display_only boolean not null default false
);

comment on table public.amt is 'Ämter/Funktionen; display_only = reiner Anzeige-Titel ohne Zusatzrechte.';

create table public.amt_permission (
  amt_id     uuid not null references public.amt (id) on delete cascade,
  permission public.app_permission not null,
  primary key (amt_id, permission)
);

create table public.member_amt (
  member_id uuid not null references public.member (id) on delete cascade,
  amt_id    uuid not null references public.amt (id) on delete cascade,
  since     date,
  primary key (member_id, amt_id)
);

create index member_amt_amt_idx on public.member_amt (amt_id);

alter table public.amt            enable row level security;
alter table public.amt_permission enable row level security;
alter table public.member_amt     enable row level security;

-- Seed: Ämter (rechte-tragend + reine Anzeige-Titel)
insert into public.amt (key, label, sort_order, display_only) values
  ('praesident',      'Präsident',              10, false),
  ('vize',            'Vizepräsident',          20, false),
  ('sekretaer',       'Sekretär',               30, false),
  ('schatzmeister',   'Schatzmeister',          40, false),
  ('clubmaster',      'Clubmaster',             50, false),
  ('webmaster',       'Webmaster / IT',         60, false),
  ('past_praesident', 'Past-Präsident',         70, true),
  ('activity',        'Activity-Beauftragter',  80, true);

-- Seed: Rechte je Amt (Matrix aus Spec §3)
insert into public.amt_permission (amt_id, permission)
select a.id, p.permission::public.app_permission
from public.amt a
join (values
  ('praesident',    'manage_events'),
  ('praesident',    'record_attendance'),
  ('praesident',    'publish_content'),
  ('praesident',    'edit_member_master'),
  ('praesident',    'view_donations'),
  ('vize',          'manage_events'),
  ('vize',          'record_attendance'),
  ('vize',          'publish_content'),
  ('vize',          'edit_member_master'),
  ('vize',          'view_donations'),
  ('sekretaer',     'publish_content'),
  ('sekretaer',     'edit_member_master'),
  ('sekretaer',     'record_attendance'),
  ('sekretaer',     'manage_members'),
  ('sekretaer',     'export_lions'),
  ('schatzmeister', 'view_donations'),
  ('clubmaster',    'manage_events'),
  ('webmaster',     'manage_roles'),
  ('webmaster',     'edit_member_master'),
  ('webmaster',     'manage_members'),
  ('webmaster',     'delete_member'),
  ('webmaster',     'admin_system')
) as p(amt_key, permission) on p.amt_key = a.key;
