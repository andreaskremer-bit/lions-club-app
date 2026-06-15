-- M6 — Dokumente: zentrale Ablage (Protokolle, Satzung, Sonstige) mit deutscher
-- Volltextsuche. Datei liegt im privaten Bucket `documents`; `content_text` füllt
-- eine Edge Function (Baustein 2), `search_tsv` wird daraus generiert.
-- publish_content (Präsident/Vize/Sekretär) verwaltet; alle Mitglieder lesen.

create type public.document_category as enum (
  'protokoll_clubabend',
  'protokoll_mv',
  'satzung',
  'sonstige'
);

create table public.document (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category     public.document_category not null,
  doc_date     date, -- Bezugsdatum (z. B. Sitzungsdatum), getrennt vom Upload-Datum
  description  text,
  event_id     uuid references public.event (id) on delete set null, -- optional: Protokoll zu Termin
  file_path    text, -- Storage-Pfad "<id>/<dateiname>"
  file_name    text,
  mime_type    text,
  size_bytes   bigint,
  content_text text, -- extrahierter Volltext (Edge Function extract-document-text)
  uploaded_by  uuid references public.member (id) on delete set null,
  created_at   timestamptz not null default now(),
  -- Deutsche FTS über Titel + Beschreibung + Dateiinhalt. regconfig-Literal 'german'
  -- macht to_tsvector immutable (Voraussetzung für generierte Spalten).
  search_tsv   tsvector generated always as (
    to_tsvector(
      'german',
      coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content_text, '')
    )
  ) stored
);
create index document_search_idx on public.document using gin (search_tsv);
create index document_category_idx on public.document (category, doc_date desc);

alter table public.document enable row level security;

-- Lesen: alle eingeloggten Mitglieder (clubintern). Schreiben/Ändern/Löschen: publish_content.
create policy document_select_all
  on public.document for select to authenticated
  using (true);
create policy document_write_publish
  on public.document for all to authenticated
  using (public.has_permission('publish_content'))
  with check (public.has_permission('publish_content'));
grant select, insert, update, delete on public.document to authenticated;

-- Storage: privater Bucket (Anzeige nur über signierte URLs). Pfad "<document_id>/<dateiname>".
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'documents');

create policy "documents_write"
  on storage.objects for all to authenticated
  using (bucket_id = 'documents' and public.has_permission('publish_content'))
  with check (bucket_id = 'documents' and public.has_permission('publish_content'));
