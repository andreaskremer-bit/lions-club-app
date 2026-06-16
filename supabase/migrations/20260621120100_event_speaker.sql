-- Optionales Referent/in-Feld am Termin (Vorträge, v. a. an Club-Abenden).
-- Keine RLS-/Grant-Änderung nötig: bestehende event-Policies/Grants decken die Spalte.
alter table public.event add column speaker text;

comment on column public.event.speaker is
  'Referent/in eines Vortrags (optional, v. a. Club-Abende).';
