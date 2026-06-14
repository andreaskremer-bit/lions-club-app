# CLAUDE.md — Clubverwaltungs-App Lions Club Bonn-Rheinaue

Mobile-first **PWA** zur Clubverwaltung (ersetzt die Avareto-LionsApp), ~34 Mitglieder, ~90 % mobil.

## Quelldokumente (verbindlich, in dieser Reihenfolge)

1. `HANDOFF.md` — Auftrag, Grundregeln, DSGVO, Meilenstein-Reihenfolge.
2. `IMPLEMENTIERUNGSPLAN.md` — Architektur, Datenmodell, RLS, Meilensteine M0–M6.
3. `SPEZIFIKATION.md` (v1.8) — Rollen/Rechte, Veranstaltungstypen + Regeln, Abwesenheits-Spenden, Datenmodell, DSGVO.
4. `design-referenz/` — Design-System „Lions 2.0" (React-Referenz + Tokens/CSS). `readme.md` + `SKILL.md` zuerst lesen.
5. `MEILENSTEINE.md` — „erledigt/offen"-Protokoll je Meilenstein (am Ende jedes Meilensteins fortschreiben).

## Stack (verbindlich)

- **SvelteKit + TypeScript**, Svelte 5 **Runes**. **Wichtig: kein `svelte.config.js`** — Adapter, `compilerOptions`, Plugins stehen in `vite.config.ts` an `sveltekit({...})`.
- **Supabase** (Region **EU / Irland (eu-west-1)**): Postgres, Auth, RLS, Storage, Edge Functions/pg_cron. Zugriff bevorzugt **clientseitig mit RLS**.
- **Auth: E-Mail-OTP** (6-stelliger Code, `signInWithOtp` mit `shouldCreateUser:false` → `verifyOtp`). Kein Magic-Link, kein Self-Signup.
- Hosting **Netlify** (`adapter-netlify`), als neue Site unter dem bestehenden Club-Netlify-Account.
- PWA via `@vite-pwa/sveltekit` (Import `SvelteKitPWA`, **nicht** aus `vite-plugin-pwa`).

## Projektstruktur

- `src/lib/styles/` — `app.css` (Einstieg) importiert `tokens/*.css` + `components.css`. `fonts.ts` = self-hosted Schriften.
- `src/lib/components/ui/` — Svelte-Komponenten (Button, IconButton, Card, Avatar, Tag, StatusBadge, Input, OtpInput, SegmentedControl, ListRow, TabBar, AppBar), Barrel `index.ts`.
- `src/hooks.server.ts` — Supabase-Server-Client, `safeGetSession` (mit `getUser`-Validierung), Auth-Guard (→ `/login`).
- `src/routes/+layout.ts` / `+layout.server.ts` — Client/Server-Supabase-Client + Session.
- `src/routes/login/+page.svelte` — OTP-Flow. `src/routes/+page.svelte` — geschützte Startseite.

## Design-Regeln (nicht verhandelbar)

- **React-Komponenten in `design-referenz/` sind nur Vorlage** — Tokens/CSS direkt übernehmen, Markup in Svelte nachbauen (je Komponente `*.prompt.md` als Spec).
- **Sprache: durchgängig Deutsch, „du"-Ansprache, keine Emoji.** Feste Status-Vokabeln: **Zugesagt/Abgesagt/Offen** (eigener RSVP), **angemeldet/abgemeldet/offen** (Zähler), **Anwesend/Abwesend**, **aktiv/inaktiv/Ehrenmitglied**.
- Event-Titel = Programm/Thema, Typ nur als Badge.
- **Barrierefreiheit:** Touch-Ziele ≥ 44 px, Grundschrift 17 px, Status **nie nur über Farbe** (immer Wort/Label), WCAG-AA-Kontrast auf Creme.
- **Keine Spenden-/Geld-Hinweise** im Mitglieder-/Erfassungs-UI — Geldsicht nur in der Schatzmeister-Auswertung.
- Farben: Creme `#F6F1E7`, Lions-Blau `#1E4FA3` (Aktion), Gold `#B98A22` (sparsam), Clay `#B4502F`, Sage (Anwesend). Hairlines statt Schatten.

## DSGVO (Architekturtreiber)

