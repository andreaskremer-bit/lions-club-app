-- Outbox-Reservierung für send-notifications (Migration 20261004120500).
-- Lauf: `npx supabase test db`.

begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

truncate auth.users, public.event cascade;

insert into public.member (email, first_name, last_name, status) values
  ('o@out.example', 'Otto', 'Outbox', 'aktiv');

insert into public.notification (kind, recipient_id, for_date, title, attempts, last_attempt_at, sent_at)
select 'birthday', m.id, current_date - v.tag, v.title, v.attempts, v.last_attempt, v.sent_at
from public.member m,
  (values
    -- for_date je Zeile verschieden, sonst greift der Dedupe-Index
    (0, 'neu',          0, null::timestamptz,             null::timestamptz),
    (1, 'versendet',    0, null,                          now()),
    (2, 'aufgegeben',   5, now() - interval '2 days',     null),
    (3, 'wartet noch',  2, now() - interval '30 minutes', null),
    (4, 'wieder dran',  2, now() - interval '3 hours',    null)
  ) as v(tag, title, attempts, last_attempt, sent_at);

-- (1) Erster Lauf reserviert nur, was fällig ist.
select bag_eq(
  $$ select n.title from public.claim_notifications() c join public.notification n on n.id = c $$,
  $$ values ('neu'), ('wieder dran') $$,
  'Reserviert offene, fällige Zeilen; übergeht versendete, aufgegebene und noch wartende'
);

-- (2) Ein zweiter Lauf direkt danach bekommt nichts doppelt.
select is(
  (select count(*)::int from public.claim_notifications()), 0,
  'Gleichzeitiger zweiter Lauf reserviert keine Zeile doppelt'
);

-- (3) Eine verfallene Reservierung (> 10 min) wird neu vergeben.
update public.notification set claimed_at = now() - interval '11 minutes' where title = 'neu';
select bag_eq(
  $$ select n.title from public.claim_notifications() c join public.notification n on n.id = c $$,
  $$ values ('neu') $$,
  'Verfallene Reservierung wird neu vergeben'
);

-- (4) Limit wird eingehalten.
update public.notification set claimed_at = null where sent_at is null;
select is((select count(*)::int from public.claim_notifications(1)), 1, 'p_limit begrenzt die Menge');

-- (5–6) Nur service_role darf reservieren.
select ok(
  not has_function_privilege('authenticated', 'public.claim_notifications(integer)', 'execute'),
  'authenticated darf nicht reservieren'
);
select ok(
  has_function_privilege('service_role', 'public.claim_notifications(integer)', 'execute'),
  'service_role darf reservieren'
);

select * from finish();
rollback;
