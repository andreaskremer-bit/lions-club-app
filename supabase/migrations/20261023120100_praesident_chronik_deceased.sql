-- Präsidenten-Chronik: als aktives Mitglied verstorben → Kreuz hinter dem Namen
-- (User-Wunsch 2026-10-23). Eigene Spalte statt „†“ im Namen, damit die Anzeige
-- (sichtbares Kreuz + Text für Screenreader) Sache der App bleibt.

alter table public.praesident_chronik
  add column deceased boolean not null default false;

comment on column public.praesident_chronik.deceased is
  'Als aktives Mitglied verstorben; die Chronik zeigt ein Kreuz hinter dem Namen.';