- **Schriften self-hosten** (`@fontsource-variable/*`) — **niemals** Google-Fonts-CDN.
- Daten in Supabase **EU / Irland (eu-west-1)**; **RLS** als technische Zugriffskontrolle; keine personenbezogenen Daten in URLs/Query-Strings.
- **Logo:** offizielles Lions-Emblem ist markenrechtlich geschützt → ohne Club-Freigabe **nicht** einbauen. Aktuell „LC"-Monogramm als Platzhalter (`static/icons/monogram.svg`).

## Befehle

- `npm run dev` (Standard-Port 5173) · `npm run build` · `npm run check` (svelte-check) · `npm run lint` · `npm run format`.
- **DB (lokaler Stack, Docker):** `npm run db:start` · `db:stop` · `db:reset` (Migrationen + `supabase/seed.sql`) · `db:test` (pgTAP-RLS-Tests). CLI = `npx supabase`.
- **Tests:** `npm run test:unit` (Vitest, `src/lib/*.test.ts`) · `npm run test:e2e` (Playwright, `e2e/`).
- Vor Commit: `npm run check` **und** `npm run lint` müssen grün sein. `design-referenz/` ist aus Lint/Format ausgenommen.
- **Lokaler Dev-Login:** Mails landen in **Mailpit** (`http://127.0.0.1:54324`); `.env.local` überschreibt `PUBLIC_SUPABASE_*` auf den lokalen Stack (zum Remote-Test auskommentieren).

## Lieferform je Meilenstein

Versionierte DB-Migrationen, **RLS-Policies mit Tests**, sauber getrennte Komponenten, „erledigt/offen"-Notiz in `MEILENSTEINE.md`.

## Env / Secrets

- `.env` (git-ignoriert): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (neues Key-System: `sb_publishable_…`, client-sicher mit RLS).
- `.env.local` (git-ignoriert): DB-Passwort, lokale Stack-Overrides, **`SUPABASE_SERVICE_ROLE_KEY`** (lokal) — nie committen, nie ins Memory.
- **Service-Key serverseitig:** `SUPABASE_SERVICE_ROLE_KEY` nur in Server-Routen (z. B. `/api/mitglieder/[id]/einladen`, Admin-API); in Produktion als **Netlify-Env-Var**. `sb_secret_…` **niemals** in den Client.

## Aktueller Stand

Siehe persistentes Memory (`milestone-status`). Kurz (Stand 2026-06-17):

**M0–M4 vollständig, M5 im Kern fertig, Prototyp LIVE.**

- **Live:** `https://app.lions-bonn-rheinaue.de` (Netlify, Club-Account, Auto-Deploy bei Push). OTP-Login über Club-Gmail-SMTP verifiziert; als PWA aufs iPhone installierbar.
- **Remote-Projekt** `qfxtyqippdrcrhwbkhwx` (EU/Irland): alle Migrationen via `supabase db push` angewendet; Admin-Bootstrap `webmaster@lions-bonn-rheinaue.de` = Präsident + Webmaster.
- **Umgesetzt:** Auth · Mitglieder (+Admin: anlegen/einladen/Ämter/löschen) · Termine (Liste+Kalender, RSVP, Begleitpersonen, Meldungen, Jahresplanung/Serien) · Anwesenheit + Schatzmeister-Auswertung (CSV, ohne Beträge) · Zusatzabfragen (Builder/Beantworten/Teilnehmer+CSV) · Geburtstage · Foto-Upload (privater Bucket) · In-App-Benachrichtigungen + Reminder-Engine (`enqueue_due_reminders`, pg_cron guarded).
- **Tests:** 50 pgTAP + 10 Vitest-Unit + 2 Playwright-E2E, alle grün.

**Offen:** M5-Versandkanäle (Web-Push + E-Mail-Reminder + pg_cron auf Supabase aktivieren, PWA-Offline-Shell) · M6-Inhalte (News, Dokumente, Galerie-Link) · zum echten Go-live: **Supabase Pro-Plan** (Free pausiert nach 7 Tagen) + **OAuth2-Mailversand** (statt App-Passwort).

**Abweichungen von den Quelldokumenten (bewusst beschlossen):** M3 erfasst **keine Spendenbeträge** (nur an-/abwesend; Schatzmeister rechnet jährlich extern, Export CSV). Sekretär hat zusätzlich `manage_roles` + `delete_member`. Region ist **eu-west-1 (Irland)**, nicht Frankfurt.
