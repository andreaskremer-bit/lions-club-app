-- M6 — notify_news(): Benachrichtigung bei News-Veröffentlichung für alle aktiven,
-- freigeschalteten Mitglieder (Empfänger-Gate greift, vgl. notify_document).
-- SECURITY DEFINER, nur mit publish_content aufrufbar.

create or replace function public.notify_news(p_news_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_body  text;
begin
  if not public.has_permission('publish_content') then
    raise exception 'Keine Berechtigung';
  end if;

  select title, body into v_title, v_body from public.news_post where id = p_news_post_id;
  if not found then
    raise exception 'Nachricht nicht gefunden';
  end if;

  insert into public.notification (kind, recipient_id, news_post_id, for_date, title, body)
  select 'news'::public.notification_kind, m.id, p_news_post_id, current_date,
         v_title,
         left(v_body, 140)
  from public.member m
  where m.status = 'aktiv' and m.notifications_enabled
  on conflict do nothing;
end;
$$;

revoke all on function public.notify_news(uuid) from public;
grant execute on function public.notify_news(uuid) to authenticated;
