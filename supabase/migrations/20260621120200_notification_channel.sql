-- P4 — Benachrichtigungs-Präferenzen: bevorzugte Versandkanäle je Mitglied.
--
-- KEIN Voll-Opt-out: In-App-Hinweise erhält jedes freigeschaltete Mitglied immer
-- (siehe member.notifications_enabled = Empfänger-Gate). Diese Spalte steuert nur
-- die ZUSÄTZLICHEN externen Kanäle:
--   push  = nur Web-Push
--   email = nur E-Mail
--   both  = Push mit E-Mail-Fallback (bisheriges Verhalten) — Default
--
-- Selbstpflege: member_update_self (RLS) erlaubt Mitgliedern, die eigene Zeile zu
-- ändern; protect_member_columns() schützt nur Status/E-Mail/Konto, NICHT diese
-- Spalte → keine zusätzliche Policy nötig. Der Versand (Edge Function
-- send-notifications) liest die Spalte und respektiert die Wahl.

create type public.notification_channel as enum ('push', 'email', 'both');

alter table public.member
  add column notification_channel public.notification_channel not null default 'both';

comment on column public.member.notification_channel is
  'Bevorzugte externe Versandkanäle für Benachrichtigungen (kein Voll-Opt-out; '
  'In-App immer). push = nur Push, email = nur E-Mail, both = Push mit '
  'E-Mail-Fallback. Default both.';
