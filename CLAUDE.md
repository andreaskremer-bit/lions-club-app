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
- **Supabase** (Region **EU/Frankfurt**): Postgres, Auth, RLS, Storage, Edge Functions/pg_cron. Zugriff bevorzugt **clientseitig mit RLS**.
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
- Daten in Supabase **EU/Frankfurt**; **RLS** als technische Zugriffskontrolle; keine personenbezogenen Daten in URLs/Query-Strings.
- **Logo:** offizielles Lions-Emblem ist markenrechtlich geschützt → ohne Club-Freigabe **nicht** einbauen. Aktuell „LC"-Monogramm als Platzhalter (`static/icons/monogram.svg`).

## Befehle

- `npm run dev` (Standard-Port 5173) · `npm run build` · `npm run check` (svelte-check) · `npm run lint` · `npm run format`.
- Vor Commit: `npm run check` **und** `npm run lint` müssen grün sein. `design-referenz/` ist aus Lint/Format ausgenommen.

## Lieferform je Meilenstein

Versionierte DB-Migrationen, **RLS-Policies mit Tests**, sauber getrennte Komponenten, „erledigt/offen"-Notiz in `MEILENSTEINE.md`.

## Env / Secrets

- `.env` (git-ignoriert): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` (neues Key-System: `sb_publishable_…`, client-sicher mit RLS).
- `.env.local` (git-ignoriert): DB-Passwort u. ä. — nie committen, nie ins Memory.
- Supabase Secret key (`sb_secret_…`) niemals in den Client.

## Aktueller Stand

Siehe persistentes Memory (`milestone-status`, `email-smtp-club-domain`). Kurz: **M0-Code fertig**, einziger offener Punkt ist der **OTP-Mailversand über Gmail-SMTP** (HTTP 500, vermutlich App-Passwort am falschen Google-Konto). **M1 (Mitglieder + Migrationen + RLS) ist als Nächstes dran.**
