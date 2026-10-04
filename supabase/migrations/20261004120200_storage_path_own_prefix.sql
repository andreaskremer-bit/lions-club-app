-- Security-Scan 2026-10-04 (F9, F10, F12): Storage-Pfade an den eigenen Datensatz binden.
--
-- member.photo_path und document.file_path waren freie Textspalten. Ein Mitglied konnte
-- in der Selbstpflege photo_path auf das Foto eines anderen Mitglieds setzen, ein
-- Terminverwalter (manage_events) file_path eines Terminanhangs auf eine Datei der
-- allgemeinen Ablage. Klickte danach jemand mit mehr Rechten auf „Entfernen“/„Löschen“,
-- löschte dessen Sitzung die FREMDE Datei (Confused Deputy).
--
-- Alle Upload-Wege legen Dateien ohnehin unter „<id>/…“ ab (App, import-members.mjs,
-- import-protokolle.mjs). Die Regel macht das verbindlich, für jede Rolle.
-- Bewusst OHNE `not valid`: Der Bestand wird beim Anlegen mitgeprüft. Weicht eine Zeile ab,
-- bricht die Migration komplett ab (statt später jede Bearbeitung dieser Zeile zu blockieren).

alter table public.member
  add constraint member_photo_path_own check (
    photo_path is null
    or (split_part(photo_path, '/', 1) = id::text and position('..' in photo_path) = 0)
  );

alter table public.document
  add constraint document_file_path_own check (
    file_path is null
    or (split_part(file_path, '/', 1) = id::text and position('..' in file_path) = 0)
  );
