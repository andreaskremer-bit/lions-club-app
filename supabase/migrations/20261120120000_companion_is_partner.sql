-- Begleitpersonen: Partner(in) von weiteren Gästen unterscheiden.
--
-- Bisher stand jede Begleitung unter „Gäste“ – auch die Partner(innen), die der
-- Club kennt. Die Meldungen zeigen Partner(innen) jetzt direkt beim Mitglied
-- („Andreas Kremer und Petra Kremer“), unter „Gäste“ bleiben nur echte Gäste.
--
-- Der Name bleibt Text (Stand bei der Anmeldung), damit es auch ohne Partner im
-- Profil geht und eine spätere Profiländerung alte Termine nicht umschreibt.
-- Schreiben regelt weiter comp_write_own (nur eigene Rückmeldung, künftiger
-- Termin, Typ mit Begleitung); die Tabellenrechte gelten für die neue Spalte mit.

alter table public.companion
  add column is_partner boolean not null default false;

comment on column public.companion.is_partner is
  'true = Partner(in) des Mitglieds, false = weiterer Gast. Höchstens eine Partner(in) je Rückmeldung.';

-- Altdaten: nur sichere Treffer markieren – Name genau wie der Partner im Profil
-- (so trägt ihn der Button „… hinzufügen“ ein). Bei doppelten Einträgen gilt der
-- erste, damit der eindeutige Index unten nicht scheitert. Alles andere bleibt Gast;
-- die Mitglieder können es bei künftigen Terminen selbst umstellen.
with treffer as (
  select distinct on (c.event_response_id) c.id
  from public.companion c
  join public.event_response r on r.id = c.event_response_id
  join public.member m on m.id = r.member_id
  where nullif(trim(concat_ws(' ', m.partner_first_name, m.partner_last_name)), '') is not null
    and c.name = trim(concat_ws(' ', m.partner_first_name, m.partner_last_name))
  order by c.event_response_id, c.created_at, c.id
)
update public.companion c
set is_partner = true
from treffer t
where c.id = t.id;

create unique index companion_one_partner_idx
  on public.companion (event_response_id)
  where is_partner;
