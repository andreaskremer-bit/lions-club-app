-- Ämter-Bezeichnungen gendergerecht in „(in)/(r)"-Form (Anzeige auf /vorstand).
-- Nur die vom Club gewünschten Labels; Kürzel (amt.abbr) bleiben geschlechtsneutral.

update public.amt set label = 'Präsident(in)'                 where key = 'praesident';
update public.amt set label = 'Vizepräsident(in)'             where key = 'vize';
update public.amt set label = 'Sekretär(in)'                  where key = 'sekretaer';
update public.amt set label = 'Schatzmeister(in)'             where key = 'schatzmeister';
update public.amt set label = 'Mitgliedschaftsbeauftragte(r)' where key = 'mitgliedschaftsbeauftragter';
update public.amt set label = 'Activity-Beauftragte(r)'       where key = 'activity';
update public.amt set label = 'Umwelt-Beauftragte(r)'         where key = 'umwelt';
