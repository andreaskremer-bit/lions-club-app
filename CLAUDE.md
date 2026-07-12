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
- `src/lib/components/ui/` — UI-Primitive (Button, IconButton, Card, Avatar, Tag, StatusBadge, Input, Select, Checkbox, Switch, HintCard, OtpInput, SegmentedControl, ListRow, TabBar, AppBar), Barrel `index.ts`. Komposite in `src/lib/components/` (`EventCard`, `NewsCard` — von Termine/News **und** Startseite genutzt; `AnswerField`).
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
- **DB (Remote/Produktion, nativer psql):** `npm run db:remote` (interaktive Konsole) bzw. `npm run db:remote -- -c "select …"` / `-- -f datei.sql`. Helfer `scripts/db-remote.sh` verbindet via Pooler `aws-0-eu-west-1.pooler.supabase.com:5432` (Ref aus `.env`, Passwort aus `.env.local`). Voraussetzung: `psql` via Homebrew `libpq` (`/opt/homebrew/opt/libpq/bin`, in `~/.zprofile`). **Ersetzt den früheren docker-psql-Umweg.**
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

Siehe persistentes Memory (`milestone-status`). Kurz (Stand 2026-06-20):

**M0–M6 + P1 + P2 + P2.1 + P3 + P4 + Design „Lions 2.0" KOMPLETT (Phasen 1–5: Bottom-Nav/IA + Branding/Emblem + Komponenten + WCAG-Politur + Shell-Refactoring + Listen-Screen-Feinschliff mockup-treu + Review-Korrekturen: alle Tab-Wurzeln große AppBar, geteilte EventCard/NewsCard auch auf Start, Mehr-Unterseiten Zurück→Mehr) vollständig & LIVE (M6: Dokumente, News, Galerie-Link; Versand NICHT scharfgestellt — Geheim-Phase), Prototyp LIVE.**

- **Live:** `https://app.lions-bonn-rheinaue.de` (Netlify, Club-Account, Auto-Deploy bei Push). OTP-Login über Club-Gmail-SMTP verifiziert; als PWA aufs iPhone installierbar.
- **Public-ready (Stand `44671d0`):** Security-Audit bestanden (alle Tabellen RLS, `service_role` nur serverseitig, nie `.env`/JWT committet); Entwickler-E-Mail aus der GESAMTEN Git-Historie gescrubbt (git-filter-repo, Force-Push, 0 Treffer in Inhalt+Metadaten); `.gitignore` gehärtet (`!.env.test` raus). `npm audit`: 6 Restbefunde (esbuild/cookie) sind reine **Build-Zeit-Deps von `adapter-netlify`** (nicht im PWA-Bundle), `adapter-netlify` bereits neueste 6.0.4 → kein sauberer Forward-Fix, `--force` würde den Netlify-Build brechen → bewusst NICHT angewendet. **Lokales Backup `…-backup-vor-history-rewrite` enthält noch die alte E-Mail → der Club/Nutzer muss es löschen.**
- **Remote-Projekt** `qfxtyqippdrcrhwbkhwx` (EU/Irland): Migrationen bis `20260621120600` (`lions_member_no`, `service_role`-Grant auf `member`, `amt.abbr`-Kürzel) via `supabase db push` angewendet; Edge Functions `extract-document-text` + `send-notifications` deployed; Bootstrap-Admin (Andreas) = Präsident + Webmaster; remote nur dieser eine Account `notifications_enabled=true`. **E-Mail-Login-Sync in Produktion verifiziert** (eigene Adresse über die App geändert → `member`+`auth.users` synchron, Neu-Login per OTP klappt).
- **Echte Produktivdaten (2026-06-19):** Mitglieder-Roster aus dem alten LionsApp-CSV importiert → **35 Mitglieder** (25 mit Lions-Nr, 24 Profilbilder im Bucket `member-photos`); **9 Veranstaltungen** fürs Lions-Jahr 2026/27 aus Screenshots angelegt (6× Clubabend, 1× MV, 2× gesellig). Werkzeuge: `scripts/import-members.mjs` (idempotent, Dry-Run-Default, E-Mail-Abgleich, Foto-Download) + Direkt-SQL damals über **docker-psql gegen Remote** (lokaler `supabase_db`-Container → Pooler, da Host kein `psql` hatte; **seit 2026-06-26 ersetzt durch nativen `psql`/`npm run db:remote`**, siehe Befehle). Insert-Recht für `service_role` war dabei nur **temporär** vergeben + wieder revoked (Least Privilege).
- **Umgesetzt:** Auth · Mitglieder (+Admin, volle Adresse, `phone_office`, Partner-Vor/Nachname, `lions_member_no`/Lions-Mitgliedsnummer — nur `edit_member_master` änderbar; E-Mail auch im Bearbeiten editierbar + Login-Sync `auth.users`↔`member` via `PATCH /api/mitglieder/[id]/email`; Verzeichnis-Liste in Telefonbuch-Optik: „Nachname, Vorname" (deckt sich mit DB-Sortierung `last_name`), akad. Titel nur auf der Profilseite, Buchstaben-Gruppen mit dezentem nicht-klebendem Divider (bei Suche aus), Status „Mitglied (inaktiv)"/„Ehrenmitglied" und ALLE Ämter als geschlechtsneutrale Kürzel `amt.abbr` z. B. „P · WEB", volle Namen auf `/vorstand`/Suche/Hover; Avatar-Initialen Vorname-Nachname) · Termine (Liste+Kalender, RSVP, Begleitpersonen + Partner-Schalter, `speaker`/Referent, Meldungen, Jahresplanung/Serien, `reminder_days_before`, Bearbeiten/Löschen, `ends_at`+2h-Default, .ics-Export) · Startseite (Karten: nächster Termin + neueste News) · Anwesenheit + Schatzmeister-Auswertung (CSV) · Zusatzabfragen · Geburtstage · Foto-Upload · In-App-Benachrichtigungen + Reminder-Engine · Web-Push + Edge Function `send-notifications` (Push + SMTP-Fallback, Dry-Run-gated) + Empfänger-Gate `notifications_enabled` + Versandkanal-Präferenz `notification_channel` (push/email/both, kein Voll-Opt-out) · **Dokumente (`/dokumente`: Ablage + deutsche Volltextsuche via Edge Function `extract-document-text`, Kategorien/Sortierung, Upload/Bearbeiten, Push-Benachrichtigung)** · **News (`/news`: Feed, Klartext+Linkify, Anpinnen, Push-Benachrichtigung)** · **Galerie (`/galerie`: aktuell Link aufs geteilte Google-Drive via `PUBLIC_GALLERY_URL`; Umbau auf Supabase-Storage-Viewer AUF HOLD → Konzept `docs/galerie-konzept.md`)** · **Vorstand/Ämter (`/vorstand`, `manage_roles`): Lions-Jahr-Dimension (1.7.–30.6., Auto-Umstellung ohne Cron), zeitabhängige `has_permission`, Ämter-Cluster + display_only-Beauftragte, abgeleiteter Past-Präsident, Vereinslokal-Default für Clubabend/MV)** · **Lions-Export (`/mitglieder/export`, `export_lions`: Mitglieder-CSV inkl. inaktive, Excel-tauglich, ohne Partner-/Notizfelder; Helfer `src/lib/lionsExport.ts`)**.
- **Tests:** 87 pgTAP + 31 Vitest-Unit + 2 Playwright-E2E.
- **LJ-Rechte-Lehre (P2):** Bei zeitabhängigen Ämtern MÜSSEN alle Rechte-Leser denselben LJ-Filter wie `has_permission` nutzen — Client-`+layout.ts` UND `/api`-Routen auf `.eq('member_amt.lions_year', lionsStartYear(new Date()))`. Sonst bietet die UI LJ-fremde Aktionen an (RLS blockt zwar, aber Gate ist falsch).
- **Push-Reihenfolge (P2-Lehre):** Root-Layout fragt `member_amt.lions_year` auf JEDER Seite ab → bei schema-relevanten Migrationen **immer `supabase db push` ZUERST, dann `git push`**.
- **`service_role`-Grant-Falle:** Edge Functions laufen als `service_role` — RLS-Bypass ersetzt NICHT die Tabellen-Grants. Bei neuen Tabellen, die eine Edge Function direkt liest/schreibt, immer auch `grant … to service_role` (sonst `permission denied 42501`).
- **Git-Identität / History-Rewrite (2026-06-21):** Commit-Identität ist jetzt `Webmaster Lions Club Bonn-Rheinaue <webmaster@lions-bonn-rheinaue.de>` (global + repo-lokal). Die GESAMTE History wurde an diesem Tag erneut umgeschrieben (alle Commits auf die Webmaster-Identität) + Force-Push → **alle weiter oben genannten Commit-Hashes sind historische Referenzen und nach dem Rewrite nicht mehr auflösbar.**

