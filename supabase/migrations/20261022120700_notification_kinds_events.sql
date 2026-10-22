-- Gruppe C (2026-10-22): neue Benachrichtigungsarten rund um Termine.
-- Eigene Migration: neue Enum-Werte sind erst nach dem Commit verwendbar.
alter type public.notification_kind add value if not exists 'event_new';       -- neuer Termin
alter type public.notification_kind add value if not exists 'event_changed';   -- verschoben / Ort geändert
alter type public.notification_kind add value if not exists 'event_cancelled'; -- abgesagt (gelöscht)
alter type public.notification_kind add value if not exists 'event_question';  -- neue Zusatzfrage
