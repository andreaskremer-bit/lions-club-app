-- P1 — Mitglieder-Felder: drittes Telefon (Büro) + Partner-Vorname.
-- Volle Adresse (street/zip/city) existiert bereits.

alter table public.member add column phone_office text; -- Büro/Geschäftlich

-- Partner-Name in Vor-/Nachname aufteilen.
alter table public.member add column partner_first_name text;
alter table public.member add column partner_last_name text;

update public.member
set partner_first_name = nullif(split_part(partner_name, ' ', 1), ''),
    partner_last_name = nullif(
      trim(substr(partner_name, length(split_part(partner_name, ' ', 1)) + 1)),
      ''
    )
where partner_name is not null;

alter table public.member drop column partner_name;
