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
- **Logo:** offizielles Lions-Emblem ist **vom Club freigegeben und in Nutzung** (`static/icons/lions-emblem.png`) — auf Login-Brand-Lockup + Start-AppBar; gemäß Marken-Vorgaben nicht umfärben/verzerren, genug Freiraum lassen. PWA-/App-Icons (`static/icons/pwa-*.png`, `favicon.png`) tragen es ebenfalls. Das „LC"-Monogramm (`static/icons/monogram.svg`) bleibt nur als kompakter Fallback.

## Befehle

- `npm run dev` (Standard-Port 5173) · `npm run build` · `npm run check` (svelte-check) · `npm run lint` · `npm run format`.
- **DB (lokaler Stack, Docker):** `npm run db:start` · `db:stop` · `db:reset` (Migrationen + `supabase/seed.sql`) · `db:test` (pgTAP-RLS-Tests). CLI = `npx supabase`.
- **Tests:** `npm run test:unit` (Vitest, `src/lib/*.test.ts`) · `npm run test:e2e` (Playwright, `e2e/`).
- Vor Commit: `npm run check` **und** `npm run lint` müssen grün sein. `design-referenz/` ist aus Lint/Format ausgenommen.
- **Lokaler Dev-Login:** Mails landen in **Mailpit** (`http://127.0.0.1:54324`); `.env.local` überschreibt `PUBLIC_SUPABASE_*` auf den lokalen Stack (zum Remote-Test auskommentieren).

## Lieferform je Meilenstein

Versionierte DB-Migrationen, **RLS-Policies mit Tests**, sauber getrennte Komponenten, „erledigt/offen"-Notiz in `MEILENSTEINE.md`.

## Env / Secrets

- `.env` (git-ignoriert): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (neues Key-System: `sb_publishable_…`, client-sicher mit RLS), **`PUBLIC_VAPID_KEY`** (öffentlicher Web-Push-Schlüssel, client-sicher), **`PUBLIC_GALLERY_URL`** (Google-Drive-Link der Galerie, client-sicher).
- `.env.local` (git-ignoriert): DB-Passwort, lokale Stack-Overrides, **`SUPABASE_SERVICE_ROLE_KEY`** (lokal), **`VAPID_PRIVATE_KEY`** + `VAPID_SUBJECT`, **`REMINDERS_ARMED`** (Dry-Run-Schalter) — nie committen, nie ins Memory.
- **Service-Key serverseitig:** `SUPABASE_SERVICE_ROLE_KEY` nur in Server-Routen (z. B. `/api/mitglieder/[id]/einladen`, `/api/admin/reminders/run`); in Produktion als **Netlify-Env-Var**. `sb_secret_…` **niemals** in den Client.
- **Edge Function `send-notifications`** (Deno): Secrets via `supabase secrets set` bzw. lokal `supabase/functions/.env` — `REMINDERS_ARMED` (Default false = Dry-Run), `REMINDERS_ALLOWLIST`, `VAPID_*`, `SMTP_HOST/PORT/USER/PASS/FROM`.
- **Versand-Sicherung (Geheim-Phase):** Reminder werden nur für `member.notifications_enabled=true` ERZEUGT (Default false); zusätzlich sendet die Edge Function nur bei `REMINDERS_ARMED=true`. Go-live-Schalter siehe `MEILENSTEINE.md` (M5).

## Aktueller Stand

Siehe persistentes Memory (`milestone-status`). Kurz (Stand 2026-06-16):

**M0–M6 + P1 + P2 + P2.1 + P3 + P4 + Design-2.0-Phase-1+2+5 (Bottom-Nav/IA + Branding/Emblem + WCAG-Politur) vollständig & LIVE (M6: Dokumente, News, Galerie-Link; Versand NICHT scharfgestellt — Geheim-Phase), Prototyp LIVE.**

