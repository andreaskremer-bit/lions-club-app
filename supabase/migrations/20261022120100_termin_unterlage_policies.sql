-- Termin-Unterlagen (Teil 2, nach dem Enum-Wert aus 20261022120000).

-- 1) Bestehende Termin-Anhänge: Die Termin-Uploads setzten fest 'sonstige'. Diese bleiben
-- Termin-Unterlagen und tauchen nicht plötzlich in der Ablage auf. Protokolle mit Termin
-- behalten ihre Kategorie und erscheinen künftig in der Ablage.
update public.document
set category = 'termin_unterlage'
where category = 'sonstige'
  and event_id is not null;

-- 2) manage_events (Clubmaster, ohne publish_content) darf nur noch Termin-Unterlagen
-- schreiben. Bisher reichte event_id IS NOT NULL – nach dem neuen Modell könnte der
-- Clubmaster damit Protokolle in die Ablage stellen, ändern oder löschen.
alter policy document_write_event_manager on public.document
  using (
    event_id is not null
    and category = 'termin_unterlage'
    and public.has_permission('manage_events')
  )
  with check (
    event_id is not null
    and category = 'termin_unterlage'
    and public.has_permission('manage_events')
  );

alter policy "documents_write_events" on storage.objects
  using (
    bucket_id = 'documents'
    and public.has_permission('manage_events')
    and exists (
      select 1
      from public.document d
      where d.id::text = split_part(name, '/', 1)
        and d.event_id is not null
        and d.category = 'termin_unterlage'
    )
  )
  with check (
    bucket_id = 'documents'
    and public.has_permission('manage_events')
    and exists (
      select 1
      from public.document d
      where d.id::text = split_part(name, '/', 1)
        and d.event_id is not null
        and d.category = 'termin_unterlage'
    )
  );
