-- M6 — Dokument-Benachrichtigungen: erweitert die M5-Outbox um Typ 'document'
-- und eine Dokument-Referenz. Die Funktion, die den neuen Enum-Wert NUTZT, steht
-- bewusst in der Folgemigration (ADD VALUE darf im selben Txn nicht verwendet werden).

alter type public.notification_kind add value 'document';

alter table public.notification
  add column document_id uuid references public.document (id) on delete cascade;

-- Dedupe-Index neu, damit verschiedene Dokumente am selben Tag NICHT kollidieren
-- (der M5-Index berücksichtigte document_id noch nicht).
drop index if exists public.notification_dedupe;
create unique index notification_dedupe on public.notification (
  kind,
  recipient_id,
  coalesce(event_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(subject_member_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(document_id, '00000000-0000-0000-0000-000000000000'::uuid),
  for_date
);
