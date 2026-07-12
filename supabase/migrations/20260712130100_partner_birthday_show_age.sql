-- Geburtstage: Partner-Geburtstage bekommen eine eigene Ansicht. Einzelne
-- Partner/innen möchten ggf. den Geburtstag zeigen, aber nicht das Alter —
-- Anzeige-Schalter je Mitglied (Default an). Das Geburtsjahr bleibt gespeichert
-- (Sekretär/Export brauchen vollständige Daten); der Schalter steuert nur die
-- Darstellung in Geburtstagsliste und Profil.
alter table public.member add column partner_birthday_show_age boolean not null default true;
