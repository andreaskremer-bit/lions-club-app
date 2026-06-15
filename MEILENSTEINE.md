# Meilenstein-Protokoll

Kurze „erledigt / offen"-Notiz je Meilenstein (Lieferform laut HANDOFF.md).

## M0 – Fundament — erledigt

**Erledigt**

- SvelteKit + TypeScript gescaffoldet (`sv create`, Svelte 5 Runes), ESLint + Prettier.
- Konfiguration in `vite.config.ts` (neue vite-plugin-svelte-Variante, kein separates `svelte.config.js`):
  - `@sveltejs/adapter-netlify` + `netlify.toml`.
  - `@vite-pwa/sveltekit` mit Web-App-Manifest (Name, Theme `#1E4FA3`, Icons 192/512/maskable). Offline-Shell/Reminder-SW folgen in M5.
- Design-Tokens „Lions 2.0" 1:1 portiert nach `src/lib/styles/tokens/` (colors, typography, spacing, base) + `components.css`; Einstieg `src/lib/styles/app.css`.
- **Schriften self-hosted** via `@fontsource-variable/*` (Source Serif 4 / Sans 3 / Code Pro), Import in `+layout.svelte`. **Kein Google-Fonts-CDN** (DSGVO) — verifiziert: 0 Referenzen im HTML.
- Kernkomponenten in Svelte nachgebaut (`src/lib/components/ui/`): Button, IconButton, Card, Avatar, Tag, StatusBadge, Input, OtpInput, SegmentedControl, ListRow, TabBar, AppBar. Status-Vokabeln fix (Zugesagt/Abgesagt/Offen/Anwesend).
- Supabase angebunden (`@supabase/ssr`): `hooks.server.ts` (Server-Client, `safeGetSession` mit `getUser`-Validierung, Auth-Guard), `+layout.ts`/`+layout.server.ts`, Auth-Listener im Root-Layout.
- **E-Mail-OTP-Auth** (6-stelliger Code): `/login` (E-Mail → Code, `signInWithOtp` mit `shouldCreateUser:false` → `verifyOtp`), geschützte Startseite mit Abmelden. Guard leitet nicht eingeloggte Nutzer auf `/login` (verifiziert: `/` → 303 → `/login`).
- Icons als Platzhalter aus `design-referenz/assets` (PWA-Icon, „LC"-Monogramm). **Offizielles Lions-Emblem bewusst NICHT eingebaut** (markenrechtlich, Freigabe ausstehend) — Login nutzt das Monogramm.
- Qualität: `npm run check` 0 Fehler, `npm run lint` sauber, `npm run build` erfolgreich.

- **OTP-Login end-to-end verifiziert (2026-06-15):** Echtes Supabase-Projekt (EU/Frankfurt, ref `qfxtyqippdrcrhwbkhwx`) verdrahtet, `.env` mit echten Keys. Club-eigener SMTP (`webmaster@lions-bonn-rheinaue.de` via `smtp.gmail.com:587`, Google-App-Passwort) sendet erfolgreich; Template auf `{{ .Token }}`, OTP-Länge auf 6 gestellt. Browser-Login `/login` → geschützte Startseite funktioniert.

**Offen / als Nächstes**

- Offizielles Lions-Emblem nach Freigabe durch den Club einsetzen (`static/icons/`, Login-Brand).
- Mapping `auth.users` ↔ `member` (kommt mit M1-Datenmodell).
- Vitest/Playwright-Setup (Tests ab M1 für RLS verpflichtend).
- **Go-live:** SMTP-Versand von App-Passwort auf OAuth2/Gmail-API (Supabase „Send Email Hook") umstellen.
- **Dev-Stolperstein dokumentiert:** PWA-Service-Worker cachte ein altes Bundle mit Platzhalter-Keys → Login schlug fehl, bis SW deregistriert wurde. Vor M-Tests SW in Dev zähmen (`devOptions`/`registerType`), siehe Memo.

## M1 – Mitglieder — erledigt

**Erledigt (2026-06-15)**

- **Lokaler Supabase-Workflow:** `supabase init`, CLI als gepinnte devDependency, Skripte `npm run db:start|db:stop|db:reset|db:test`. Lokaler Stack via Docker.
- **Schema (versionierte Migrationen, `supabase/migrations/`):** `member` (Kontakt, Foto-Pfad, `status` Enum `aktiv|inaktiv|ehrenmitglied`, Beitritt/Geburtstag, **Partner inline**), `amt`/`amt_permission`/`member_amt` mit Rechte-Seed (Matrix Spec §3, Enum `app_permission`), Anzeige-Titel via `display_only`.
- **Mapping `auth.users` ↔ `member`:** `member.user_id` + Trigger `link_member_to_auth_user` (verknüpft per E-Mail beim Anlegen des Auth-Users).
- **RLS-Policies pro Tabelle** + Helper `current_member_id()`/`has_permission()` (SECURITY DEFINER) + Spaltenschutz-Trigger (Selbstpflege darf Status/E-Mail/Konto nicht ändern; System-Kontext via `auth.uid() is null` ausgenommen) + Grants für `authenticated`.
- **Tests:** 17 **pgTAP-RLS-Tests** (`supabase/tests/member_rls_test.sql`), `npm run db:test` grün — Sichten Mitglied/Sekretär/Webmaster/anon, inkl. Link-Trigger & Spaltenschutz.
- **UI:** `/mitglieder` (Verzeichnis: Suche, Status-Filter, Avatar/Amt/Status, clientseitig mit RLS), `/mitglieder/[id]` (Profil: Direkt-Anruf/-Mail, Ämter, Partner), `/mitglieder/[id]/bearbeiten` (**Selbstpflege**). Startseiten-Link.
- **Dev-Seed** (`supabase/seed.sql`): 8 Beispiel-Mitglieder + Ämter + lokale Auth-User. Login lokal über Mailpit verifiziert.
- Qualität: `npm run check` 0 Fehler/0 Warnungen, eigene Dateien prettier-konform.

**Offen / als Nächstes**

- Vitest/Playwright (App-/E2E-Tests) — RLS ist über pgTAP abgedeckt, Unit/E2E folgen.
- ~~Admin-Funktionen Mitglieder (Neumitglied anlegen/einladen, fremde Stammdaten/Ämter pflegen, löschen)~~ **erledigt 2026-06-17:** `/mitglieder/neu`, Bearbeiten verallgemeinert (Status/Ämter/Löschen, rechte-gated), Einladen via `POST /api/mitglieder/[id]/einladen` (Service-Key serverseitig). Sekretär zusätzlich `manage_roles`+`delete_member`.
- ~~Foto-Upload (Storage-Bucket für `photo_path`)~~ **erledigt 2026-06-17:** privater Bucket `member-photos` + Storage-RLS, Upload/Entfernen im Bearbeiten, Anzeige via signierte URLs.
- ~~Geburtstagsübersicht (Spec §4.1)~~ **erledigt 2026-06-17:** `/geburtstage`, nach nächstem Geburtstag sortiert.

## M2 – Termine — erledigt

**Erledigt (2026-06-16)**

- **Schema (Migrationen):** `event` (Typ-Enum; aus `type` generierte Spalten `companion_allowed`/`donation_required` = Matrix Spec §4.2), `event_response` (RSVP `zugesagt`/`abgesagt`; „Offen" = keine Zeile), `companion` (Begleitperson je Rückmeldung).
- **RLS + Tests:** eigene Rückmeldung schreibbar, **Vergangenheits-Sperre** (`starts_at > now()`), Begleitperson nur bei erlaubtem Typ; Termine verwalten mit `manage_events`. **11 pgTAP-Tests** (gesamt 28 grün).
- **UI:** `/termine` (Übersicht Anstehend/Vergangen, eigener Status als Badge, Zähler angemeldet/abgemeldet/offen, **antippbar → Meldungen-Sheet** mit Namensliste je Status; „Offen" = aktive ohne Rückmeldung), `/termine/[id]` (Detail: Anmelden/Abmelden beide sichtbar, Kommentar, Begleitpersonen hinzufügen/entfernen, Meldungen-Listen). Startseiten-Link.
- **Dev-Seed:** 6 Termine (vergangen + anstehend, alle Typen) + Rückmeldungen + Begleitperson.
- Qualität: `npm run check` 0/0; eigene Dateien prettier-konform.

**Offen / als Nächstes**

- Kalenderansicht der Termine (Listenansicht steht; Kalender ist „Soll").
- Echtzeit-Aktualisierung der Teilnehmerlisten (optional, Supabase Realtime).

## M3 – Anwesenheit (ohne Beträge) — erledigt

**Erledigt (2026-06-17)** — Scope durch Club präzisiert: **keine Beträge/Spenden-Datensätze** in der App; der Schatzmeister rechnet den (allen bekannten, per MV-Beschluss änderbaren) Betrag **einmal jährlich extern** ab. Die App erfasst nur **anwesend/abwesend**.

- **Schema:** `attendance` (Termin × Mitglied: `present`, `recorded_by`/`recorded_at`). KEIN `donation_entry`, KEIN `setting`.
- **RLS + Tests:** Erfassen nur mit `record_attendance` (Sekretär/Präsident/Vize) **und nur für spendenpflichtige Termine**; Anwesenheitsdaten sichtbar nur für `record_attendance`/`view_donations` (nicht normale Mitglieder). 7 pgTAP-Tests (gesamt **35 grün**).
- **Erfassung-UI:** `/termine/[id]/anwesenheit` — alle Mitglieder (auch inaktiv/Ehren fürs Protokoll), anwesend/abwesend je Person, „Alle anwesend", Speichern (upsert). Button im Termin-Detail nur bei spendenpflichtigem Typ + Recht.
- **Schatzmeister-Auswertung:** `/auswertung` (nur `view_donations`) — Lions-Jahr-Auswahl (1.7.–30.6., Default laufendes Jahr), Abwesenheiten je **aktivem** Mitglied (inaktiv/Ehren befreit), **CSV-Export**. Keine Geldbeträge.
- **Layout:** Root-`+layout.ts` liefert `memberId` + `permissions` für rechte-abhängige UI.
- Dev-Seed: Anwesenheit am vergangenen Club-Abend (3 aktive Abwesenheiten).

**Offen / als Nächstes**

- PDF-Export der Auswertung — **optional** (Club: CSV reicht).
- ~~Mitschleppen: Vitest/Playwright, Mitglieder-Admin-UI, Foto-Upload, Geburtstagsübersicht, Kalenderansicht~~ **alle erledigt (2026-06-17).**

## M4 – Abfragen & Admin — erledigt

**Erledigt (2026-06-17)**

- **Engine:** `question` (single/multi/text/boolean/number je Termin) + `answer` (value jsonb, Antwort pro Person — Mitglied oder einzelne Begleitperson; partielle Unique-Indizes). RLS: Fragen verwalten mit `manage_events`; Antworten nur eigene + Zukunft + gültige eigene Begleitperson (Helper `may_answer`); lesen eigene + `manage_events`. **9 pgTAP-Tests** (gesamt 44 grün).
- **UI:** `/termine/[id]/fragen` (Builder), Beantworten im Termin-Detail via `AnswerField` (Mitglied + je Begleitperson, schreibgeschützt bei vergangenen Terminen), `/termine/[id]/teilnehmer` (Antworten je Person + **CSV**). Seed: Beispiel-Fragen.
- **Tests/Infra:** Vitest (`src/lib/dates.ts` + 6 Unit-Tests) + Playwright (E2E-Smoke), Skripte `test:unit`/`test:e2e`.

- **Admin-Jahresplanung:** `/termine/planung` (manage_events) — Einzeltermin oder Serie (wöchentlich/14-täglich/monatlich + Anzahl) mit Vorschau + Bulk-Insert; „+" in der Übersicht. `seriesDates()` (+4 Unit-Tests). Zugleich die einzige Event-Erstellungs-UI.

## M5 – Engagement — erledigt

**Erledigt (2026-06-17) — Reminder-Logik + In-App-Zustellung**

- **Outbox `notification`** (je Empfänger) + `push_subscription` + `event.reminder_days_before` (Vorlauf je Termin, Default 3).
- **`enqueue_due_reminders(p_today)`** (idempotent): Termin-Reminder an aktive Nicht-Rückmelder (Vorlauf je Termin), Geburtstags-Reminder an alle, Vorstand-Erinnerung zur Anwesenheitserfassung.
- **In-App:** `/benachrichtigungen` (Liste, „Alle als gelesen", Reminder verlinken ins Termin-Detail) + Glocke mit Ungelesen-Badge auf der Startseite.

**Erledigt (2026-06-18) — Versandkanäle + Offline-Shell + Geheim-Phasen-Sicherung**

- **Empfänger-Gate (Sicherung):** `member.notifications_enabled` (Default **false**, fail-safe). `enqueue_due_reminders` erzeugt Reminder **nur für freigeschaltete Mitglieder** → in der Geheim-Phase bekommen reale Mitglieder weder In-App-Einträge noch Push/E-Mail. Migration `20260618120100_notifications_gate.sql`. **2 neue pgTAP-Gate-Tests** (gesamt **52 grün**).
- **Web-Push:** VAPID-Keypair erzeugt (`PUBLIC_VAPID_KEY` in `.env`, privat in `.env.local`/Edge-Secret). Helfer `src/lib/push.ts` (+`push.test.ts`, 4 Unit-Tests). Service Worker via vite-pwa **`generateSW`** (Default): Offline-Asset-Precache inkl. self-hosted Fonts; `push`/`notificationclick`-Handler kommen per `workbox.importScripts` aus `static/sw-push.js`. **Hinweis:** zuerst mit `injectManifest`+`src/service-worker.ts` gebaut — das scheiterte auf Netlify unter rolldown-vite 8 (swSrc-ENOENT-Race im closeBundle), daher auf `generateSW` umgestellt (entkoppelt vom SvelteKit-SW-Build).
- **Subscribe-Flow:** Karte „Push-Benachrichtigungen" auf `/benachrichtigungen` (Zustände unsupported/denied/on/off, Permission → `pushManager.subscribe` → `push_subscription`-Upsert; Deaktivieren = unsubscribe + Delete; iOS-Hinweis).
- **Edge Function `send-notifications`** (Deno): liest Outbox (`sent_at is null`), Web-Push (`npm:web-push`) + **E-Mail-Fallback** (Club-SMTP via `denomailer`); ungültige Abos (404/410) werden gelöscht; `sent_at` nach Zustellung. **Dry-Run-Gate** `REMINDERS_ARMED` (Default aus) + optionale Allowlist `REMINDERS_ALLOWLIST`. `config.toml`: `verify_jwt=false`, Bearer-Service-Key-Schutz.
- **Manueller Test-Trigger:** `POST /api/admin/reminders/run` (nur `manage_members`, Service-Key) ruft `enqueue` + optional Versand; Buttons auf `/benachrichtigungen` (nur Vorstand) → Live-Test ohne CLI.
- **`reminder_days_before`-Override:** Feld „Erinnerung (Tage vorher)" im Anlege-/Serien-Formular `/termine/planung`.
- **Versand-Cron (Go-live, inert):** zweiter guarded `cron.schedule` ruft via `pg_net` die Edge Function — wird nur angelegt, wenn pg_cron+pg_net aktiv UND DB-Settings `app.edge_send_url`/`app.edge_send_token` gesetzt sind.

**Go-live-Schalter (NICHT scharfgestellt — Geheim-Phase):**

1. `update public.member set notifications_enabled = true where status = 'aktiv';`
2. Edge-Secrets: `REMINDERS_ARMED=true`, `VAPID_*`, `SMTP_*`; `REMINDERS_ALLOWLIST` leeren.
3. Extensions `pg_cron` + `pg_net` im Dashboard aktivieren; `app.edge_send_url`/`app.edge_send_token` setzen.
4. `supabase functions deploy send-notifications`.

## M6 – Rest & Launch — in Arbeit

**Dokumente — erledigt (2026-06-19)** — zentrale Ablage mit deutscher Volltextsuche, löst den E-Mail-Versand der Protokolle ab.

- **Schema** (`20260619120100_document.sql`): Tabelle `document` (Kategorie-Enum `protokoll_clubabend`/`protokoll_mv`/`satzung`/`sonstige`, `doc_date`, optionaler `event_id`-Link, `content_text`, generierte `search_tsv` (deutsch) + GIN-Index). RLS: alle lesen, `publish_content` schreibt. Privater Bucket `documents` + Storage-RLS (Muster `member-photos`).
- **Volltext serverseitig:** Edge Function `extract-document-text` (PDF via `unpdf`, DOCX via ZIP+XML) füllt `content_text`; ausgelöst per Client-`functions.invoke` nach Upload (Abweichung vom Plan: statt DB-Webhook — robuster, kein Setup). Suche im UI per `textSearch(websearch, german)`. PDF/DOCX inhaltlich indiziert; XLSX/Bilder nur Metadaten.
- **Benachrichtigung:** `notification_kind` um `document` erweitert + `notification.document_id` (Dedupe-Index angepasst); `notify_document()` (SECURITY DEFINER, Empfänger-Gate) erzeugt In-App/Push für aktive, freigeschaltete Mitglieder. Checkbox „Mitglieder benachrichtigen" beim Upload (Default an bei Protokollen). `send-notifications` + In-App-`open()` verlinken Dokumente.
- **UI:** `/dokumente` (Liste, Kategorie-Chips, Sortierung Datum/Titel/Kategorie, Suchfeld, Download via signierte URL), `/dokumente/neu`, `/dokumente/[id]/bearbeiten`; Startseiten-Button. Verwalten nur `publish_content` (Präsident/Vize/Sekretär — bereits im Seed).
- **Tests:** `document_rls_test.sql` (8 pgTAP: Lesen für alle, Schreiben/notify nur mit Recht, Gate, deutsche FTS) → **gesamt 60 pgTAP grün**. `check`/`lint`/Build grün.
- **Go-live-Setup:** Edge Function deployen; Volltext-Extraktion läuft über Client-Invoke (kein DB-Webhook nötig). Optional alternativ DB-Webhook.

**News — erledigt (2026-06-19)** — Vereinsnachrichten-Feed (Spec §4.5), Klartext mit Zeilenumbrüchen + automatisch verlinkten URLs.

- **Schema** (`20260620120100_news.sql`): `news_post` (Titel, Text, `pinned`, `published_by`, `published_at`); RLS alle lesen / `publish_content` schreibt; Grants inkl. `service_role`.
- **Benachrichtigung** (`…120200`/`…120300`): `notification_kind` `news` + `news_post_id` (Dedupe-Index erweitert); `notify_news()` (SECURITY DEFINER, Empfänger-Gate); Checkbox „Mitglieder benachrichtigen" beim Veröffentlichen. `send-notifications` + In-App-`open()` verlinken News.
- **UI:** `/news` (Feed, angepinnt+neueste zuerst, Linkify via `src/lib/news.ts`), `/news/neu`, `/news/[id]/bearbeiten`; Startseiten-Button. `publish_content` verwaltet.
- **Tests:** `news_rls_test.sql` (7 pgTAP) → **gesamt 67 pgTAP**; `news.test.ts` (4 Vitest, linkify) → 18 Unit; check/lint/build grün.

**Offen:** Galerie-Link (Verlinkung Google-Share); Pro-Plan; OAuth2-Mailversand; M5/M6 aufs Remote pushen + Edge Functions deployen; M5/M6 scharfstellen (Go-live).
