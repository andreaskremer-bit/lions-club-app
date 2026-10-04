# Meilenstein-Protokoll

Kurze „erledigt / offen“-Notiz je Meilenstein (Lieferform laut HANDOFF.md).

## M0 – Fundament — erledigt

**Erledigt**

- SvelteKit + TypeScript gescaffoldet (`sv create`, Svelte 5 Runes), ESLint + Prettier.
- Konfiguration in `vite.config.ts` (neue vite-plugin-svelte-Variante, kein separates `svelte.config.js`):
  - `@sveltejs/adapter-netlify` + `netlify.toml`.
  - `@vite-pwa/sveltekit` mit Web-App-Manifest (Name, Theme `#1E4FA3`, Icons 192/512/maskable). Offline-Shell/Reminder-SW folgen in M5.
- Design-Tokens „Lions 2.0“ 1:1 portiert nach `src/lib/styles/tokens/` (colors, typography, spacing, base) + `components.css`; Einstieg `src/lib/styles/app.css`.
- **Schriften self-hosted** via `@fontsource-variable/*` (Source Serif 4 / Sans 3 / Code Pro), Import in `+layout.svelte`. **Kein Google-Fonts-CDN** (DSGVO) — verifiziert: 0 Referenzen im HTML.
- Kernkomponenten in Svelte nachgebaut (`src/lib/components/ui/`): Button, IconButton, Card, Avatar, Tag, StatusBadge, Input, OtpInput, SegmentedControl, ListRow, TabBar, AppBar. Status-Vokabeln fix (Zugesagt/Abgesagt/Offen/Anwesend).
- Supabase angebunden (`@supabase/ssr`): `hooks.server.ts` (Server-Client, `safeGetSession` mit `getUser`-Validierung, Auth-Guard), `+layout.ts`/`+layout.server.ts`, Auth-Listener im Root-Layout.
- **E-Mail-OTP-Auth** (6-stelliger Code): `/login` (E-Mail → Code, `signInWithOtp` mit `shouldCreateUser:false` → `verifyOtp`), geschützte Startseite mit Abmelden. Guard leitet nicht eingeloggte Nutzer auf `/login` (verifiziert: `/` → 303 → `/login`).
- Icons als Platzhalter aus `design-referenz/assets` (PWA-Icon, „LC“-Monogramm). **Offizielles Lions-Emblem bewusst NICHT eingebaut** (markenrechtlich, Freigabe ausstehend) — Login nutzt das Monogramm.
- Qualität: `npm run check` 0 Fehler, `npm run lint` sauber, `npm run build` erfolgreich.

- **OTP-Login end-to-end verifiziert (2026-06-15):** Echtes Supabase-Projekt (EU/Frankfurt, ref `qfxtyqippdrcrhwbkhwx`) verdrahtet, `.env` mit echten Keys. Club-eigener SMTP (`webmaster@lions-bonn-rheinaue.de` via `smtp.gmail.com:587`, Google-App-Passwort) sendet erfolgreich; Template auf `{{ .Token }}`, OTP-Länge auf 6 gestellt. Browser-Login `/login` → geschützte Startseite funktioniert.

**Offen / als Nächstes**

- Offizielles Lions-Emblem nach Freigabe durch den Club einsetzen (`static/icons/`, Login-Brand).
- Mapping `auth.users` ↔ `member` (kommt mit M1-Datenmodell).
- Vitest/Playwright-Setup (Tests ab M1 für RLS verpflichtend).
- **Go-live:** SMTP-Versand von App-Passwort auf OAuth2/Gmail-API (Supabase „Send Email Hook“) umstellen.
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

- **Schema (Migrationen):** `event` (Typ-Enum; aus `type` generierte Spalten `companion_allowed`/`donation_required` = Matrix Spec §4.2), `event_response` (RSVP `zugesagt`/`abgesagt`; „Offen“ = keine Zeile), `companion` (Begleitperson je Rückmeldung).
- **RLS + Tests:** eigene Rückmeldung schreibbar, **Vergangenheits-Sperre** (`starts_at > now()`), Begleitperson nur bei erlaubtem Typ; Termine verwalten mit `manage_events`. **11 pgTAP-Tests** (gesamt 28 grün).
- **UI:** `/termine` (Übersicht Anstehend/Vergangen, eigener Status als Badge, Zähler angemeldet/abgemeldet/offen, **antippbar → Meldungen-Sheet** mit Namensliste je Status; „Offen“ = aktive ohne Rückmeldung), `/termine/[id]` (Detail: Anmelden/Abmelden beide sichtbar, Kommentar, Begleitpersonen hinzufügen/entfernen, Meldungen-Listen). Startseiten-Link.
- **Dev-Seed:** 6 Termine (vergangen + anstehend, alle Typen) + Rückmeldungen + Begleitperson.
- Qualität: `npm run check` 0/0; eigene Dateien prettier-konform.

**Offen / als Nächstes**

- Kalenderansicht der Termine (Listenansicht steht; Kalender ist „Soll“).
- Echtzeit-Aktualisierung der Teilnehmerlisten (optional, Supabase Realtime).

## M3 – Anwesenheit (ohne Beträge) — erledigt

**Erledigt (2026-06-17)** — Scope durch Club präzisiert: **keine Beträge/Spenden-Datensätze** in der App; der Schatzmeister rechnet den (allen bekannten, per MV-Beschluss änderbaren) Betrag **einmal jährlich extern** ab. Die App erfasst nur **anwesend/abwesend**.

- **Schema:** `attendance` (Termin × Mitglied: `present`, `recorded_by`/`recorded_at`). KEIN `donation_entry`, KEIN `setting`.
- **RLS + Tests:** Erfassen nur mit `record_attendance` (Sekretär/Präsident/Vize) **und nur für spendenpflichtige Termine**; Anwesenheitsdaten sichtbar nur für `record_attendance`/`view_donations` (nicht normale Mitglieder). 7 pgTAP-Tests (gesamt **35 grün**).
- **Erfassung-UI:** `/termine/[id]/anwesenheit` — alle Mitglieder (auch inaktiv/Ehren fürs Protokoll), anwesend/abwesend je Person, „Alle anwesend“, Speichern (upsert). Button im Termin-Detail nur bei spendenpflichtigem Typ + Recht.
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

- **Admin-Jahresplanung:** `/termine/planung` (manage_events) — Einzeltermin oder Serie (wöchentlich/14-täglich/monatlich + Anzahl) mit Vorschau + Bulk-Insert; „+“ in der Übersicht. `seriesDates()` (+4 Unit-Tests). Zugleich die einzige Event-Erstellungs-UI.

## M5 – Engagement — erledigt

**Erledigt (2026-06-17) — Reminder-Logik + In-App-Zustellung**

- **Outbox `notification`** (je Empfänger) + `push_subscription` + `event.reminder_days_before` (Vorlauf je Termin, Default 3).
- **`enqueue_due_reminders(p_today)`** (idempotent): Termin-Reminder an aktive Nicht-Rückmelder (Vorlauf je Termin), Geburtstags-Reminder an alle, Vorstand-Erinnerung zur Anwesenheitserfassung.
- **In-App:** `/benachrichtigungen` (Liste, „Alle als gelesen“, Reminder verlinken ins Termin-Detail) + Glocke mit Ungelesen-Badge auf der Startseite.

**Erledigt (2026-06-18) — Versandkanäle + Offline-Shell + Geheim-Phasen-Sicherung**

- **Empfänger-Gate (Sicherung):** `member.notifications_enabled` (Default **false**, fail-safe). `enqueue_due_reminders` erzeugt Reminder **nur für freigeschaltete Mitglieder** → in der Geheim-Phase bekommen reale Mitglieder weder In-App-Einträge noch Push/E-Mail. Migration `20260618120100_notifications_gate.sql`. **2 neue pgTAP-Gate-Tests** (gesamt **52 grün**).
- **Web-Push:** VAPID-Keypair erzeugt (`PUBLIC_VAPID_KEY` in `.env`, privat in `.env.local`/Edge-Secret). Helfer `src/lib/push.ts` (+`push.test.ts`, 4 Unit-Tests). Service Worker via vite-pwa **`generateSW`** (Default): Offline-Asset-Precache inkl. self-hosted Fonts; `push`/`notificationclick`-Handler kommen per `workbox.importScripts` aus `static/sw-push.js`. **Hinweis:** zuerst mit `injectManifest`+`src/service-worker.ts` gebaut — das scheiterte auf Netlify unter rolldown-vite 8 (swSrc-ENOENT-Race im closeBundle), daher auf `generateSW` umgestellt (entkoppelt vom SvelteKit-SW-Build).
- **Subscribe-Flow:** Karte „Push-Benachrichtigungen“ auf `/benachrichtigungen` (Zustände unsupported/denied/on/off, Permission → `pushManager.subscribe` → `push_subscription`-Upsert; Deaktivieren = unsubscribe + Delete; iOS-Hinweis).
- **Edge Function `send-notifications`** (Deno): liest Outbox (`sent_at is null`), Web-Push (`npm:web-push`) + **E-Mail-Fallback** (Club-SMTP via `denomailer`); ungültige Abos (404/410) werden gelöscht; `sent_at` nach Zustellung. **Dry-Run-Gate** `REMINDERS_ARMED` (Default aus) + optionale Allowlist `REMINDERS_ALLOWLIST`. `config.toml`: `verify_jwt=false`, Bearer-Service-Key-Schutz.
- **Manueller Test-Trigger:** `POST /api/admin/reminders/run` (nur `manage_members`, Service-Key) ruft `enqueue` + optional Versand; Buttons auf `/benachrichtigungen` (nur Vorstand) → Live-Test ohne CLI.
- **`reminder_days_before`-Override:** Feld „Erinnerung (Tage vorher)“ im Anlege-/Serien-Formular `/termine/planung`.
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
- **Benachrichtigung:** `notification_kind` um `document` erweitert + `notification.document_id` (Dedupe-Index angepasst); `notify_document()` (SECURITY DEFINER, Empfänger-Gate) erzeugt In-App/Push für aktive, freigeschaltete Mitglieder. Checkbox „Mitglieder benachrichtigen“ beim Upload (Default an bei Protokollen). `send-notifications` + In-App-`open()` verlinken Dokumente.
- **UI:** `/dokumente` (Liste, Kategorie-Chips, Sortierung Datum/Titel/Kategorie, Suchfeld, Download via signierte URL), `/dokumente/neu`, `/dokumente/[id]/bearbeiten`; Startseiten-Button. Verwalten nur `publish_content` (Präsident/Vize/Sekretär — bereits im Seed).
- **Tests:** `document_rls_test.sql` (8 pgTAP: Lesen für alle, Schreiben/notify nur mit Recht, Gate, deutsche FTS) → **gesamt 60 pgTAP grün**. `check`/`lint`/Build grün.
- **Go-live-Setup:** Edge Function deployen; Volltext-Extraktion läuft über Client-Invoke (kein DB-Webhook nötig). Optional alternativ DB-Webhook.

**News — erledigt (2026-06-19)** — Vereinsnachrichten-Feed (Spec §4.5), Klartext mit Zeilenumbrüchen + automatisch verlinkten URLs.

- **Schema** (`20260620120100_news.sql`): `news_post` (Titel, Text, `pinned`, `published_by`, `published_at`); RLS alle lesen / `publish_content` schreibt; Grants inkl. `service_role`.
- **Benachrichtigung** (`…120200`/`…120300`): `notification_kind` `news` + `news_post_id` (Dedupe-Index erweitert); `notify_news()` (SECURITY DEFINER, Empfänger-Gate); Checkbox „Mitglieder benachrichtigen“ beim Veröffentlichen. `send-notifications` + In-App-`open()` verlinken News.
- **UI:** `/news` (Feed, angepinnt+neueste zuerst, Linkify via `src/lib/news.ts`), `/news/neu`, `/news/[id]/bearbeiten`; Startseiten-Button. `publish_content` verwaltet.
- **Tests:** `news_rls_test.sql` (7 pgTAP) → **gesamt 67 pgTAP**; `news.test.ts` (4 Vitest, linkify) → 18 Unit; check/lint/build grün.

**Galerie-Link — erledigt (2026-06-19)** — Spec §4.7: Verlinkung aufs bestehende geteilte Google-Drive (kein eigener Upload/Storage). `/galerie`-Seite (Beschreibung + Button „Galerie öffnen“, externer Link via `window.open`) + Startseiten-Button. Ziel-URL aus Env `PUBLIC_GALLERY_URL` (`$env/dynamic/public`); leer = „noch nicht hinterlegt“. Keine DB/Tests nötig.

**M6-Inhalte damit komplett (Dokumente, News, Galerie).**

**Offen (Go-live):** Pro-Plan; OAuth2-Mailversand; M5/M6-Migrationen aufs Remote pushen + Edge Functions deployen; `PUBLIC_GALLERY_URL` als Netlify-Env setzen; M5/M6 scharfstellen.

## P2.1 – Kleinverbesserungen (erledigt 2026-06-16, LIVE, Commit `5be1b8b`)

Drei vom Club gewünschte Detailverbesserungen; Reihenfolge eingehalten (`supabase db push` zuerst, dann `git push`).

