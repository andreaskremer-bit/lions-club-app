-- Dokumente: neue Kategorie „Termin-Unterlage“ (Speisekarte, Reiseplanung, Einladung …).
-- Termin-Unterlagen erscheinen nur am Termin, alle anderen Kategorien immer in der Ablage –
-- auch wenn sie mit einem Termin verknüpft sind (Protokolle!). Bisher entschied allein
-- event_id über die Sichtbarkeit in der Ablage.
-- Eigene Migration: ein neuer Enum-Wert ist erst nach dem Commit verwendbar.
alter type public.document_category add value if not exists 'termin_unterlage';