**Backlog:** **Design „Lions 2.0" Phasen 1–5 KOMPLETT** (Bottom-Nav/IA + `/mehr`-Hub · echtes Lions-Emblem + gebrandete PWA-Icons · Komponenten Select/Checkbox/Switch/HintCard · WCAG-AA-Gold `--gold-700`=#856010 · zentrale App-Shell, −301 Zeilen Duplizierung). P3 Lions-Export & P4 Benachrichtigungs-Präferenzen erledigt. **Nur noch Kleinkram offen:** echtes Lions-Wiesbaden-Exportformat aufmappen (wenn Spaltenvorgabe vorliegt; Mapping isoliert in `src/lib/lionsExport.ts`) · Typ-Zuordnung der 9 neu angelegten Veranstaltungen vom Club gegenchecken (donation_required-relevant; v. a. ob die Adenauer-Führung spendenpflichtig sein soll) — in der App änderbar.

**Offen (echtes Go-live, Ziel = FREE-Plan):** M5/M6 **scharfstellen** (Go-live-Schalter, siehe `MEILENSTEINE.md`: alle aktiven Mitglieder `notifications_enabled=true`, `REMINDERS_ARMED=true` + VAPID-Private/SMTP-Secrets, `pg_cron`+`pg_net`) · **OAuth2-Mailversand** (statt App-Passwort). **KeepAlive (Free-7-Tage-Pause):** belastbar via RPC `public.keepalive()` + tägliche GitHub Action (`POST /rest/v1/rpc/keepalive`); Repo-Secret `SUPABASE_ANON_KEY` MUSS der aktuelle `sb_publishable_…`-Key sein (alter Legacy-JWT → 401). Pro-Plan nur, falls der Club ihn später doch will (war meine Annahme, nicht die Vorgabe).

**Abweichungen von den Quelldokumenten (bewusst beschlossen):** M3 erfasst **keine Spendenbeträge** (nur an-/abwesend; Schatzmeister rechnet jährlich extern, Export CSV). Sekretär hat zusätzlich `manage_roles` + `delete_member`. Region ist **eu-west-1 (Irland)**, nicht Frankfurt.
