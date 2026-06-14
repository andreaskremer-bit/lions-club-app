-- Foto-Upload: privater Storage-Bucket für Mitgliederfotos (clubintern, DSGVO).
-- Anzeige nur über signierte URLs; Pfad-Konvention: "<member_id>/<dateiname>".

insert into storage.buckets (id, name, public)
values ('member-photos', 'member-photos', false)
on conflict (id) do nothing;

-- Lesen: alle eingeloggten Mitglieder (Verzeichnis ist clubintern).
create policy "member_photos_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'member-photos');

-- Schreiben/Löschen: eigenes Foto (Ordner = eigene member-id) ODER edit_member_master.
create policy "member_photos_write"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'member-photos'
    and (
      (storage.foldername(name))[1] = public.current_member_id()::text
      or public.has_permission('edit_member_master')
    )
  )
  with check (
    bucket_id = 'member-photos'
    and (
      (storage.foldername(name))[1] = public.current_member_id()::text
      or public.has_permission('edit_member_master')
    )
  );
