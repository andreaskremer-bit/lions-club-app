-- M6 — News: Vereinsnachrichten-Feed (Spec §4.5). Vorstand veröffentlicht,
-- alle Mitglieder lesen. Klartext (im UI mit Zeilenumbrüchen + verlinkten URLs).

create table public.news_post (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  pinned       boolean not null default false,
  published_by uuid references public.member (id) on delete set null,
  published_at timestamptz not null default now()
);
create index news_post_feed_idx on public.news_post (pinned desc, published_at desc);

alter table public.news_post enable row level security;

-- Lesen: alle eingeloggten Mitglieder. Schreiben/Ändern/Löschen: publish_content.
create policy news_select_all
  on public.news_post for select to authenticated
  using (true);
create policy news_write_publish
  on public.news_post for all to authenticated
  using (public.has_permission('publish_content'))
  with check (public.has_permission('publish_content'));

grant select, insert, update, delete on public.news_post to authenticated;
-- service_role (Edge Functions / notify) braucht Grants zusätzlich zum RLS-Bypass.
grant select, insert, update, delete on public.news_post to service_role;