- **Partner als Begleitperson** (`/termine/[id]`): Button „<Partnername> hinzufügen“ übernimmt den am Mitglied gepflegten Partner (`partner_first_name/last_name`) als `companion` — nur wenn ein Partner gepflegt ist, du zugesagt hast und er noch nicht eingetragen ist (kein Doppel). Freitext-Eingabe für sonstige Gäste bleibt. Keine Migration.
- **Referent/in-Feld** `event.speaker` (Migration `20260621120100_event_speaker.sql`, nullable; keine RLS/Grant-Änderung): Eingabe „Referent/in (optional)“ beim Anlegen (`/termine/planung`, nur Einzeltermin — bei Serien i. d. R. verschieden) und Bearbeiten; Anzeige unter dem Titel auf der Detailseite.
- **Startseite** (`/+page.svelte` + `/+page.ts`): zwei anklickbare Karten „Nächster Termin“ (`starts_at >= now`, limit 1 → Detailseite) und „Neueste News“ (pinned/published_at, limit 1 → Beitrag), je mit Leer-Zustand. Veraltete M0-Begrüßung entfernt.

`npm run check` (0 Fehler) + ESLint grün. Migration via `supabase db push` aufs Remote angewendet, dann gepusht → Netlify-Auto-Deploy.

## P4 – Benachrichtigungs-Präferenzen (erledigt 2026-06-16, LIVE)

Versandkanal je Mitglied wählbar; **kein Voll-Opt-out** — In-App-Hinweise erhält jedes freigeschaltete Mitglied weiterhin immer (Empfänger-Gate `notifications_enabled`). Die neue Spalte steuert nur die externen Kanäle.

- **Schema** (`20260621120200_notification_channel.sql`): Enum `notification_channel` (`push`/`email`/`both`) + Spalte `member.notification_channel` (Default `both`). Keine RLS-Änderung nötig: `member_update_self` erlaubt Selbstpflege, `protect_member_columns()` schützt nur Status/E-Mail/Konto (nicht diese Spalte).
- **Versand** (`send-notifications`): liest `notification_channel` mit; `push` = nur Web-Push, `email` = nur E-Mail, `both` = Push mit E-Mail-Fallback (bisheriges Verhalten). Dry-Run-Log nennt den Kanal.
- **UI** (`/benachrichtigungen`): Sektion „Versandkanäle“ mit `SegmentedControl` (Nur Push / Nur E-Mail / Beide); lädt + speichert die eigene Wahl (optimistisch, Rollback bei Fehler).
- **Tests:** `notification_channel_test.sql` (4 pgTAP: Default `both`, Self-Update erlaubt, nicht spaltengeschützt, Enum-Schranke) → **gesamt 82 pgTAP grün** (lokal verifiziert). check/lint grün.
- **Deploy-Reihenfolge:** `supabase db push` → `supabase functions deploy send-notifications` → `git push`.

**SPEZIFIKATION.md nachgezogen:** Region **eu-west-1 (Irland)** statt „Frankfurt“ (3 Stellen); P4-Kanalwahl in §4.4 ergänzt. (Sekretär-Zusatzrechte `manage_roles`/`delete_member` standen bereits drin, Beschluss 2026-06-17.)

## P3 – Lions-Deutschland-Export (erledigt 2026-06-16, LIVE)

Mitglieder-Export für die Meldung an Lions Deutschland (Wiesbaden). Entscheidung: **allgemeines CSV jetzt** (echtes Lions-Template später aufmappen), **alle Mitglieder inkl. inaktive**.

- **Felder:** Pflicht (Titel/Vorname/Nachname/Status) + Kontakt (E-Mail/Festnetz/Mobil/Büro) + Adresse (Straße/PLZ/Ort) + Daten (Geburtstag/Eintritt). **Partner-Daten & Notizen bewusst ausgelassen** (DSGVO-Datensparsamkeit).
- **Helfer** `src/lib/lionsExport.ts`: `buildMemberCsv` (Excel-tauglich, gequotet, CRLF), `formatDate` (DD.MM.YYYY), Status-Label, `exportFilename`. Tests `lionsExport.test.ts` (8 Vitest → gesamt 31 Vitest).
- **Seite** `/mitglieder/export` (`+page.ts` lädt alle Mitglieder via Verzeichnis-RLS; `+page.svelte` gated `export_lions`, BOM im Blob für Umlaute). Link im „Mehr“-Hub gated `export_lions` (= Sekretär).
- **Keine Migration/RLS-Änderung** (Verzeichnis-RLS erlaubt das Lesen ohnehin; Gate nur Feature-Ebene). Funktional per Playwright verifiziert (als Sekretär: Download liefert korrektes CSV, 8 Mitglieder, Header + Status-Labels + DD.MM.YYYY).
- **Offen für später:** echtes Lions-Wiesbaden-Zielformat aufmappen, sobald die Spaltenvorgabe vorliegt.

## Design „Lions 2.0“ — Phase 1: App-Shell + Bottom-Navigation (erledigt 2026-06-16, LIVE)

Großer Design-Block, **phasenweise** umgesetzt. Die inhaltlichen Punchliste-Punkte (Titel=Thema, Status+Zähler, Jahresplanung, Zusatzabfragen, keine Spenden-Hinweise) waren bereits erfüllt; offen war v. a. die **Navigations-/IA-Schicht**. Tokens sind seit Beginn 1:1 aus `design-referenz/` übernommen; die Komponente `TabBar.svelte` + `.lc-tabbar`-CSS existierten, wurden aber nicht genutzt.

- **Globale Bottom-TabBar** (`src/routes/+layout.svelte`), **5 Tabs** (Nutzerentscheidung statt 4 referenztreu): **Start · Termine · Mitglieder · News · Mehr**. Nur eingeloggt & nicht auf `/login`; aktiver Tab aus dem Pfad (`$app/state`). Fix positioniert (`.app-tabbar`, zentriert auf Content-Breite); Hairline + Safe-Area kommen aus `.lc-tabbar`.
- **Unread-Badge** auf „Mehr“: `+layout.ts` lädt `unread` jetzt zentral (Tab-Badge auf jeder Seite korrekt); `+page.ts` bezieht es vom Parent.
- **Bottom-Padding** global: `.has-tabbar .shell__body` in `app.css`, damit Inhalt nicht hinter der Bar verschwindet.
- **Startseite verschlankt** (`/+page.svelte`): nur noch die zwei Dashboard-Karten + Glocke; lange Button-Liste entfernt.
- **Neuer „Mehr“-Hub** (`src/routes/mehr/+page.svelte`): Mein Profil, Geburtstage, Dokumente, Galerie, Benachrichtigungen, rechte-gated Auswertung/Vorstand, **„Ausloggen“** (Punchliste C4 gleich erledigt).
- **Mehr-Icon:** zunächst Burger (`Menu`) → Nutzer erwartete eine Schublade. „Mehr = eigene Hub-Seite mit Liste“ ist aber der Standard für Bottom-Tabs (referenztreu). Lösung: Icon `Menu`→`Ellipsis` („…“), Verhalten unverändert.
- Reine Frontend-Arbeit, **keine Migration/kein DB-Push**. check/lint/Build grün; lokal gesichtet.

## Design „Lions 2.0“ — Phase 2: Branding / echtes Lions-Emblem (erledigt 2026-06-16, LIVE)

- **App-/PWA-Icons** (`static/icons/pwa-192/512.png`, `pwa-maskable-512.png`, `favicon.png`) trugen das gebrandete Lions-Motiv bereits (byte-identisch mit `design-referenz/assets`) — kein Handlungsbedarf.
- **Vollständiges Lions-Emblem** (`design-referenz/assets/lions-emblem.png`) nach `static/icons/lions-emblem.png` übernommen.
- **Login-Brand-Lockup**: Emblem (108px) statt LC-Monogramm; Schriftzug + „We Serve“ bleiben.
- **Start-AppBar**: kleines Emblem (32px) als `leading`. Da der lange Titel + Emblem abschnitt (im Screenshot-Check gesehen), Header auf sauberes Lockup umgestellt: eyebrow „Lions Club“ + title „Bonn-Rheinaue“.
- **CLAUDE.md**-Designregel nachgezogen: Logo **vom Club freigegeben & in Nutzung** (nicht mehr „Platzhalter/nicht einbauen“); Monogramm nur noch Fallback.
- Reine Frontend-Arbeit, kein DB-Push. **Verifikation per Screenshot** (Playwright/Chromium gegen lokalen Dev, OTP-Login via Mailpit) — Login + Start bestätigt.

## Design „Lions 2.0“ — Phase 5: Punchliste-Reste / WCAG-AA (erledigt 2026-06-16, LIVE)

