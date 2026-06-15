-- M6 — News-Benachrichtigungen: Outbox um Typ 'news' + Referenz erweitern.
-- ADD VALUE getrennt von der Verwendung (Folgemigration mit notify_news()).

alter type public.notification_kind add value 'news';

alter table public.notification
  add column news_post_id uuid references public.news_post (id) on delete cascade;

-- Dedupe-Index neu inkl. news_post_id (sonst kollidieren zwei News am selben Tag).
drop index if exists public.notification_dedupe;
create unique index notification_dedupe on public.notification (
  kind,
  recipient_id,
  coalesce(event_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(subject_member_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(document_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(news_post_id, '00000000-0000-0000-0000-000000000000'::uuid),
  for_date
);
