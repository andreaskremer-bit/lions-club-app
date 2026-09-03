-- Neues Recht „Teilnehmerliste einsehen/exportieren" (view_participants).
-- ADD VALUE darf im selben Txn nicht verwendet werden — Verwendung (Matrix +
-- Policy) bewusst in der Folgemigration 20260903120200.
alter type public.app_permission add value 'view_participants';
