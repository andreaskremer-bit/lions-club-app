-- Dokumente: Teilwort-Suche. websearch_to_tsquery matcht nur ganze (gestemmte)
-- Wörter — die Live-Suche fand deshalb beim Tippen ("Proto", "Sat") nichts.
-- `search_documents` kombiniert pro Suchwort ILIKE-Teilstring-Treffer (auch mitten
-- im Wort, über Titel + Beschreibung + extrahierten Volltext) mit der deutschen
-- Volltextsuche (Stemming, z. B. "Beschlüsse" → "Beschluss"). Mehrere Suchwörter
-- werden UND-verknüpft. security invoker (Default) → RLS auf document gilt weiter.
create or replace function public.search_documents(term text)
returns setof public.document
language sql
stable
set search_path = ''
as $$
  with words as (
    select w,
           -- ILIKE-Wildcards im Suchwort entschärfen (\ zuerst, dann % und _)
           '%' || replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') || '%' as pat
    from unnest(regexp_split_to_array(btrim(term), '\s+')) as w
    where w <> ''
  )
  select d.*
  from public.document d
  where exists (select 1 from words)
    and not exists (
      select 1 from words w
      where not (
        -- coalesce-Haystack statt OR-Kette je Feld: NULL-Felder würden die
        -- OR-Kette zu NULL machen und das Dokument fälschlich IMMER matchen.
        (coalesce(d.title, '') || ' ' || coalesce(d.description, '') || ' '
          || coalesce(d.content_text, '')) ilike w.pat
        or d.search_tsv @@ plainto_tsquery('german', w.w)
      )
    )
$$;

grant execute on function public.search_documents(text) to authenticated;
