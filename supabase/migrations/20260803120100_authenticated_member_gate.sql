-- Security-Audit 2026-08-03 — Härtung: „eingeloggt" ist nicht dasselbe wie „Clubmitglied".
--
-- BEFUND: Die breiten Lese-Policies standen auf `using (true)`, waren also an die
-- bloße Rolle `authenticated` gebunden. Da im Produktivprojekt der Self-Signup offen
-- stand (`disable_signup: false`, inzwischen abgeschaltet), konnte sich eine beliebige
-- Person mit der eigenen Adresse ein Konto anlegen, per OTP ein gültiges JWT holen und
-- damit das komplette Verzeichnis (Namen, Adressen, Telefonnummern, Geburtstage),
-- alle Termine, Dokumente, News sowie die Dateien in beiden Buckets LESEN.
-- Schreiben war nie möglich: alle Write-Policies hängen an `has_permission()` oder
-- `current_member_id()`, und ein Konto ohne member-Zeile liefert dort NULL.
--
-- FIX: Lesen setzt eine verknüpfte member-Zeile voraus. Das ist die zweite Schicht —
-- die erste bleibt der abgeschaltete Signup im Dashboard (Produktionseinstellung,
-- lebt außerhalb des Repos, siehe MEILENSTEINE.md). Diese Migration sorgt dafür, dass
-- ein versehentlich zurückgestellter Schalter die Daten nicht erneut öffnet.
--
-- `current_member_id()` ist SECURITY DEFINER + STABLE — kein Rekursionsproblem in den
-- member-Policies, Auswertung einmal je Statement.
-- Für die 35 Bestandskonten ändert sich nichts: jedes hat eine verknüpfte member-Zeile.

-- ── Verzeichnis + Ämter ─────────────────────────────────────────────────────
alter policy member_select_authenticated on public.member
  using (public.current_member_id() is not null);

alter policy amt_select_authenticated on public.amt
  using (public.current_member_id() is not null);

alter policy amt_permission_select_authenticated on public.amt_permission
  using (public.current_member_id() is not null);

alter policy member_amt_select_authenticated on public.member_amt
  using (public.current_member_id() is not null);

-- ── Termine + Rückmeldungen ─────────────────────────────────────────────────
alter policy event_select_authenticated on public.event
  using (public.current_member_id() is not null);

alter policy er_select_authenticated on public.event_response
  using (public.current_member_id() is not null);

alter policy comp_select_authenticated on public.companion
  using (public.current_member_id() is not null);

alter policy question_select_authenticated on public.question
  using (public.current_member_id() is not null);

-- ── Inhalte ─────────────────────────────────────────────────────────────────
alter policy document_select_all on public.document
  using (public.current_member_id() is not null);

alter policy news_select_all on public.news_post
  using (public.current_member_id() is not null);

alter policy club_venue_select_all on public.club_venue
  using (public.current_member_id() is not null);

-- ── Storage: die Dateien selbst ─────────────────────────────────────────────
-- Ohne das hier wäre die Härtung wirkungslos — Profilfotos und Dokumente hängen
-- nicht an den Tabellen-Policies, sondern an denen auf storage.objects.
alter policy "member_photos_read" on storage.objects
  using (bucket_id = 'member-photos' and public.current_member_id() is not null);

alter policy "documents_read" on storage.objects
  using (bucket_id = 'documents' and public.current_member_id() is not null);