- **Live:** `https://app.lions-bonn-rheinaue.de` (Netlify, Club-Account, Auto-Deploy bei Push). OTP-Login über Club-Gmail-SMTP verifiziert; als PWA aufs iPhone installierbar.
- **Remote-Projekt** `qfxtyqippdrcrhwbkhwx` (EU/Irland): Migrationen bis `20260621120200` (P4) via `supabase db push` angewendet; Edge Functions `extract-document-text` + `send-notifications` deployed; Admin-Bootstrap `admin@example.com` = Präsident + Webmaster; remote nur Andreas `notifications_enabled=true`.
- **Umgesetzt:** Auth · Mitglieder (+Admin, volle Adresse, `phone_office`, Partner-Vor/Nachname) · Termine (Liste+Kalender, RSVP, Begleitpersonen + Partner-Schalter, `speaker`/Referent, Meldungen, Jahresplanung/Serien, `reminder_days_before`, Bearbeiten/Löschen, `ends_at`+2h-Default, .ics-Export) · Startseite (Karten: nächster Termin + neueste News) · Anwesenheit + Schatzmeister-Auswertung (CSV) · Zusatzabfragen · Geburtstage · Foto-Upload · In-App-Benachrichtigungen + Reminder-Engine · Web-Push + Edge Function `send-notifications` (Push + SMTP-Fallback, Dry-Run-gated) + Empfänger-Gate `notifications_enabled` + Versandkanal-Präferenz `notification_channel` (push/email/both, kein Voll-Opt-out) · **Dokumente (`/dokumente`: Ablage + deutsche Volltextsuche via Edge Function `extract-document-text`, Kategorien/Sortierung, Upload/Bearbeiten, Push-Benachrichtigung)** · **News (`/news`: Feed, Klartext+Linkify, Anpinnen, Push-Benachrichtigung)** · **Galerie (`/galerie`: Link aufs geteilte Google-Drive via `PUBLIC_GALLERY_URL`)** · **Vorstand/Ämter (`/vorstand`, `manage_roles`): Lions-Jahr-Dimension (1.7.–30.6., Auto-Umstellung ohne Cron), zeitabhängige `has_permission`, Ämter-Cluster + display_only-Beauftragte, abgeleiteter Past-Präsident, Vereinslokal-Default für Clubabend/MV)** · **Lions-Export (`/mitglieder/export`, `export_lions`: Mitglieder-CSV inkl. inaktive, Excel-tauglich, ohne Partner-/Notizfelder; Helfer `src/lib/lionsExport.ts`)**.
- **Tests:** 82 pgTAP + 31 Vitest-Unit + 2 Playwright-E2E.
- **LJ-Rechte-Lehre (P2):** Bei zeitabhängigen Ämtern MÜSSEN alle Rechte-Leser denselben LJ-Filter wie `has_permission` nutzen — Client-`+layout.ts` UND `/api`-Routen auf `.eq('member_amt.lions_year', lionsStartYear(new Date()))`. Sonst bietet die UI LJ-fremde Aktionen an (RLS blockt zwar, aber Gate ist falsch).
- **Push-Reihenfolge (P2-Lehre):** Root-Layout fragt `member_amt.lions_year` auf JEDER Seite ab → bei schema-relevanten Migrationen **immer `supabase db push` ZUERST, dann `git push`**.
- **`service_role`-Grant-Falle:** Edge Functions laufen als `service_role` — RLS-Bypass ersetzt NICHT die Tabellen-Grants. Bei neuen Tabellen, die eine Edge Function direkt liest/schreibt, immer auch `grant … to service_role` (sonst `permission denied 42501`).

**Offener Backlog:** **Design „Lions 2.0"**: Phase 1 (Bottom-Nav/IA: globale TabBar Start/Termine/Mitglieder/News/Mehr, `/mehr`-Hub, verschlankte Startseite) + Phase 2 (Branding: echtes Lions-Emblem auf Login + Start-AppBar; PWA-Icons waren schon gebrandet) + Phase 5 (WCAG-AA: `--gold-700` #856010 statt #9a7218 für AA-konformen kleinen Gold-Text; C5-Datums-Chip war nie ein Problem) **erledigt+live**; offen Phase 3 fehlende Komponenten (Select/Checkbox/Switch/HintCard), Phase 4 CSS-Refactoring. (P3 Lions-Export & P4 Benachrichtigungs-Präferenzen erledigt; echtes Lions-Wiesbaden-Zielformat ggf. später aufmappen.)

**Offen (echtes Go-live):** M5/M6 **scharfstellen** (Go-live-Schalter, siehe `MEILENSTEINE.md`: alle aktiven Mitglieder `notifications_enabled=true`, `REMINDERS_ARMED=true` + VAPID-Private/SMTP-Secrets, pg_cron+pg_net) · **Supabase Pro-Plan** (Free pausiert nach 7 Tagen) + **OAuth2-Mailversand** (statt App-Passwort).

**Abweichungen von den Quelldokumenten (bewusst beschlossen):** M3 erfasst **keine Spendenbeträge** (nur an-/abwesend; Schatzmeister rechnet jährlich extern, Export CSV). Sekretär hat zusätzlich `manage_roles` + `delete_member`. Region ist **eu-west-1 (Irland)**, nicht Frankfurt.