- **C5 (Datums-Chip „1206.“)**: in unserer App **nicht vorhanden** — alle Daten über `Intl.DateTimeFormat('de-DE', …)` mit echten Trennern („12. Juni“, „Fr., 19. Juni um 21:00 Uhr“). War ein reiner Prototyp-Befund. Nichts zu tun.
- **C6 (WCAG-AA-Kontrast)** exakt nachgerechnet (relative Luminanz): `text-secondary`/`text-muted` bestehen AA-normal überall (4.6–5.4:1). Einzige echte Verletzung: **`--gold-700` (#9a7218) = 3.89:1** für kleinen Text auf Creme → auf **#856010** abgedunkelt (jetzt ≥4.5:1 auf Creme/Card/Gold-100-Tint). Heller Akzent `--gold-600` (#b98a22, Punkte/Badges) bleibt — Gold-Identität erhalten.
- News-`.post__pin`-Icon nutzte das helle `var(--gold, #b98a22)` (~2.8:1, kaputter Tokenverweis) → `var(--gold-700)`.
- „Größe anheben“: 11px-Mono-Eyebrows (`.lc-appbar__eyebrow`, Login `.brand__sub`) → `var(--text-xs)` (12px).
- Reine Frontend/Token-Arbeit, kein DB-Push. Per Screenshot verifiziert (Login „WE SERVE“ + Termine-Liste „Zugesagt“-Badge lesbar & weiterhin golden).

## Design „Lions 2.0“ — Phase 3: fehlende Komponenten (erledigt 2026-06-16, LIVE)

Die vier Referenz-Komponenten gebaut, die noch fehlten — **Select, Checkbox, Switch, HintCard** (Specs aus `design-referenz/components/{forms,feedback}/*.prompt.md`).

- **CSS** als `.lc-select/.lc-check/.lc-switch/.lc-hint` in `components.css` (Referenz-CSS nutzt unsere Tokens). Svelte-5-Runes wie `Input.svelte`, Lucide-Icons, aus `index.ts` exportiert (`SelectOption`).
- **Select generisch** (`generics="T extends string"`), damit `bind:value` an typisierte Unions (EventType/MemberStatus/QuestionType) bindbar bleibt. **Checkbox**: zwei statische Inputs (Svelte verbietet dynamisches `type` mit `bind:checked`).
- **Adoptiert**: termine/planung (Typ+Rhythmus + Serie-Hinweis als HintCard), termine/[id]/bearbeiten, mitglieder/neu + [id]/bearbeiten (Status), mitglieder-Liste (show-inactive → Switch), news/neu + [id]/bearbeiten + dokumente/neu + [id]/bearbeiten (Selects + Checkbox-Opt-ins), termine/[id]/fragen. Viel totes `.field`/`.check`-CSS entfernt; `notify` (dokumente) als writable `$derived`.
- **Bewusst inline gelassen**: numerische Jahr-Selects in `vorstand`/`auswertung` (Select ist string-basiert) — Folge-Aufgabe.
- Reine Frontend-Arbeit, kein DB-Push. Per Screenshot verifiziert; check/lint/prettier grün.

## Design „Lions 2.0“ — Phase 4: CSS-Refactoring (erledigt 2026-06-16, LIVE) — Design-Block KOMPLETT

- **`.shell`/`.shell__body`** waren in **25 Dateien byte-identisch dupliziert** → zentrale globale Definition in `components.css` (Default `gap: var(--space-4)`). Lokale Blöcke entfernt; **9 dichtere Listen-Seiten behalten nur eine `gap`-Override-Zeile** (space-3, benachrichtigungen space-2) — die Variation ist bewusst (Listen enger, Formulare luftiger).
- **Netto −301 Zeilen / 26 Dateien.** Per Screenshot über alle Gap-Typen + die zwei Sonderfälle (mitglieder/neu, geburtstage) verifiziert — kein Spacing-Regress.
- **Bewusst nicht gemacht:** `.hero`/`.post`/`.bday` in Komponenten ziehen — die sind _nicht_ dupliziert (je eine CSS-Def, über Schleifen wiederverwendet bzw. 2× Startseite); Einzweck-Komponenten wären Umorganisation ohne Entdoppelung (YAGNI).
- Reine Frontend-Arbeit, kein DB-Push. check/lint/prettier grün.

**Damit ist der Design-„Lions 2.0“-Block komplett (Phasen 1–5).** Verbleibender Kleinkram: numerische Jahr-Selects (vorstand/auswertung) auf `Select` (string-basiert, Folge).

## Design „Lions 2.0“ — Feinschliff der Listen-Screens (erledigt 2026-06-16, LIVE)

Abgleich gegen die Original-Mockups (`design-referenz`): die Listen-Screens waren noch flacher als gedacht. Drei Screens nachgezogen (je eigener Commit, per Screenshot gegen Mockup verifiziert):

- **Gemeinsam:** große AppBar (`large` = fetter Serif-Titel + Mono-Eyebrow); Zurück-Pfeil von den Tab-Wurzeln entfernt; primäre AppBar-Aktion blau (`tone="primary"`).
- **Mitglieder:** Eyebrow als Live-Zähler „X aktiv · Y gesamt“; Zeilen = großer getönter Avatar + Name + Amt + **Telefon/Mail-Schnellaktionen** (`tel:`/`mailto:`), Zeile→Profil; Status-Badge entfällt. Eigenes `.mrow` (keine ListRow-als-Link wegen verschachtelter Aktions-Links).
- **Termine:** Liste/Kalender-Toggle als AppBar-Icon; **Monats-Gruppen**; Karten mit blauem **Datums-Chip** + Serif-Titel + Map-Pin + Ort·Zeit + Typ-/Status-Badge + **Icon-Zählern** ✓/✗/?.
- **News:** Karten mit **Autor-Kopf** (Avatar + Name + Amt · relative Zeit) + Serif-Headline + Text. `news/+page.ts` lädt Autor (`published_by`) + Amt (LJ-Filter in JS). Kein Kategorie-Badge (bewusst, kein neues Feld). Feed zeigt vollen Text (keine News-Detailseite vorhanden).
- Reine Frontend-Arbeit, kein DB-Push. check/lint/prettier grün.

## Design „Lions 2.0“ — Review-Runde UX-Korrekturen (erledigt 2026-06-16, LIVE)

Durchsicht auf echten iPhones; je Punkt diagnostiziert → Freigabe → Fix → Screenshot:

- **Termin-Detail:** Verwaltungs-Buttons liefen rechts raus (horizontaler Flex ohne Umbruch) → vollbreit gestapelt (`.admin-actions { flex-direction: column }`).
- **Zurück-Ziele:** „Mehr“-Hub-Unterseiten (auswertung, benachrichtigungen, dokumente, galerie, geburtstage, vorstand, lions-export) zeigten Back→`/` → auf `/mehr` umgestellt (Konvention: Unterseite zurück zu ihrem Hub; Profil bleibt `/mitglieder`).
- **AppBar-Höhe:** alle 5 Tab-Wurzeln jetzt `large` (vorher nur Termine/Mitglieder/News) → kein Höhensprung beim Tab-Wechsel; Drill-down-Seiten bleiben kompakt.
- **Karten-Komponenten:** `src/lib/components/EventCard.svelte` + `NewsCard.svelte` extrahiert; Termine, News **und Startseite** nutzen sie identisch (Start: dieselben Karten statt eigener `.hero`-Kacheln; Loader holt RSVP/Aktiv-Zähler/News-Autor). Behebt zugleich einen toten Link (Start „Neueste News“ → `/news`).
- **Formular-Abstände:** Felder klebten am Feld darüber → `.lc-card > *+* { margin-top: space-5 }` + `.form`-Wrapper auf space-5.
- **Geburtstage:** Monatstrenner wie bei Terminen (Mono-Header je Monat des nächsten Geburtstags).
- Reine Frontend-Arbeit, kein DB-Push.

## Infra: KeepAlive belastbar (erledigt 2026-06-16, Ziel = Free-Plan)

Der externe KeepAlive (gegen Supabase-Free-7-Tage-Pause) lief „grün“, aber mit **401** — das Repo-Secret `SUPABASE_ANON_KEY` enthielt den alten Legacy-Anon-JWT statt des aktuellen `sb_publishable_…`-Keys (beim Umstieg aufs neue Key-System deaktiviert). Nach Secret-Fix:

- **Workflow gehärtet:** täglicher Cron (`0 6 * * *`), `::error::` + `exit 1` bei non-200 (statt stiller Warnung).
- **Bulletproof-RPC:** Migration `20260621120300_keepalive_rpc.sql` — `public.keepalive()` (`select now()`, `security definer`, `grant execute to anon`). Workflow ruft `POST /rest/v1/rpc/keepalive` (apikey-only; **kein** `Authorization: Bearer` — Publishable-Key ist kein JWT) → echter DB-Roundtrip bis Postgres, sauberes 200, kein Datenzugriff. (Anon-REST gegen Tabellen liefert 401 — Grants nur `authenticated`.)
- `keepalive_test.sql` (3 pgTAP) → **gesamt 85**. Remote per `db push` + Live-Curl (200) verifiziert.

## Galerie — Umbau AUF HOLD (2026-06-16)

Aktuelle Lösung (Link aufs geteilte Google-Drive) bleibt vorerst; geplanter Umbau auf einen In-App-Viewer mit Supabase Storage + reduzierten Bildern (Drive bleibt einzige Verwaltungs-Oberfläche, Sync via Service-Account/GitHub-Action) wartet auf interne Club-Klärung. Vollständiges Konzept inkl. Optionen: **`docs/galerie-konzept.md`**.

## Chronik Juli 2026 (aus CLAUDE.md ausgelagert, 2026-07-30)

**Clubabend-Vorstellung (Mi 2026-07-15):** Für die Club-Vorstellung wurde eine selbstständige HTML-Präsentation (5 Folien, im Look der App) gebaut — liegt **außerhalb des Repos** unter `~/Desktop/Lions-App-Praesentation.html` (PII-frei, aber nicht Teil der App). Details + Tooling-Lehre (echte Live-Screenshots lassen sich aus dem Chrome-Tool nicht als Datei ziehen → app-treuer HTML-Nachbau statt Screenshots) im Memory `milestone-status`.

**Rollout 2026-07-16:** (1) **Bugfix Termin-Anlegen (Commit `09323cf`, LIVE):** „Präsident kann keine Veranstaltung anlegen“ war KEIN Rechteproblem, sondern ein Client-Crash — `reminderDays` (String-`$state`) an `<input type="number">` gebunden → Svelte 5 macht daraus beim Editieren eine Zahl → `reminderDays.trim()` warf `TypeError`, Button fror stumm ein (kein POST). Fix in `termine/planung` + `termine/[id]/bearbeiten` (`String(x ?? '').trim()` + try/catch/finally). **Lehre: bei `type="number"`-Inputs ist die gebundene Variable zur Laufzeit number|null — nie String-Methoden direkt darauf.** (2) **Alle 35 Mitglieder freigeschaltet:** jedes Mitglied hat jetzt ein Login-Konto (heute 24 via `POST /api/mitglieder/[id]/einladen` = `createUser`, **KEIN Mail-Versand** — Mitglieder müssen separat informiert werden, dass sie sich per OTP anmelden können). `notifications_enabled` weiterhin nur beim Admin-Konto (Geheim-Phase). (3) **Mitglieder-Bedienungsanleitung erstellt (bewusst NICHT im Repo — `docs/` ist seit 2026-07-20 gitignored, Dateien liegen nur lokal):** `docs/anleitung-mitglieder.md` (Quelle) → eigenständige `docs/anleitung-mitglieder.html` (Lions-Look, Emblem base64-eingebettet, kein CDN → DSGVO/offline) + `docs/anleitung-mitglieder.pdf` (4 Seiten, via Playwright-Chromium gerendert). Nur Funktionen für Mitglieder OHNE Ämter; inkl. PWA-Homescreen-Install je Browser (iOS/Safari, Android Chrome+Firefox) + Hinweis „PC/Tablet-Browser geht auch“. Tooling/Umbruch/UTF-8-Quote-Lehren im Memory `milestone-status`.

**Protokoll-Import (2026-07-17, LIVE, `main` `c59c955..14c9271`):** 50 Sitzungs-Protokolle 2023–2026 (Clubabende/MV/1 Ausflug) per neuem Einmal-Skript `scripts/import-protokolle.mjs` in die Dokumente-Ablage importiert (Titel/Kategorie/Datum aus Dateiname, Dubletten→größte Variante, Volltext extrahiert). **Bewusst OHNE Benachrichtigung:** Skript ruft `notify_document` NIE auf; es gibt keinen INSERT-Trigger auf `public.document` → 0 Notifications (globaler Schalter unnötig). Quell-PDFs lagen in `Protokolle/` (jetzt in `.gitignore` + lokal gelöscht — interne PDFs mit Mitglieder-PII, nie ins öffentliche Repo). **Nebenfix (Commit `fd70dca`):** In der Dokumente-Liste klebte das `·`-Trennzeichen am Kategorie-Wort — Leerzeichen stand am Anfang eines `{#if}`-Blocks, Svelte trimmt führende Whitespace an Blockgrenzen weg; Fix = Trennung als Template-Literal im Ausdruck. Details im Memory `protokolle-import`.

**Termine/Anwesenheit-Feinschliff (2026-07-19, LIVE, `main` bis `054e814`):** Drei zusammenhängende UI-Verbesserungen rund um Meldungen/Anwesenheit. (1) **Anmeldezahl zählt Begleitpersonen mit (`eb7f7a1`):** Der „zugesagt“-Zähler zählte nur Mitglieder — angemeldete Partner/Gäste (`companion`-Zeilen) fehlten. Jetzt = Personen gesamt (Mitglieder + Gäste). Karten (Startseite + Termine-Übersicht) zeigen die Gesamtzahl, Termin-Detail schlüsselt auf: „Zugesagt (N) · X Mitglieder, Y Gäste“ (nur bei Gästen, korrekte Ein-/Mehrzahl), Meldungen-Sheet mit „(+N)“-Suffix. **`offen` bleibt bewusst mitgliederbezogen** (aktive Mitglieder − zugesagte/abgesagte Mitglieder). Reine Frontend-/Query-Änderung (`event_response`-Queries laden `companion(id)` mit), keine DB-Migration. (2) **Meldungen-Detail mit Offen-Liste + klappbaren Blöcken (`9201141`):** Neuer Block „Offen (N)“ = aktive Mitglieder ohne Reaktion (Zahl deckungsgleich mit dem Karten-Zähler); alle drei Blöcke (Zugesagt/Abgesagt/Offen) klappbar via native `<details>/<summary>` (barrierefrei, Chevron, ≥44px), Zugesagt offen vorbelegt, Absagen + Offen eingeklappt, Anzahl immer in der Kopfzeile; `termine/[id]/+page.ts` lädt dafür die aktiven Mitglieder. (3) **Anwesenheitserfassung neu strukturiert (`054e814`):** ohne Reaktion wird jetzt auf **abwesend** vorbelegt (für ALLE inkl. inaktive/Ehren — Club-Entscheidung „alle gleich behandeln“; Schatzmeister berücksichtigt das beim Spenden-Export) → jedes Mitglied wird gespeichert; Seite in drei Abschnitte **nach RSVP** (Angemeldet/Abgemeldet/Ohne Reaktion), je nach Nachnamen sortiert. **Bewusst nach RSVP gruppiert (stabil):** der Anwesenheits-Schalter ändert die Zeile in-place, sie springt NICHT zwischen Abschnitten (Live-Umsortieren nach Anwesenheit verworfen — zu unruhig). Prinzip: RSVP-Absicht und Anwesenheit sind zwei getrennte Achsen. **Nebenbefund:** die Anwesenheit des ersten Clubabends (2026-07-15) war bereits am 17.07. korrekt in Prod erfasst (10 anwesend, 25 abwesend) — beim „Nacherfassen“-Auftrag zuerst den Ist-Stand via `db:remote` geprüft und bewusst NICHTS geschrieben (Dublette vermieden).

**Benachrichtigungs-E-Mail: Template + MIME-Betreff-Fix (2026-07-20, deployed):** Bis dahin gingen Benachrichtigungs-Mails als **nackter Klartext** raus (`sendEmail(email, n.title, n.body ?? n.title)`) — ohne Layout und vor allem **ohne Link in die App**, obwohl die Ziel-URL für Push längst berechnet wurde. (1) **Neues `supabase/functions/send-notifications/email.ts`:** HTML-Mail im Lions-Look (Tabellen-Layout, alle Styles inline, Token-Farben als feste Hex-Werte dupliziert — Mail-Clients kennen kein `var()`), Klartext-Alternative daneben (`content` + `html` = multipart/alternative). Je Anlass Kicker/Button-Text/**Ersatztext für leeren `body`** (Geburtstag + Dokument hatten gar keinen Text, die Mail wiederholte nur den Betreff). **Emblem bewusst NICHT base64-eingebettet** — Gmail rendert `data:`-URIs in `<img>` nicht; stattdessen URL von der eigenen Domain (`/icons/lions-emblem.png`, kein Drittanbieter), bei blockierten Bildern trägt das Text-Lockup. (2) **`pathFor()` ist jetzt gemeinsame Quelle für E-Mail UND Push** → Deep-Links statt Listenseiten (`/dokumente/{id}`, `/news/{id}`, Geburtstag → `/geburtstage` statt `/benachrichtigungen`). (3) **denomailer-1.6.0-Bug im Betreff gefixt (der eigentliche Fund):** Die Lib codiert Betreffs mit Umlauten über `quotedPrintableEncode` — einen **Body**-Encoder, der alle 74 Zeichen `=\r\n` einfügt. Im Header beendet CRLF den Header-Block → ab ~75 codierten Zeichen landeten `From:`/`To:`/`Content-Type:` im Body, die Mail war zerstört. Betraf ausgerechnet die häufigste Sorte („Rückmeldung fehlt: “ + Titel reißt die Grenze fast immer); Betreffs ohne Umlaute blieben zufällig heil. 1.6.0 ist neueste Version, kein Upstream-Fix → eigenes `encodeSubject()` (RFC 2047: Chunks ≤75, Faltung per CRLF **+ Leerzeichen**, Space als `_`). **Trick mit Kommentar im Code:** Rückgabe beginnt mit einem Leerzeichen, damit denomailer das fertige Encoded-Word nicht doppelt verpackt (es codiert nur bei Nicht-ASCII oder führendem `=?`). **Lehre: E-Mail-Header brauchen Header-Encoding, nie Body-Encoding — und ein Mail-Test mit ausschließlich ASCII-Betreffs beweist nichts.** Verifiziert per echtem Versand an eine Adresse (`REMINDERS_ALLOWLIST` vorher gesetzt, danach wieder entfernt) + Gegenprüfung des dekodierten Betreffs in Gmail. **Regressionstest** `supabase/functions/send-notifications/email.test.ts` (Round-Trip-Decode über Längen 1–120 + Header-Regeln; Vitest sammelt jetzt auch `supabase/functions/**`, `email.ts` greift nur guarded auf `Deno` zu) — Gegenprobe mit nachgebautem Bug war rot. **Outlook-Desktop (Word-Engine) am 2026-07-20 von einem Mitglied gegengeprüft: Darstellung + Button in Ordnung.** Testablauf für Mail-Änderungen: Allowlist setzen, Kanal des Empfängers temporär auf `email` (bei `both` gewinnt Push und es geht GAR KEINE Mail raus), Testzeile mit `for_date`-Marker, triggern, danach Zeile löschen + Kanal + Allowlist zurücksetzen.

**Login-Tracking (2026-07-20, LIVE, Migration `20260720120100`):** `member.first_login_at` + `member.last_login_at`, gepflegt per Trigger `on_auth_user_login` auf `auth.users` (`after update of last_sign_in_at` + `when`-Klausel, damit der E-Mail-Login-Sync in `/api/mitglieder/[id]/email` nichts auslöst; `security definer`, weil aus `auth` heraus nach `public.member` geschrieben wird). **Warum eigene Spalten:** `auth.users.last_sign_in_at` kennt nur den LETZTEN Login und `auth.sessions` wird beim Ablauf geleert — der erste Login ist daraus dauerhaft nicht belegbar. Backfill verifiziert (19 angemeldet / 16 nie / 35 gesamt, deckungsgleich mit der `auth.sessions`-Auswertung); Trigger in einer zurückgerollten Transaktion geprüft (Bestandsmitglied: `first` bleibt, `last` wandert / nie angemeldet: beide gesetzt). **Zwei bewusste Einschränkungen:** (1) der Backfill für `first_login_at` ist RÜCKWIRKEND nur eine Näherung (früheste noch vorhandene Session; abgelaufene sind weg) — ab jetzt exakt. (2) Die Spalten sind für ALLE angemeldeten Mitglieder lesbar (`member_select_authenticated` = `true`). Spalten-Rechte wurden bewusst NICHT gesetzt: in Postgres greifen die erst, wenn man das Tabellen-`SELECT` entzieht und jede Spalte einzeln grantet — das bricht still, sobald jemand eine Spalte hinzufügt. Sauber wäre eine eigene Tabelle mit eigener Policy; verworfen, weil im Verzeichnis ohnehin Adressen/Geburtstage für alle sichtbar sind. Keine UI dafür (Auswertung via `npm run db:remote`).

**TabBar-Scroll-Glitch + Benachrichtigungs-Bereinigung (2026-07-28, LIVE):** (1) Mitwandernde Bottom-TabBar beim Scrollen (in der installierten iOS-PWA beobachtet) ist ein bekannter WebKit-Bug — fixe Elemente lösen sich in Standalone-PWAs zeitweise vom Viewport; KEIN Fehler im App-Code (kein Transform/Filter über dem Wrapper). Gegenmaßnahme: `transform: translateZ(0)` auf `.app-tabbar` (eigene Compositing-Ebene). Falls es je wieder auftritt: gründlicher Fix wäre Inner-Scroll-Shell (Body scrollt nicht mehr) — bewusst zurückgestellt. (2) `notification` wuchs unbegrenzt (Mitglieder haben bewusst kein Delete-Recht). ENTSCHIEDEN: kein manuelles Löschen in der App, stattdessen Migration `20260728120100`: `cleanup_notifications()` (gelesen > 30 Tage, alles > 90 Tage; kein Execute für App-Rollen) + täglicher pg_cron-Job `notifications-cleanup` (02:30 UTC, Uhrzeit unkritisch → ohne Berlin-Gate) + pgTAP-Test (Suite jetzt 12 Dateien/102 Tests grün).

## Security-Audit (2026-08-03) — Self-Signup-Lücke geschlossen + Härtung

Anlass: der Plugin-gestützte Scan (claude-security 0.10.0) lief dreimal ins Token-Limit (9M/5M/5M) und lieferte in allen drei Läufen nur `scan-meta.json`, kein einziges Findings-File — also stattdessen ein sequenzieller Audit entlang der vier Achsen mit echter Angriffsfläche (RLS-Policies · die drei `/api`-Routen mit Service-Key · Edge Functions · Storage). Zielgebiet `src`+`supabase`+`scripts` = 489 KB ≈ 150k Token; zum Vergleich hatten die abgebrochenen Läufe das ~130-fache verbraucht. Bug an Anthropic gemeldet.

**BEFUND 1 (hoch, DSGVO) — Self-Signup stand im Produktivprojekt offen.** `GET /auth/v1/settings` meldete `disable_signup: false`. `shouldCreateUser: false` ist nur ein Parameter des eigenen Clients, keine serverseitige Sperre: eine beliebige Person konnte `POST /auth/v1/otp` mit `create_user: true` und der EIGENEN Adresse aufrufen, den Code aus der eigenen Mailbox holen und hielt ein gültiges `authenticated`-JWT. Damit griffen alle Lese-Policies, die auf `using (true)` standen — komplettes Verzeichnis (Namen, Adressen, Telefonnummern, Geburtstage, E-Mails, Partnerdaten), alle Termine + Rückmeldungen, Dokumente und News samt der Dateien in beiden Buckets. **Schreiben war nie möglich** (alle Write-Policies hängen an `has_permission()` oder `current_member_id()`, ein Konto ohne member-Zeile liefert dort NULL) — es war eine reine, aber vollständige Lese-Offenlegung. Kein Hinweis auf tatsächliche Nutzung.

- **Fix 1 (Produktionseinstellung, außerhalb des Repos!):** Dashboard → Authentication → **Sign In / Providers** → Karte „User Signups“ → „Allow new users to sign up“ AUS. Der Schalter sitzt NICHT im Email-Provider-Akkordeon (dort steht nur „Confirm email“) und die Doku verweist mit `/dashboard/project/_/auth` auf eine Route, die im aktuellen Dashboard auf der Nutzerliste landet — deshalb schwer zu finden. Verifiziert: `disable_signup: true`, und der Angriffsweg selbst antwortet jetzt mit `422 signup_disabled`. Login der 35 Bestandskonten unberührt (`external.email` bleibt true, `disable_signup` blockt nur das Anlegen); Einladen läuft über `admin.createUser` und nicht über den Signup-Endpunkt.
- **Fix 2 (Migration `20260803120100_authenticated_member_gate.sql`):** „eingeloggt“ ist nicht mehr gleich „Clubmitglied“ — 11 Tabellen-Policies + die beiden Storage-Lese-Policies (`member_photos_read`, `documents_read`) von `using (true)` auf `public.current_member_id() is not null` umgestellt. Zweite Schicht, damit ein versehentlich zurückgestellter Dashboard-Schalter die Daten nicht erneut öffnet. Für die 35 Bestandskonten ändert sich nichts.
- **Test `member_gate_rls_test.sql` (14 pgTAP) → Suite jetzt 13 Dateien / 116 Tests.** Simuliert genau den Signup-Fall (Konto in `auth.users` OHNE member-Zeile) + Gegenprobe mit echtem Mitglied. **Negativkontrolle gefahren:** ohne die Migration fallen exakt die 8 „sieht nichts“-Zusicherungen, die Gegenprobe bleibt grün — der Test misst die Härtung und nicht sich selbst, und die Lücke ist damit empirisch belegt statt nur aus dem Policy-Text hergeleitet.

**BEFUND 2 (mittel) — `extract-document-text` prüfte den Aufrufer nicht.** `verify_jwt` (Default an) belegt nur, DASS ein gültiges Token vorliegt, nicht dass der Aufrufer das Dokument pflegen darf; die Function arbeitete ab da mit Service-Role auf jeder übergebenen `id`. Zwei Folgen: beliebiges Auslösen teurer PDF-Parses, und — der eigentliche Schaden — `update({ content_text: text || null })` lief AUCH nach gescheiterter Extraktion (der `catch` schluckte den Fehler), ein fehlgeschlagener Re-Run leerte also still den Volltext. Da jedes eingeloggte Konto alle Dokument-IDs lesen kann, war die Suche über alle 50 Protokolle hinweg löschbar.

- **Fix:** Aufrufer-Prüfung per **RLS-Probe** (No-Op-Update `title` auf sich selbst mit einem Client, der das Token des Aufrufers trägt) statt über einen fest verdrahteten Rechtenamen. Grund: die Schreibrechte auf `document` verteilen sich auf ZWEI Policies — `publish_content` für alles, `manage_events` nur für termin-gebundene Dokumente (`document_write_event_manager`, damit der Clubmaster die Ablaufplanung am Termin ablegen kann). Ein nachgebauter Rechte-Check hätte den Clubmaster ausgesperrt; die Probe bleibt automatisch deckungsgleich mit den Policies. Zusätzlich: Dokument wird als Aufrufer gelesen (wer es nicht sehen darf, bekommt 404 statt 403 und erfährt nichts über die Existenz der id), und bei gescheiterter Extraktion bleibt der Bestand stehen (`status: 'extraktion_fehlgeschlagen'`); nicht unterstützte Typen (xlsx/Bilder) zählen weiterhin als leeres, korrektes Ergebnis. CORS von `*` auf die eigenen Origins eingeengt (`APP_ORIGINS`, Default Prod + localhost:5173).
- Lokal verifiziert: ohne `Authorization` → 401, ohne `id` → 400, mit unsinnigem Token → 404. **Die CORS-Einengung ist lokal NICHT prüfbar** — das CLI-Gateway überschreibt `Access-Control-Allow-Origin` mit `*` (das eigene `Vary: Origin` kommt durch, der Wert nicht); erst nach dem Deploy gegen die echte Function prüfbar.

**Als sauber bestätigt:** `anon` hat keine Tabellen-Grants (live gegen Prod geprüft, `42501`); alle drei `/api`-Routen prüfen Session + Recht über RLS vor dem Service-Key, inkl. LJ-Filter; `has_permission` ist seit `20260620120500` LJ-gefiltert; sämtliche Write-Policies hängen an `has_permission`/`current_member_id`; `send-notifications` verlangt den Service-Key als Bearer; `protect_member_columns` deckt Status/`user_id`/E-Mail/Mitgliedsnummer ab; beide Buckets privat mit gescoptem Write; kein Secret im Repo.

**LEHRE:** Client-Parameter sind keine Zugriffskontrolle — `shouldCreateUser: false` sah wie eine Sperre aus, war aber nur eine Bitte. Und: Produktionseinstellungen, die außerhalb des Repos leben (Dashboard-Schalter), tauchen in keinem Code-Review auf. Der Signup-Schalter gehört ab jetzt auf jede Audit-Checkliste; Prüfbefehl ohne jeden Seiteneffekt:
`curl -s "$PUBLIC_SUPABASE_URL/auth/v1/settings" -H "apikey: $PUBLIC_SUPABASE_ANON_KEY"` → erwartet `"disable_signup": true`.

## PWA-Caching Stufe 1 — Mitgliederfotos + Logout-Wipe (2026-08-04)

Erste Stufe des am 2026-07-12 beschlossenen Caching-Stufenplans (Reihenfolge: **1. Fotos + Logout-Wipe** · 2. SWR für Supabase-GETs · 3. Offline-Start · 4. IndexedDB). Bis hierhin war NUR die App-Shell im Precache; Inhaltsdaten und Fotos bewusst nicht.

**Umgesetzt:**

- `vite.config.ts`: `runtimeCaching`-Route (CacheFirst) für den privaten Bucket `member-photos`, Cache `lions-member-photos`, 60 Einträge / 30 Tage, `cacheableResponse: [200]`. CacheFirst ist hier gefahrlos, weil jedes hochgeladene Foto unter einem NEUEN Pfad landet (`avatar_<timestamp>.<ext>`) — ein Bildwechsel ist ein Cache-Miss, kein altes Bild.
- `cacheKeyWillBeUsed` normalisiert den Cache-Key auf `origin + pathname`. Signierte Storage-URLs tragen bei JEDEM Aufruf ein frisches Token im Query-String; ohne Normalisierung wäre jede Sitzung ein Miss und der Cache liefe voll.
- `src/lib/offlineCache.ts` (+ 7 Vitest-Tests, Suite jetzt 49): `clearPrivateCaches()` löscht beim Ausloggen den Fotocache und die `workbox-expiration`-IndexedDB, lässt den App-Shell-Precache stehen. `deleteDatabaseWithTimeout()`, weil `deleteDatabase` bei offener SW-Verbindung `blocked` statt `success` feuert — der Logout darf darauf nicht warten. Verdrahtet in `signOut()` (`src/routes/mehr/+page.svelte`). Pflicht, sobald personenbezogene Daten im Browser-Storage liegen.
- `Avatar.svelte`: `crossorigin="anonymous"` am Foto-`<img>`.

**Drei Fallen, alle erst durch echtes Messen gefunden** (lokaler Stack + Produktions-Build via `vite preview` + Playwright; die Konfiguration sah jedes Mal korrekt aus und cachte trotzdem nichts):

1. **`urlPattern` als RegExp greift bei Cross-Origin nicht**, wenn das Muster nicht den URL-ANFANG matcht (Workbox-Regel). Die Fotos liegen auf einem fremden Origin (`…supabase.co`, lokal `127.0.0.1:54321`), ein Muster ab `/storage/…` konnte dort nie greifen. → Callback `({url}) => url.pathname.startsWith(…)` statt RegExp; bleibt zugleich origin-unabhängig für lokal/Prod.
2. **`<img>` ohne `crossorigin` erzeugt einen `no-cors`-Request → opaque Response (Status 0).** Der SW kann Erfolg dann nicht von Fehler unterscheiden und würde im Zweifel eine kaputte Antwort dauerhaft cachen. Supabase-Storage sendet `access-control-allow-origin: *`, deshalb echter CORS-Request und prüfbarer Status.
3. **Der eigentliche Blocker — ein Altlast-Bug seit M5:** vite-pwa registrierte per Default einen Navigations-Fallback `createHandlerBoundToURL('/')`, aber `/` liegt nicht im Precache (die App wird nicht prerendert, SSR läuft auf Netlify). Beim SW-Start warf das `non-precached-url` — und **brach die Registrierung ALLER nachfolgenden Routen ab**. Im bisherigen Build blieb das unsichtbar, weil der generierte SW die Workbox-Runtime über einen AMD-`define()`-Wrapper lud, dessen Factory erst in einem Microtask läuft: der Fehler verschwand als stille Promise-Rejection. Zwei Konsequenzen, beide gefixt: `inlineWorkboxRuntime: true` (Runtime direkt in die `sw.js`, alles wird synchron während der initialen Skript-Auswertung registriert — sonst zählt der Browser den SW als „ohne Fetch-Handler“) und `navigateFallback: null` (ein echter Offline-Start kommt in Stufe 3 mit eigener, precachter Fallback-Seite).

**LEHRE:** Eine plausibel aussehende SW-Konfiguration beweist nichts — der generierte `sw.js` muss gelesen und das Laufzeitverhalten gemessen werden. Diagnose-Reihenfolge, die funktioniert hat: (a) Route im gebauten `sw.js` per grep bestätigen, (b) `response.fromServiceWorker()` in Playwright prüfen, (c) eine temporäre `fetch`-Sonde in `static/sw-push.js` schreiben lassen, welche Requests den SW überhaupt erreichen, (d) SW-Evaluierungsfehler per CDP `ServiceWorker.workerErrorReported` auslesen — die entscheidende Fehlermeldung steht in KEINER Browser- oder Seiten-Konsole.

**Verifiziert (lokaler Stack, 3 Seed-Fotos, Produktions-Build):** Cache wird angelegt (2 Einträge), Keys ohne Token, zweiter Besuch mit frisch signierten URLs lässt den Cache NICHT wachsen und liefert die Fotos mit `fromServiceWorker: true` aus dem Cache, Logout löscht `lions-member-photos` und lässt den Precache stehen. `npm run check` · `lint` · 49 Unit-Tests · 2 E2E grün.

**Offen:** Stufen 2–4 des Plans. Beim nächsten Deploy im Blick behalten, dass Bestandsnutzer den alten SW ersetzt bekommen (`registerType: 'autoUpdate'` + `skipWaiting`).

## PWA-Caching Stufe 3 — Offline-Start + Fallback-Seite (2026-08-04)

Stufe 3 wurde auf Wunsch VOR Stufe 2 gezogen. Ziel: Wer die PWA im Funkloch öffnet, sieht nicht mehr die Browser-Fehlerseite, sondern entweder den zuletzt geladenen Stand der Seite oder eine gestaltete Offline-Seite.

**Umgesetzt:**

- `vite.config.ts`: `runtimeCaching`-Route für Navigationen (`request.mode === 'navigate'`), Handler **NetworkFirst**, Cache `lions-pages`, 30 Einträge / 7 Tage. **Bewusst OHNE `networkTimeoutSeconds`:** solange das Netz antwortet, sieht man immer den frischen SSR-Stand; erst wenn der Request scheitert, kommt der Cache. Ein Timeout würde bei schwachem Empfang stillschweigend veraltete Daten zeigen, die sich danach nicht mehr von selbst aktualisieren (SvelteKit hydriert aus den im HTML serialisierten Load-Ergebnissen). Der Knopf ist benannt, falls wir es später anders wollen.
- `cacheWillUpdate` filtert zwei Fälle heraus: **`response.redirected`** (ohne Session antwortet der Server 303 auf `/login`; `fetch` folgt, und die Login-Seite läge dann unter der Original-URL im Cache — zurückgegeben bricht so eine Antwort die Navigation ab: „a redirected response was used for a request whose redirect mode is not follow“) und **`/login`** selbst (offline nutzlos, der Code kommt per Mail).
- `static/offline.html` — statische, komplett eigenständige Fallback-Seite („Keine Verbindung“, Emblem, „Erneut versuchen“, Auto-Reload beim `online`-Event). Bewusst KEINE SvelteKit-Route: sie darf weder den Auth-Guard durchlaufen noch Daten brauchen. Systemschrift statt der self-hosted Fonts (die tragen im Build einen Hash im Dateinamen); das Emblem kommt aus dem Precache.
- `static/sw-offline.js` (via `importScripts`) legt die Seite beim SW-`install` selbst im Cache `lions-offline-shell` ab — **nicht** über den Workbox-Precache. Zwei Gründe, beide beim Bauen aufgefallen: (a) `@vite-pwa/sveltekit` schneidet in seiner `manifestTransform` JEDER `.html`-Datei die Endung ab (gedacht für prerenderte Seiten), aus `offline.html` wurde die Precache-URL `/offline`; (b) scheitert im Precache EIN Request, schlägt die ganze SW-Installation fehl und der neue Worker wird nie aktiv — diese Nebensache darf das nicht können. Deshalb eigener Fetch mit `catch`. Der Body wird in eine NEUE `Response` umgepackt, damit eine eventuelle Netlify-Umleitung `/offline.html` → `/offline` kein `redirected: true` hinterlässt. Konsequenz: `html` ist aus `globPatterns` raus (der Client-Output enthält sonst keine HTML-Dateien).
- `src/lib/offlineCache.ts`: `PAGE_CACHE_NAME` kommt zu den privaten Caches — **gerendertes HTML enthält die geladenen Personendaten**, fällt also beim Ausloggen mit. Zusätzlich wird `clearPrivateCaches()` jetzt auch nach erfolgreichem Login aufgerufen (`src/routes/login/+page.svelte`): auf einem geteilten Gerät oder nach abgelaufener Session ohne Logout darf nichts von der Vorgängerin stehen bleiben. `lions-offline-shell` bleibt stehen (kein Personenbezug).
- Vier neue Vitest-Tests (Suite jetzt 53), darunter ein **Drift-Test**: URL und Cache-Name der Offline-Seite stehen zwangsläufig als Literale in `static/sw-offline.js` und `vite.config.ts` — `sw-offline.js` läuft ohne Bundler, und workbox-build serialisiert die Callbacks aus `vite.config.ts` per `toString()` und verliert dabei jeden Modul-Import. Der Test hält die drei Stellen an der Konstante zusammen.

**Nachtrag (gleicher Tag, nach dem ersten Deploy):** Weil die Offline-Seite nicht im Precache liegt, taucht sie im Precache-Manifest der `sw.js` nicht auf — eine reine Textänderung an `offline.html` erzeugte damit eine **byteweise identische `sw.js`**. Der Browser hätte kein Update gesehen, der `install`-Handler wäre nie wieder gelaufen, die alte Fassung wäre für immer im Cache geblieben. Fix: `importScripts` trägt jetzt einen Inhalts-Hash über `offline.html` + `sw-offline.js` (`sw-offline.js?v=<hash>`) — der landet wörtlich in der `sw.js`, also neue Seite → neue `sw.js` → SW-Update → frisch geholt. Gegenprobe: Testzeile angehängt → Hash und `sw.js` ändern sich, Zeile zurückgenommen → alter Hash wieder da. **Merksatz: alles, was der Service Worker cacht, aber nicht im Precache-Manifest steht, braucht eine eigene Versionsspur — sonst friert es beim ersten Deploy ein.**

**Zwei Fallen:**

1. **`context.setOffline(true)` in Playwright ist für diesen Test wertlos** — Requests, die der Service Worker selbst absetzt, gehen an der Netzwerk-Emulation vorbei. Der erste Testlauf meldete den Fallback als „funktioniert nicht“, weil der SW in Wahrheit die echte Netzantwort bekam. → Der Testtreiber startet und **stoppt den Preview-Server** jetzt selbst; nur das ist ein echtes Funkloch.
2. **Callbacks in `runtimeCaching` dürfen nichts aus dem Modul-Scope benutzen.** workbox-build schreibt sie per `toString()` in die `sw.js`; importierte Konstanten existieren dort nicht. Nur Werte wie `cacheName` werden beim Build ausgewertet.

**Verifiziert (Produktions-Build, lokaler Stack, Server wirklich abgeschaltet):** Offline-Seite liegt nach dem Install im Cache · besuchte Seiten landen in `lions-pages`, `/login` nicht · offline liefert `/termine` den gecachten Stand mit echten Inhalten · offline liefert die nie besuchte `/vorstand` die Fallback-Seite samt Emblem, URL bleibt erhalten · Kaltstart auf `/` im Funkloch zeigt die Startseite statt eines Fehlers · wieder online = frische Auslieferung · Logout löscht `lions-pages` + `lions-member-photos`, lässt Precache und Offline-Seite stehen · ausgeloggte Umleitung auf `/login` wird nicht gecacht · ausgeloggt + offline = Fallback statt Browser-Fehlerseite. **Upgrade-Pfad** mit persistentem Profil (Stufe-1-SW → Stufe-3-SW): Session bleibt, neuer SW `activated` ohne `waiting`, Offline-Cache wird angelegt, Push-Handler feuert weiter. `npm run check` · `lint` · 53 Unit-Tests · 2 E2E grün.

**Bekannte Grenze (= das Argument für Stufe 2):** Der Offline-Start zeigt die zuletzt geladene Seite, weil SvelteKit sie aus den im HTML serialisierten Load-Ergebnissen hydriert. **Weiterklicken** funktioniert offline nicht: eine Client-Navigation lässt `+page.ts` neu laufen, und dessen Supabase-Abfrage scheitert ohne Netz. Immerhin landet man dabei sauber auf der Offline-Seite (SvelteKit fällt bei gescheiterter Client-Navigation auf eine echte Navigation zurück, die der Service Worker abfängt) und nicht auf einer Fehlerseite. Inhalte anderer Seiten gibt es offline aber erst mit Stufe 2 (Caching der Supabase-GETs).

**Auf echtem iPhone bestätigt (2026-08-04, User):** PWA aktualisiert, online zwei Seiten aufgerufen, App weggewischt, Flugmodus an, neu gestartet → die zuletzt angesehene Seite erscheint sofort; beim Weiterklicken kommt sofort die Offline-Seite; Flugmodus aus → die Seite lädt von selbst neu. WebKit-Gegenprobe damit erledigt.

**ENTSCHIEDEN 2026-08-04 (User): Stufe 2 wird zurückgestellt.** Stufe 3 deckt den Alltag ab (Start im Funkloch, letzte Seite, saubere Offline-Meldung beim Weiterklicken). Ob im Cluballtag überhaupt Bedarf entsteht, Inhalte anderer Seiten offline zu lesen, wird zuerst beobachtet. Wenn ja, ist die Vorentscheidung **NetworkFirst ohne `networkTimeoutSeconds`** auf ausgewählte Tabellen (Verzeichnis, Termine, News, Geburtstage) — gleiche Logik wie Stufe 3, damit kein Konflikt mit dem `invalidateAll()`-Muster an 31 Stellen entstehen kann. Ausgenommen blieben Live-Zähler (Meldungen, ungelesene Benachrichtigungen) und die Dokumentensuche (RPC per POST, über die URL nicht cachebar). Der Datencache müsste in denselben Wipe wie `lions-pages`, weil die Antworten RLS-abhängig sind, der Cache-Schlüssel aber nur die URL ist. Verworfen wurden StaleWhileRevalidate + `broadcastUpdate` (nach eigener Änderung kurzzeitig alter Stand — Vertrauensproblem) und die enge Whitelist (zu wenig Nutzen).

**Offen:** Stufe 4 (IndexedDB-Snapshots), weiterhin nur bei echtem Bedarf.

---

## Versionsanzeige + „Was ist neu“ (2026-08-04)

**Warum überhaupt.** Der Nutzen liegt nicht darin, dass Mitglieder eine Nummer wissen wollen, sondern in zwei praktischen Dingen: (1) **Support-Diagnose** — bei „bei mir sieht das anders aus“ ist die erste Frage, ob das Gerät den aktuellen Stand hat, und genau die ist seit den Caching-Stufen 1/3 nicht mehr rhetorisch: eine installierte PWA kann durch den Service-Worker-Cache länger auf einer älteren Shell laufen. (2) **Sichtbare Pflege** — „zuletzt geändert am 4. August“ zeigt, dass die App lebt.

**Schema: CalVer, aus Git, nichts von Hand.** `2026.08.04 · f7e9b1f` — Datum für Menschen („bin ich aktuell?“), Commit-Hash für die Zuordnung eines Screenshots zu einem Code-Stand. SemVer wurde verworfen: „Breaking Change für API-Konsumenten?“ fragt hier niemand, und eine Nummer, die jemand bewusst bumpen muss, steht nach drei Wochen falsch da — eine falsche Nummer ist schlechter als gar keine. `package.json.version` bleibt deshalb unangetastet bei `0.0.1`.

**Umgesetzt:**

- `vite.config.ts`: `define` setzt `__APP_VERSION__` + `__APP_COMMIT__` zur Build-Zeit. Version = **Commit-Datum** (`git log -1 --format=%cI`), nicht Build-Datum — reproduzierbar (Re-Deploy desselben Commits ergibt dieselbe Nummer) und beschreibt den Stand des Codes. Formatiert über `Intl.DateTimeFormat` mit `timeZone: 'Europe/Berlin'`, damit ein Nacht-Deploy (Netlify baut in UTC) nicht auf den Vortag datiert. Fallbacks: Build-Zeit ohne Git, `process.env.COMMIT_REF` (Netlify) für den Hash, sonst `dev`.
- `src/lib/version.ts` kapselt die beiden Globals (Typen in `src/app.d.ts`), `src/lib/changelog.ts` hält die Einträge.
- `/mehr` bekommt unter dem Ausloggen-Button eine leise Fußzeile (Mono, `--text-secondary`, Touch-Ziel 44 px) — Link auf `/mehr/version` (Zurück → Mehr wie die übrigen Unterseiten).
- `/mehr/version`: Karte „Installierte Version“ (Nummer + `Stand <hash>` + Hinweis „App einmal ganz schließen“) und darunter „Was ist neu“ je Datum, Änderungsart als `Tag` (neu/verbessert/behoben, Wort **und** Farbe — Status nie nur über Farbe).
- 8 neue Vitest-Tests (Suite jetzt 60): Datumsformatierung, Sortierung neueste-zuerst, ISO-Form aller Einträge, kein leerer Text — plus ein Wächter, der Sicherheits-Vokabular im Changelog verbietet.

**Zwei bewusste Festlegungen:**

1. **Changelog wird von Hand gepflegt, nicht aus Commits erzeugt.** Commits sind Entwicklerprosa („fix(pwa): Offline-Seite bekommt eine eigene Versionsspur“); im Changelog steht, was ein Mitglied davon merkt („Die App startet jetzt auch ohne Internet“). Das ist Übersetzungsarbeit, die kein Generator leistet. Bringt ein Deploy nichts Sichtbares, ändert sich nur die Nummer und es kommt **kein** Eintrag dazu — ein Changelog mit vier Monate altem letzten Eintrag wirkt schlechter als gar keiner.
2. **Sicherheitsfixes nur neutral** („Sicherheit und Stabilität verbessert“). Ein Eintrag wie „Anmeldung für Fremde geschlossen“ (Audit vom 03.08.) verrät jedem, der einen Screenshot sieht, was vorher offen war, und Mitglieder können nichts tun — der Fix ist beim Lesen längst ausgeliefert. Details bleiben hier in `MEILENSTEINE.md`. Der Unit-Test hält diese Regel fest, damit sie einen späteren Eintrag nicht versehentlich überlebt.

Der Changelog startet bewusst am **16.07.2026** (Freischaltung für alle 35) — davor gab es keine Mitglieder, die eine Änderung hätten bemerken können.

**Verifiziert:** `npm run check` · `lint` · 60 Unit-Tests grün · Produktions-Build enthält Nummer und Hash im Client-Bundle · beide Screens am lokalen Stack per Playwright (Login über Mailpit-OTP) im iPhone-Format bestätigt.

## Behoben: Push-/Mail-Link zu News und Dokumenten lief in eine 404 (2026-08-04)

**Symptom.** Klick auf die Push-Mitteilung „neue News“ öffnete die PWA auf einer leeren Seite mit 404 — unterwegs gemeldet, also genau in der Situation, für die der Deep-Link gedacht ist.

**Ursache.** `pathFor()` in `supabase/functions/send-notifications/email.ts` (geteilt von Push-Payload **und** dem Button in der Benachrichtigungs-Mail) baute `/news/<id>` bzw. `/dokumente/<id>`. Diese Routen gibt es nicht: unter `src/routes/news/[id]/` und `src/routes/dokumente/[id]/` liegt jeweils **nur** `bearbeiten/`, keine `+page.svelte`. Eine Detailseite für einen einzelnen Beitrag/ein einzelnes Dokument war nie vorgesehen — der Feed `/news` zeigt die Beiträge vollständig, `/dokumente` ist die Ablage. Betroffen waren beide Kanäle (Push **und** Mail) und beide Anlässe; `/termine/<id>`, `/termine/<id>/anwesenheit` und `/geburtstage` existieren und funktionierten.

**Warum es durchrutschte.** Die In-App-Liste macht es seit jeher richtig (`benachrichtigungen/+page.svelte` springt auf `/news` bzw. `/dokumente`) — die Abweichung stand nur in der Edge Function. Der Go-live-Test am 16.07. lief über einen Termin-Reminder, also über die eine Kind-Variante, deren Route es gibt. Und der Unit-Test `email.test.ts` zementierte den Fehler sogar: er prüfte, dass die ID im Pfad landet, nie dass der Pfad eine Seite trifft.

**Fix.** `pathFor()` gibt für `document`/`news` die Übersicht zurück, identisch zur In-App-Liste. Zusätzlich zwei Tests: ein Regressionstest (News/Dokument bleiben auf der Übersicht, auch mit ID) und eine **Drift-Bremse**, die jeden von `pathFor()` erzeugbaren Pfad gegen `src/routes/**/+page.svelte` prüft (Sentinel-ID → `[id]`-Ordner) — eine neue Kind-Variante mit erfundenem Pfad fällt damit sofort auf. Der Link-Test in `renderEmail` leitet sein Ziel jetzt aus `pathFor()` ab, statt es zu wiederholen.

**Lehre: ein Test über einen String-Pfad beweist nur die Zeichenkette, nicht das Ziel.** Wo Code einen Pfad in eine andere Codebasis hinein baut (Edge Function → SvelteKit-Routen), muss der Test die andere Seite tatsächlich anfassen — hier das Dateisystem. Verwandt mit der Betreff-Lehre vom 20.07.: beide Male war der grüne Test schlicht die falsche Frage.

**Ausgerollt.** `npm run check` · `lint` · 62 Unit-Tests grün · `npx supabase functions deploy send-notifications` (Projekt `qfxtyqippdrcrhwbkhwx`). Kein DB-Push nötig. Bereits zugestellte Push-Mitteilungen und Mails behalten ihren alten Link — der Pfad wird beim Versand eingebacken; alles ab jetzt Versendete ist korrekt.

## Anzeige-Modus-Telemetrie: wer nutzt die App vom Homescreen? (2026-08-13)

**Anlass.** Frage aus dem Betrieb: welche der 29 angemeldeten Mitglieder haben die PWA installiert? Bis dahin war `push_subscription` der einzige Anhaltspunkt — 9 Apple-, 2 Google-, 2 Mozilla-Endpunkte. Der Apple-Endpunkt ist auf iOS ein echter Beweis (Web-Push gibt es dort nur in der installierten PWA), taugt aber nur als Untergrenze: er übersieht jede Installation ohne aktivierten Push und lässt sich nicht von macOS-Safari unterscheiden, wo Push auch ohne Installation läuft. Google/Mozilla sagen gar nichts, weil Push dort im normalen Tab funktioniert.

**Umsetzung.** Migration `20260813120100_member_display_mode.sql`: drei Spalten auf `member` (`first_standalone_at`, `last_standalone_at`, `last_browser_at`) plus RPC `public.track_display_mode(standalone boolean)`. `src/lib/displayMode.ts` erkennt den Modus und meldet ihn einmal pro App-Start aus `+layout.svelte` (`onMount` bei bestehender Session, zusätzlich bei `SIGNED_IN` — beim Anmelden bleibt das Root-Layout montiert, der `onMount`-Aufruf lief da noch ohne Session). Fire-and-forget, Fehler werden geschluckt.

**Drei Spalten statt einer** — damit „hat sich noch nie gemeldet“ von „meldet sich, aber aus dem Browser“ unterscheidbar bleibt. Unmittelbar nach dem Rollout ist alles NULL; das ist fehlende Datenlage, kein Nutzungsbefund. Belastbar „nutzt den Browser“ heißt erst `last_browser_at is not null and last_standalone_at is null`. Ohne `last_browser_at` wäre genau diese Unterscheidung dauerhaft verloren.

**security definer statt UPDATE-Policy.** Ein Mitglied darf seine `member`-Zeile nicht schreiben, und das sollte so bleiben — eine Policy nur für Telemetriespalten hätte diese Linie aufgeweicht. Die Funktion schreibt ausschließlich die drei Spalten und ausschließlich für die aufrufende Person: die member-ID kommt aus `current_member_id()` (also aus dem JWT), nie aus einem Aufrufparameter. Fremde Zeilen sind damit prinzipiell unerreichbar, nicht nur per Policy verboten. Grant nur an `authenticated`; `service_role` hat bewusst **kein** Execute-Recht (Least Privilege — geprüft: PostgREST antwortet dort `42501`).

**Erkennung.** `isStandaloneMode()` prüft `display-mode: standalone|fullscreen|minimal-ui` **und** `navigator.standalone`. Die drei Modi, weil das Manifest zwar `standalone` fordert, Browser aber auf `minimal-ui` zurückfallen dürfen und manche Android-Launcher `fullscreen` starten; `navigator.standalone` zusätzlich, weil es auf iOS der historisch zuverlässigste Marker ist. Der Kern nimmt den Media-Matcher als Parameter — damit ist er unter Vitest (`environment: 'node'`, kein DOM) direkt testbar.

**Grün.** 9 neue pgTAP-Tests (jetzt 125) · 8 neue Unit-Tests (jetzt 70) · `check` · `lint` · `build`.

**Ausgerollt (2026-08-13).** Reihenfolge: `supabase db push` zuerst (sonst ruft der Client die RPC ins Leere), danach `git push` → Netlify. In Produktion verifiziert: drei Spalten + `track_display_mode(standalone boolean)` vorhanden, Ausgangslage 35× ohne Meldung.

**Changelog-Eintrag: neutral, nach Rücksprache.** Zuerst stand im „Was ist neu“ eine ausformulierte Beschreibung der Erfassung (Modus + Startzeitpunkt, keine Seitenaufrufe). Auf Wunsch des Webmasters ersetzt durch „Verbesserungen bei Funktionalität und Stabilität.“ — der Klartext hätte gerade bei älteren Mitgliedern nach Überwachung geklungen, und der Nutzen des Hinweises stand nicht im Verhältnis zur Beunruhigung. Damit erwähnt die App die Erfassung an keiner Stelle mehr. Eine Datenschutz-Seite gibt es nicht (Suche über `src/routes` und `src/lib`: kein Treffer für „Datenschutz“); sie wurde am 2026-08-13 vorgeschlagen und vom Webmaster **bewusst abgelehnt** — aktuell kein Bedarf. Kein offener Punkt, sondern eine getroffene Entscheidung.

**Offen.** Auswertung per `npm run db:remote`; eine UI gibt es bewusst nicht. Belastbare Zahlen frühestens nach ein paar Wochen, weil jedes Mitglied die App einmal geöffnet haben muss. Wer sich nie meldet, ist in `first_login_at`-Logik schon erfasst (6 Mitglieder ohne jeden Login, Stand 2026-08-13).

## Teilnehmerliste für den Sekretär: eigenes Recht `view_participants` (2026-09-03)

**Anlass.** Frage des Webmasters, ob der Sekretär in der Termin-Detailansicht den Button „Teilnehmerliste“ sieht. Antwort: nein. Der Button, der Load-Guard von `/termine/[id]/teilnehmer` und die RLS-Policy `answer_select` hingen alle drei an `manage_events` — das Recht haben nur Präsident, Vize, Clubmaster und Webmaster. Spec §3 weist dem Sekretär aber ausdrücklich „Teilnehmer-/Anwesenheitslisten“ zu; die Anwesenheit erfasst er ohnehin (`record_attendance`), nur die Liste vorher (etwa für die Übernahme ins Protokoll) fehlte ihm. Beschluss des Webmasters: der Sekretär braucht die Liste zwingend, inklusive Export.

**Umsetzung.** Statt `manage_events` an den Sekretär zu geben (er könnte dann Termine anlegen/löschen und Fragen verwalten) oder die Liste an `record_attendance` zu koppeln (der Clubmaster hätte sie dann verloren), bekommt die Teilnehmerliste ein **eigenes Recht `view_participants`**. Zwei Migrationen, weil ein neuer Enum-Wert im selben Transaktionsblock nicht verwendet werden darf (gleiche Bauart wie `notification_kind` am 19./20.06.): `20260903120100` fügt den Wert zu `app_permission` hinzu, `20260903120200` trägt ihn in die Matrix ein (Präsident, Vize, Clubmaster, Webmaster, **Sekretär**) und stellt `answer_select` von `manage_events` auf `view_participants` um. Der Webmaster musste explizit nachgezogen werden — sein „alle Rechte“-Cross-Join vom 21.06. kannte den neuen Wert noch nicht. Frontend: der Button hat jetzt ein eigenes `{#if}` innerhalb des Aktionsblocks, der Load-Guard der Teilnehmer-Seite prüft `view_participants`. Der CSV-Export war bereits Teil der Seite und braucht keine eigene Freigabe.

**Ein Recht = eine Quelle.** UI-Gate, Load-Guard und RLS lesen alle dasselbe Recht; `manage_events` steht in der Policy bewusst nicht mehr, weil jedes `manage_events`-Amt jetzt auch `view_participants` trägt. Damit ist die Matrix wieder die einzige Stelle, an der sich entscheidet, wer die Liste sieht (LJ-Rechte-Lehre aus P2).

**Grün.** 5 neue pgTAP-Tests in `question_answer_rls_test.sql` (jetzt 130): Matrix-Abgleich (`view_participants` = genau die fünf Ämter), Sekretär hat `view_participants` aber weiterhin kein `manage_events`, sieht alle Antworten, kann trotzdem keine Frage anlegen. `check` · `lint` · 70 Unit-Tests. Im lokalen Stack per Playwright verifiziert: Sekretär sieht „Teilnehmerliste“ (nicht „Termin bearbeiten“), Liste mit 5 Personen, CSV-Download mit Kopfzeile; einfaches Mitglied sieht keinen Button und wird beim Direktaufruf der URL auf den Termin zurückgeleitet.

**Nebenbefund Werkzeug.** Die Supabase-CLI-Binary (`node_modules/@supabase/cli-darwin-arm64/bin/supabase`) starb mit SIGKILL (Exit 137), schon bei `--version`: `codesign --verify` meldete „invalid signature (code or signature have been modified)“. Fix ohne Neuinstallation: `codesign -s - -f <binary>` (Ad-hoc neu signieren). Kein Zusammenhang mit dem Keychain-Hänger (`SUPABASE_ACCESS_TOKEN=local-dev`), das ist ein zweites, unabhängiges Problem.

**Ausgerollt (2026-09-03, Commit `d97c0ad`, zusammen mit der Gäste-Gruppe).** `supabase db push` (beide Migrationen, Matrix + Policy in Produktion per `db:remote` verifiziert), danach `git push` → Netlify-Build um 10:16 Uhr live. Reihenfolge wie immer: `supabase db push` ZUERST (Root-Layout liest `amt_permission` auf jeder Seite; der Client würde das Recht sonst nie sehen — und umgekehrt bricht nichts, wenn die DB das Recht kennt, bevor der Client es abfragt), danach `git push` → Netlify.

## Termin-Detail: Gruppe „Gäste“ unter den Meldungen (2026-09-03)

**Anlass.** Begleitpersonen zählten im Meldungen-Bereich zwar mit (Zähler + „(+1)“ hinter dem Mitglied), ihre Namen sah aber nur, wer die Teilnehmerliste öffnen darf. Wunsch des Webmasters: alle Mitglieder sollen sehen, wer als Gast kommt.

**Entscheidung: vierte Gruppe am Ende, nur Namen, ohne Bezug zum einladenden Mitglied.** Ich hatte zunächst „Elke Vorsteher · mit Friedrich Vorsteher“ vorgeschlagen; verworfen, weil Gäste fast immer Partner sind (wer zu wem gehört, weiß der Club) und bei fremden Gästen (z. B. Kandidaten) das einladende Mitglied nicht die interessante Information ist. Die Gruppe steht nach „Offen“, ist eingeklappt wie „Abgesagt“/„Offen“, sortiert nach Name, und erscheint nur bei Terminen mit `companion_allowed` — sonst wäre „Gäste (0)“ Rauschen. Das „(+1)“ in „Zugesagt“ bleibt.

**Keine neuen Daten, kein neues Recht.** Die Seite lud die Begleitpersonen aller Rückmeldungen schon vorher (`event_response(… companion(id, name))`), die Lesepolicy auf `companion` ist mitgliedergebunden. Reine Darstellung; keine Migration, kein RLS-Test. Verifiziert im lokalen Stack als einfaches Mitglied: „Gäste (1) — Elke Vorsteher“.

## Versions-Erkennung im laufenden Client: „Neue Version verfügbar“ (2026-09-03)

**Anlass.** Frage des Webmasters: Wenn ein Mitglied das Browserfenster mit der App wochenlang nicht schließt, wie ist sichergestellt, dass es die aktuelle Version nutzt? Bestandsaufnahme: Der Service Worker (`registerType: 'autoUpdate'`, `cleanupOutdatedCaches`) erneuert sich bei jedem vollen Seitenaufruf, bei Push-Ereignissen und beim `register()` im Root-Layout; SvelteKit macht bei einem fehlgeschlagenen Chunk-Import (alte Hashes nach dem Deploy nicht mehr auf Netlify) automatisch einen vollen Seitenaufruf. **Lücke:** ein Tab, der nur per Client-Navigation zwischen bereits geladenen Seiten wechselt, löst nichts davon aus und fährt beliebig lange alten Code. Inhalte waren nie betroffen (Supabase-GETs sind nicht gecacht, Stufe 2 des Caching-Plans bewusst offen), nur der Programmcode.

**Umsetzung (drei Teile).** (1) `version` in `sveltekit({...})` in `vite.config.ts`: `name` = Commit-Hash (derselbe `appCommit` wie für `__APP_COMMIT__`), damit ein Re-Deploy desselben Commits keinen Hinweis auslöst, plus `pollInterval` 10 min → SvelteKit fragt `_app/version.json` ab und setzt `updated.current`. (2) Root-Layout: `beforeNavigate` macht bei gesetzter Markierung die nächste Navigation zu einem vollen Seitenaufruf (Vorlage aus der SvelteKit-Doku); `visibilitychange` → `updated.check()` + `registration.update()`, damit ein Tab, der nach Tagen in den Vordergrund kommt, sofort nachsieht statt auf den Poll zu warten. (3) HintCard „Neue Version verfügbar“ fest über dem Inhalt (bei sichtbarer TabBar darüber) mit „Jetzt neu laden“ (`location.reload()`) und „Später“ (blendet nur aus, der Reload bei der nächsten Navigation bleibt). Dafür hat `HintCard` einen optionalen `action`-Snippet bekommen. Bewusst KEIN automatischer Reload beim `controllerchange` des Service Workers: das würde jemanden mitten im Formular unterbrechen.

**Warum kein vollständiger E2E im Dev-Modus.** SvelteKits `updated.check()` ist unter `__SVELTEKIT_DEV__` hart ein No-op, und der Dev-Server liefert kein `_app/version.json`. Der neue Test `e2e/update-hint.spec.ts` prüft deshalb zuerst, ob `_app/version.json` als JSON antwortet, und überspringt sich sonst. Gegen `npm run build && npx vite preview --port 5173 --strictPort` läuft er komplett: Route tauscht die Versionsdatei aus, `visibilitychange` löst die Prüfung aus, Hinweis + beide Buttons erscheinen, „Später“ blendet aus. **Falle:** nach einem Rebuild muss `vite preview` neu gestartet werden, sonst fehlen die neuen Asset-Hashes (ENOENT im Preview-Log, `version.json` liefert 000).

**Grün.** `check` · `lint` · 70 Unit-Tests · 3 E2E gegen Preview (2 Smoke + Update-Hinweis). Screenshot der Login-Seite mit dem Hinweis geprüft. Changelog-Eintrag unter 2026-09-03.

**Ausgerollt (2026-09-03, Commit `0c85c16`).** Keine Migration, nur `git push` → Netlify-Build nach ~40 s live; `https://app.lions-bonn-rheinaue.de/_app/version.json` liefert `{"version":"0c85c16"}`. Der Poll greift für jedes Gerät erst ab dem nächsten vollen Seitenaufruf (der neue Build enthält ihn); heute schon offene alte Tabs heilen sich wie bisher beim nächsten Neuladen.

## Laufende Termine bleiben bis zu ihrem Ende „anstehend“ (2026-10-02)

**Anlass.** Beobachtung des Webmasters: Ein Clubabend verschwand bei Beginn von der Startseite und wanderte im Termine-Tab zu „Vergangen“. Ursache: Startseite (`.gte('starts_at', now)`) und Listenfilter trennten nach `starts_at`; `ends_at` spielte nirgends eine Rolle. Die Spezifikation (§ „Anstehend vs. Vergangen“) regelt laufende Termine nicht. Es war also eine Lücke, keine Entscheidung.

**Entscheidung.** Anstehend bis zum Ende: `ends_at`, sonst Beginn + 2 h (derselbe Default wie Planung und .ics). Während des Termins Wort-Label „Läuft gerade“ (Gold-Tag) auf der `EventCard`. **Die RSVP-Sperre bleibt ab Beginn** (RLS `starts_at > now()`, `isPast` im Detail), damit Nachmeldungen während des Abends die Anwesenheitserfassung nicht stören. Das Detail sagt bei laufenden Terminen „Der Termin hat begonnen – keine Änderung mehr möglich.“ statt „Vergangener Termin“.

**Umsetzung.** Helfer `eventEnd`/`isEventOver`/`isEventRunning` in `src/lib/dates.ts` (auch von `ics.ts` genutzt). Startseite filtert per `or(ends_at.gt.<jetzt>, and(ends_at.is.null, starts_at.gt.<jetzt − 2 h>))`. Keine Migration.

**Grün.** `check` · `lint` · 74 Unit-Tests (4 neu). Im lokalen Stack per Playwright als Präsident verifiziert, mit drei Testterminen: läuft mit `ends_at` bzw. ohne `ends_at` → Startseite + „Anstehend“ mit „Läuft gerade“; Beginn vor 150 min ohne `ends_at` → „Vergangen“. Die PostgREST-Filtersyntax wurde zusätzlich gegen Produktion geprüft (401 statt 400 = Filter geparst). Changelog: beide Änderungen vom 2026-10-02 (laufende Termine + dieser Hinweis) zu einem Punkt zusammengefasst, damit die Karte direkt den Text zeigt.

## Hinweis „Neu in der App“ nach einem Update (2026-10-02)

**Anlass.** Rückfrage des Webmasters zum Update-Ablauf: Mitglieder bekamen zwar „Neue Version verfügbar“, erfuhren aber nicht, was sich geändert hat. Der Changelog war nur über die Versionszeile unter „Ausloggen“ erreichbar.

**Umsetzung.** Root-Layout zeigt eingeloggt eine HintCard „Neu in der App“ (über der TabBar, nicht gleichzeitig mit „Neue Version verfügbar“). Bei genau einer ungesehenen Änderung steht deren Text in der Karte, sonst „Seit deinem letzten Besuch gibt es N Neuerungen.“ Knöpfe „Was ist neu?“ (→ `/mehr/version`) und „Schließen“. Maßstab ist das Datum des neuesten **Changelog-Eintrags**, nicht der Commit: Deploys ohne Eintrag lösen nichts aus. Gemerkt pro Gerät in `localStorage` (`lions-changelog-seen`), Logik in `src/lib/whatsNew.ts`; ohne gespeicherten Stand zählt nur der neueste Eintrag, ohne nutzbaren Speicher erscheint nichts. Wer `/mehr/version` selbst öffnet, hat es gesehen. Bewusst keine DB-Spalte: reine Komfortfunktion, keine Personendaten, nicht im Logout-Wipe. **Grenze:** weitere Änderungen am selben Tag (gleiches Datum) melden sich bei Geräten, die den Tag schon gesehen haben, nicht erneut.

**Grün.** `check` · `lint` · 81 Unit-Tests (5 neu). Im lokalen Stack per Playwright als Präsident verifiziert: Karte nach Login sichtbar, „Was ist neu?“ und „Schließen“ setzen den Stand, nach Neuladen keine Karte mehr. Changelog: beide Änderungen vom 2026-10-02 (laufende Termine + dieser Hinweis) zu einem Punkt zusammengefasst, damit die Karte direkt den Text zeigt.

## Login: Code-Eingabe und „Code erneut senden“ (2026-10-02)

**Anlass.** Ein Mitglied berichtete am Clubabend, es müsse sich am Windows-PC immer wieder neu anmelden und den Code mehrfach anfordern, bevor eine Mail ankomme.

**Befund (Produktion, nur lesend).** `auth.audit_log_entries` ist leer – Supabase schreibt das Auth-Protokoll nicht mehr in die DB, das Dashboard-Log hält im Free-Plan nur rund einen Tag. Ersatzweise `auth.sessions` + `auth.refresh_tokens` ausgewertet: fünf Chrome-Sitzungen unter Windows seit Juli, Lebensdauer 0–11 Tage, **alle mit weiterhin gültigem Refresh-Token** → der Server hat nie abgemeldet, der Browser hat die Cookies verloren (Chrome-Einstellung „beim Schließen löschen“, Aufräum-Software oder mehrere PCs). Sitzungen ohne Browser-Kennung (vermutlich Handy) laufen seit Wochen durch. Die Club-Domain hat SPF, DKIM und DMARC; die Empfängerdomain liegt auf einem eigenen kleinen Mailserver (Greylisting möglich). Ob Anforderungen abgelehnt wurden oder Mails hängen blieben, lässt sich ohne Log nicht klären.

**Bewusst NICHT umgesetzt:** Auth-Cookies serverseitig bei jedem Aufruf neu setzen (hilft nur gegen Safaris 7-Tage-Kappung von JS-Cookies; Mac-Safari-Sitzungen seit Juli: eine). Risiko: der Server schreibt einen veralteten Token über einen frisch erneuerten.

**Umsetzung.** `OtpInput`: Prop `autofocus` (erstes Feld beim Erscheinen fokussiert, Code direkt einfügbar), erstes Feld mit `autocomplete="one-time-code"` und `maxlength` = Codelänge; ein kompletter Code in einem Feld (Code-Vorschlag des Systems) wird wie Einfügen verteilt. Login-Seite: „Code erneut senden“ 60 s gesperrt mit Countdown (Supabase nimmt pro Adresse etwa einen Code pro Minute an, jeder neue macht den vorigen ungültig); HTTP 429 führt zur Code-Eingabe mit „Die Mail ist vermutlich schon unterwegs“ statt „Bitte prüfe deine E-Mail-Adresse“; Hinweis auf Wartezeit, Spam-Ordner und „nur der neueste Code gilt“; Fehlermeldung bei falschem Code nennt das ebenfalls.

**Grün.** `check` · `lint` · 81 Unit-Tests. Lokal per Playwright verifiziert: Fokus auf „Ziffer 1“, Countdown, falscher Code, kompletter Code per `insertText` ins erste Feld → angemeldet, simuliertes 429 → Code-Eingabe mit Hinweis. Changelog-Punkt unter 2026-10-02.

## Security-Scan 2026-10-04: Reminder-RPC gesperrt, Galerie-Link nicht mehr öffentlich

**Anlass.** Vollständiger Scan mit Claude Security (Effort medium, Commit `9ba785a`): 12 bestätigte Befunde, 3 × MEDIUM, 9 × LOW, nichts Kritisches. Bericht lokal in `CLAUDE-SECURITY-20261004-114337/` (nicht im Repo).

**F1 behoben – Benachrichtigungsflut per RPC.** `enqueue_due_reminders(p_today)` ist SECURITY DEFINER und war für `anon` und `authenticated` per `POST /rest/v1/rpc/…` aufrufbar. Mit frei gewähltem Datum (geht in den Dedupe-Schlüssel ein) hätte jeder mit dem öffentlichen Key beliebig viele Push-Nachrichten und Mails an alle Mitglieder auslösen und damit auch das Gmail-Kontingent für die Login-Codes aufbrauchen können. Migration `20261004120100` entzieht das Recht (`from public, anon, authenticated`), nur `service_role` (Admin-Route) behält es; pg_cron läuft als `postgres`. **Lehre:** Supabase vergibt EXECUTE auf neue Funktionen direkt an `anon`/`authenticated` – `revoke … from public` allein reicht nicht. Alle übrigen DEFINER-Funktionen geprüft: prüfen selbst per `has_permission` oder sind harmlos. pgTAP: 3 neue Checks in `reminders_test.sql` (133 grün). Auf Produktion per `supabase db push` eingespielt, Rechte dort per `has_function_privilege` bestätigt.

**F3 behoben – Galerie-Link stand in jeder Seite.** `PUBLIC_GALLERY_URL` lag in `$env/dynamic/public`; SvelteKit schreibt solche Variablen ins Bootstrap-Skript jeder Seite (auch `/login`) und liefert sie unter `/_app/env.js` vor dem Auth-Guard aus. Weil der Drive-Ordner „Jeder mit Link“ ist, kam damit jeder ohne Konto ans Fotoarchiv. Jetzt private Env `GALLERY_URL`, ausgegeben nur von `src/routes/galerie/+page.server.ts` an Nutzer mit `current_member_id()`. Die Drive-Freigabe „Jeder mit Link“ bleibt bewusst (eigene Google-Konten waren für einige Mitglieder zu kompliziert); Restrisiko Weiterleiten akzeptiert. Optional später: neuen Drive-Ordner anlegen, damit der bisher öffentliche Link ungültig wird. Lokal per Playwright geprüft: `/login` und `/_app/env.js` ohne Link, als Präsident „Galerie öffnen“ sichtbar. **Netlify:** `GALLERY_URL` anlegen, `PUBLIC_GALLERY_URL` löschen (sonst bleibt sie im HTML, auch wenn der Code sie nicht mehr liest).

**Bewusst NICHT umgesetzt:** F2 (Präsident/Vize können die Login-Mail höher berechtigter Konten ohne Bestätigung ändern) – User-Entscheidung, kein realistischer Täter im Club.

**LOW-Befunde behoben (gleicher Tag).**

- **CSV-Formelinjektion (F4/F5/F8):** gemeinsamer Helfer `src/lib/csv.ts` (`csvCell`/`csvRow`/`downloadCsv`) für Lions-, Teilnehmer- und Abwesenheitsexport. Werte, die mit `= + - @` (oder Tab/CR) beginnen, bekommen ein Hochkomma – außer reine Ziffern-/Telefonwerte wie „+49 228 123456“, die keine Formel ausführen können und sonst sichtbar verfälscht würden. Lokal per Playwright mit eingeschleustem `=HYPERLINK(…)` im Lions-Export geprüft.
- **Push-Abo nach Logout (F6/F11):** `releasePushOnSignOut()` (vor `auth.signOut()`, löscht die eigene `push_subscription`-Zeile und kündigt das Abo) und `releaseForeignPush()` nach dem Login (kündigt ein Abo, dessen Zeile per RLS nicht sichtbar ist = fremdes Konto). **Folge:** Wer sich ab- und wieder anmeldet, muss Push neu aktivieren.
- **Storage-Pfade (F9/F10/F12):** Migration `20261004120200`: CHECK `member_photo_path_own` und `document_file_path_own` (Pfad muss mit `<id>/` beginnen, kein `..`), Bestand beim Anlegen mitgeprüft. Zusätzlich löscht der Client nur noch Dateien unter dem eigenen Ordner (`src/lib/storagePath.ts`).
- **Lions-Jahr und Zeitzone (F7):** Migration `20261004120300`: `current_lions_year()` rechnet über `lions_year_at(now())` fest in Europe/Berlin statt mit `current_date` der Sitzung.

**Grün.** `check` · `lint` · 89 Unit-Tests (8 neu) · 142 pgTAP (9 neu in `storage_path_lions_year_test.sql`).

## Code-Review `src/lib` (2026-10-04)

`/code-review high src/lib`: 10 Befunde, alle behoben. **Neu von heute:** Dateinamen mit `..` scheiterten an der neuen Pfad-Regel (jetzt `safeFileName()` in `src/lib/storagePath.ts`, Fehler beim Setzen von `file_path` wird nicht mehr verschluckt); CSV-Ausnahme für Telefonnummern zu weit (Excel rechnete `+49-228-…` aus) – jetzt bekommt alles mit `= + - @` ein Hochkomma außer reinen Zahlen (User-Entscheidung, sichtbares Hochkomma in Kauf genommen). **Älter:** Monatsserie ab dem 29.–31. lief in den Folgemonat (jetzt letzter Tag des Monats); schnelle Mehrfachauswahl bei Zusatzfragen verlor Optionen bzw. legte doppelte Antworten an (lokaler Stand in `AnswerField` + Speichern je Frage nacheinander); `lionsStartYear()` rechnet fest in Europe/Berlin wie die DB; Datei-Löschen bricht bei Storage-Fehler ab (Reihenfolge bleibt Datei vor Zeile, weil `documents_write_events` die Zeile prüft); CSV-Download hängt den Link ein und gibt die Blob-URL verzögert frei (iOS); News-Links ohne Satzzeichen am Ende; OTP-Feld zeigt abgelehnte Zeichen nicht mehr. Aufgeräumt: Lions-Export nutzt `csvRow`/`downloadCsv`, `EventCard` importiert `EventType` aus `$lib/dates`.

**Typografie:** `—` als Gedankenstrich in `src`, `scripts`, `static`, `e2e`, `supabase/functions`, `supabase/tests` durch `–` ersetzt (57 Dateien; Migrationen unverändert, allein stehendes `—` als „kein Wert“ bleibt). `typografie.test.ts` prüft jetzt diese Verzeichnisse auf `—` und auf falsch geschlossene Anführungszeichen. Edge Functions nicht neu deployt (nur Kommentare und eine Log-Zeile).

**Grün.** `check` · `lint` · 97 Unit-Tests · 142 pgTAP; lokaler Smoke-Test per Playwright ohne JS-Fehler.

## Code-Review `src/routes` + Club-Entscheidungen (2026-10-04)

`/code-review high src/routes`: 10 Befunde, alle behoben. Dazu drei Entscheidungen des Webmasters.

**Entscheidungen.**

- **Absagen mit Begleitung:** Ein Mitglied kann absagen und trotzdem Partner oder Gast anmelden. Begleitpersonen zählen unabhängig vom Status des Mitglieds (Anmeldezahl, Meldungen, Gäste-Liste mit „Gast von …“ nur bei abgesagtem Mitglied, Teilnehmerliste/CSV). Wer abgesagt hat, beantwortet Zusatzfragen nicht selbst, nur für die Begleitung. Zählregeln zentral in `src/lib/rsvp.ts` (`rsvpCounts`). RLS erlaubte das schon immer, es war eine reine Anzeigefrage.
- **Anwesenheit nur zwei Lions-Jahre:** Migration `20261004120400` – `cleanup_attendance()` per pg_cron (`attendance-cleanup`, monatlich am 1. um 03:15 UTC) löscht Anwesenheit zu Terminen vor dem 1. Juli des abgeschlossenen Vorjahres (Berlin). Laufendes und Vorjahr bleiben vollständig, Termine bleiben bestehen. Kein RPC-Recht für App-Rollen.
- **Auswertung:** lädt Anwesenheit nur für die Termine des gewählten Lions-Jahres (vorher ungefiltert → stiller Abbruch an der PostgREST-Grenze von 1000 Zeilen nach ca. 29 Terminen). Auswahl: laufendes und Vorjahr; Vorauswahl Juli–September das Vorjahr (Einzug der Abwesenheitsspenden), sonst das laufende.
- **Mitglied löschen:** neue Route `DELETE /api/mitglieder/[id]` – löscht die Zeile mit der Sitzung des Aufrufers (RLS `member_delete_privileged` entscheidet), danach mit Service-Key alle Fotos unter `<id>/` und das Login-Konto in `auth.users`. Eigenes Konto ausgeschlossen. Restprobleme erscheinen als Hinweis auf `/mitglieder`.

**Weitere Korrekturen.** Dokumentenablage filtert Termin-Anhänge auch beim Nachladen und in der Suche aus, ignoriert überholte Abfragen und öffnet Dokumente iOS-fest (`openDocument()`: Fenster im Klick öffnen, danach auf die signierte URL lenken). „Offen“ = aktive Mitglieder ohne Rückmeldung (Start, Liste, Sheet). Mitgliederliste gruppiert je Anfangsbuchstabe (Umlaute zum Grundbuchstaben) statt nach DB-Reihenfolge. Benachrichtigungen werden beim Antippen gelesen, Geburtstage führen zu `/geburtstage`. Terminplanung: fehlgeschlagener Anhang-Upload erscheint als Hinweis auf der Termin-Seite (`page.state.notice`), ein nur vorgeschlagenes Ende wird bei Typen ohne Standarddauer geleert. Beim Ersetzen eines Fotos oder einer Dokumentdatei wird die alte Datei gelöscht.

**Grün.** `check` · `lint` · 100 Unit-Tests · 146 pgTAP (4 neu). Lokal per Playwright verifiziert: Absage mit Gast (Zugesagt 1 · 0 Mitglieder, 1 Gast; „Gast von …“), Offen-Zahl, Buchstabengruppen, Auswertung, Mitglied löschen inkl. Foto und Login-Konto. **Hinweis lokal:** `.env.local` enthält den Produktions-Service-Key; für Server-Routen gegen den lokalen Stack den lokalen Key per Umgebungsvariable setzen.

## Code-Review `supabase/functions` (2026-10-04)

`/code-review high supabase/functions`: 10 Befunde, alle behoben. Auf Produktion hing vorher keine Benachrichtigung (0 von 366 unversendet), die Versandfixes sind also Vorsorge.

- **Outbox-Zustand (Migration `20261004120500`):** `notification.attempts`, `last_attempt_at`, `claimed_at` + RPC `claim_notifications(p_limit)` (nur `service_role`, `FOR UPDATE SKIP LOCKED`). Ein Lauf reserviert Zeilen atomar → zwei gleichzeitige Läufe (Cron + Admin-Route) senden nichts doppelt. Fehlversuche zählen hoch, Wartezeit wächst (attempts Stunden), nach 5 Versuchen ruht die Zeile – vorher wäre eine unzustellbare Zeile ewig offen geblieben und hätte ab 500 Stück alles Neue verdrängt. Dry-Run reserviert nichts.
- **„Nur Push“ ohne Push-Abo:** bekommt jetzt die E-Mail als Rückfallebene (vorher gar nichts außerhalb der App; es gibt kein Voll-Opt-out).
- **SMTP:** ein Client je Lauf, erst bei der ersten Mail geöffnet; `tls` nur bei Port 465 (587 = STARTTLS); Fehler beim Schließen beenden den Lauf nicht mehr mit 500. Lokaler Test gegen Mailpit nur mit `SMTP_ALLOW_INSECURE=true` (kein TLS, kein AUTH) – in Produktion nie setzen.
- **Fehler beim Laden der Push-Abos** → 500 und Reservierung freigeben (statt allen eine E-Mail statt Push).
- **Mail-Text:** Absätze bleiben erhalten, Links sind klickbar (`bodyToHtml()` in `email.ts`).
- **`extract-document-text`:** schreibt `content_text` als Aufrufer (RLS entscheidet, kein Probe-Update mehr, das den Titel zurückschrieb), prüft den Schreibfehler; DOCX: Tab/Umbruch als Leerraum, Entities einmal und vollständig aufgelöst (`&amp;` zuletzt).

**Grün.** 102 Unit-Tests · 152 pgTAP (6 neu in `notification_outbox_test.sql`). Lokal mit `supabase functions serve` + Mailpit end-to-end geprüft: zwei gleichzeitige Läufe → 3 Mails, keine doppelt; „Nur Push“ ohne Abo → E-Mail; DOCX-Extraktion als Präsident 200, als Schatzmeister ohne Schreibrecht 403 und Volltext unverändert.
