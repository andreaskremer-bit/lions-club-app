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
- Admin-Funktionen Mitglieder (Neumitglied anlegen/einladen, fremde Stammdaten/Ämter pflegen, löschen) — Rechte stehen, UI später.
- Foto-Upload (Storage-Bucket für `photo_path`).
- Geburtstagsübersicht (Spec §4.1).

## M2 – Termine — erledigt

**Erledigt (2026-06-16)**

- **Schema (Migrationen):** `event` (Typ-Enum; aus `type` generierte Spalten `companion_allowed`/`donation_required` = Matrix Spec §4.2), `event_response` (RSVP `zugesagt`/`abgesagt`; „Offen" = keine Zeile), `companion` (Begleitperson je Rückmeldung).
- **RLS + Tests:** eigene Rückmeldung schreibbar, **Vergangenheits-Sperre** (`starts_at > now()`), Begleitperson nur bei erlaubtem Typ; Termine verwalten mit `manage_events`. **11 pgTAP-Tests** (gesamt 28 grün).
- **UI:** `/termine` (Übersicht Anstehend/Vergangen, eigener Status als Badge, Zähler angemeldet/abgemeldet/offen, **antippbar → Meldungen-Sheet** mit Namensliste je Status; „Offen" = aktive ohne Rückmeldung), `/termine/[id]` (Detail: Anmelden/Abmelden beide sichtbar, Kommentar, Begleitpersonen hinzufügen/entfernen, Meldungen-Listen). Startseiten-Link.
- **Dev-Seed:** 6 Termine (vergangen + anstehend, alle Typen) + Rückmeldungen + Begleitperson.
- Qualität: `npm run check` 0/0; eigene Dateien prettier-konform.

**Offen / als Nächstes (M3 – Anwesenheit & Finanzen)**

- Kalenderansicht der Termine (Listenansicht steht; Kalender ist „Soll").
- Echtzeit-Aktualisierung der Teilnehmerlisten (optional, Supabase Realtime).
- Dann M3: Anwesenheitserfassung (spendenpflichtige Termine), Abwesenheits-Spenden, Schatzmeister-Auswertung + Export.
