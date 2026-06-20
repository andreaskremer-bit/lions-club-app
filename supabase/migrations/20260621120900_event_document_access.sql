-- Termin-Dokumente: Clubmaster (manage_events, OHNE publish_content) soll Dokumente
-- AM TERMIN hochladen/löschen können (z. B. die Ablaufplanung einer Club-Reise),
-- ohne allgemeine Veröffentlichungsrechte zu erhalten. Erweitert die M6-Policies um
-- je eine zweite, permissive Regel, die NUR event-gebundene Dokumente
-- (event_id IS NOT NULL) für manage_events freigibt. Die bestehende
-- publish_content-Regel bleibt unverändert (permissive Policies werden OR-verknüpft).

-- 1) Tabelle public.document — Anlegen/Ändern/Löschen event-gebundener Dokumente.
-- WITH CHECK erzwingt event_id IS NOT NULL: manage_events kann ein Dokument nicht in
-- die allgemeine Ablage „entkoppeln" (event_id auf NULL setzen) und keine freien
-- Dokumente ohne Termin anlegen.
create policy document_write_event_manager
  on public.document for all to authenticated
  using (event_id is not null and public.has_permission('manage_events'))
  with check (event_id is not null and public.has_permission('manage_events'));

-- 2) Storage-Bucket `documents` — Objekte, deren Dokument-Datensatz event-gebunden
-- ist. Pfad = "<document_id>/<dateiname>" → erste Pfadkomponente ist die document.id.
-- Der Datensatz existiert beim Upload bereits (uploadDocument legt zuerst die Zeile
-- an) wie auch beim Löschen (App entfernt erst das Objekt, dann die Zeile). Die
-- EXISTS-Unterabfrage liest public.document unter document_select_all (für alle
-- Authenticated lesbar), findet die Zeile also zuverlässig.
create policy "documents_write_events"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'documents'
    and public.has_permission('manage_events')
    and exists (
      select 1
      from public.document d
      where d.id::text = split_part(name, '/', 1)
        and d.event_id is not null
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
    )
  );
