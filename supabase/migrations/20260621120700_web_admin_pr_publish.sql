-- Rechte-Korrektur: Webmaster = voller Admin, Presse darf News/Inhalte veröffentlichen.
--
-- Bisher fehlten dem Webmaster manage_events (Termine) und publish_content (News/
-- Dokumente) — der Admin konnte weder Termine noch News anlegen/bearbeiten. WEB ist
-- die technische Admin-Rolle und bekommt daher alle Rechte. Presse (PR) war ein reiner
-- Anzeige-Titel; als Pressereferent*in soll PR News/Inhalte veröffentlichen dürfen.

-- 1) Webmaster bekommt ALLE Rechte (voller Admin).
insert into public.amt_permission (amt_id, permission)
select a.id, p.permission
from public.amt a
cross join unnest(enum_range(null::public.app_permission)) as p(permission)
where a.key = 'webmaster'
on conflict (amt_id, permission) do nothing;

-- 2) Presse darf veröffentlichen (News/Dokumente/Protokolle) -> trägt jetzt Rechte.
update public.amt set display_only = false where key = 'presse';

insert into public.amt_permission (amt_id, permission)
select a.id, 'publish_content'::public.app_permission
from public.amt a
where a.key = 'presse'
on conflict (amt_id, permission) do nothing;
