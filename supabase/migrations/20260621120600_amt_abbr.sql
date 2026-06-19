-- Kürzel je Amt (geschlechtsneutral, wie in der alten Avareto-App): P, VP, S, SCH …
-- In personenbezogenen Anzeigen (Mitglieder-Liste, Profil-Tags, News-Autor) wird
-- abbr statt des vollen, gegenderten Labels gezeigt; das volle Label bleibt die
-- Legende auf /vorstand. Keine RLS-/Grant-Änderung (amt-Policies/Grants decken die Spalte).

alter table public.amt add column abbr text;

comment on column public.amt.abbr is
  'Geschlechtsneutrales Kürzel für personenbezogene Anzeigen (z. B. P, VP, SCH).';

update public.amt set abbr = case key
  when 'praesident'                  then 'P'
  when 'vize'                        then 'VP'
  when 'sekretaer'                   then 'S'
  when 'schatzmeister'               then 'SCH'
  when 'clubmaster'                  then 'CM'
  when 'webmaster'                   then 'WEB'
  when 'activity'                    then 'Act'
  when 'mitgliedschaftsbeauftragter' then 'MB'
  when 'presse'                      then 'PR'
  when 'leo_club'                    then 'Leo'
  when 'lions_quest'                 then 'LQ'
  when 'klasse2000'                  then 'K2000'
  when 'jumelage'                    then 'Jum'
  when 'umwelt'                      then 'UB'
  else abbr
end;
