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
