-- Benachrichtigungs-Freigabe ab Werk an (2026-10-07).
--
-- notifications_enabled war das Empfänger-Gate der Geheim-Phase (Default false, siehe
-- 20260618120100). Seit dem Go-live am 2026-07-16 sind alle Mitglieder freigeschaltet –
-- aber nur per Einzel-Update, der Default blieb false. Neu angelegte Mitglieder bekamen
-- dadurch gar nichts: keine In-App-Hinweise, keinen Push, keine E-Mail.
--
-- Den Kanal wählt weiterhin jedes Mitglied selbst (notification_channel, Default both).

alter table public.member alter column notifications_enabled set default true;

-- Nachholen für alle, die seit dem Go-live mit dem alten Default angelegt wurden.
update public.member set notifications_enabled = true where not notifications_enabled;
