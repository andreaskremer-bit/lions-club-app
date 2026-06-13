# Handoff an Claude Code – Clubverwaltungs-App Lions Club Bonn-Rheinaue

**Ziel:** Eine mobile-first **PWA** zur Clubverwaltung bauen, die die Avareto-LionsApp ersetzt.
**Stack (verbindlich):** **SvelteKit** (TypeScript) · **Supabase** (Region EU/Frankfurt: Postgres, Auth, RLS, Storage, Edge Functions/pg_cron) · Hosting **Netlify** (`adapter-netlify`) · PWA (`vite-plugin-pwa`).

## Quelldokumente in diesem Repo (in dieser Reihenfolge lesen)

1. `IMPLEMENTIERUNGSPLAN.md` — **die Bauanleitung**: Architektur, Datenmodell, RLS, Auth, Module, Meilensteine M0–M6, Risiken.
2. `SPEZIFIKATION.md` (v1.8) — **was** die App können muss: Rollen/Rechte, Veranstaltungstypen + Regeln, Abwesenheits-Spenden, Datenmodell, DSGVO.
3. `design-referenz/` — **wie es aussieht**: enthält ein vollständiges Design-System inkl. `SKILL.md` + `readme.md`, `tokens/*.css`, `styles.css`, `components/` (React + je `.prompt.md`-Spezifikation), `foundations/`, `assets/`, sowie `…- App.html` als interaktive Referenz.
4. `DESIGN-PUNCHLISTE.md` — Entscheidungs-/Änderungsprotokoll (bereits im Design umgesetzt; nur als Kontext).

## Grundregeln

- **Design-Referenz ist Vorlage, kein Drop-in-Code.** Die Komponenten in `design-referenz/components/` sind **React**. Übernimm **Tokens und CSS direkt** (`tokens/*.css`, `styles.css`) und **baue die Komponenten in Svelte nach** – nutze je Komponente die `*.prompt.md` als Spezifikation und die `*.jsx`/`*.d.ts` als Vorlage.
- **Lies `design-referenz/readme.md` und `SKILL.md` vollständig** und halte dich an Content-Regeln, Farb-/Typo-/Spacing-System und das Status-System.
- **Sprache:** UI durchgängig **Deutsch, „du"-Ansprache**, keine Emoji, Satz-/Wortschreibung, feste Status-Vokabeln (Zugesagt/Abgesagt/Offen, Anwesend/Abwesend, aktiv/inaktiv/Ehrenmitglied).
- **Barrierefreiheit:** Touch-Ziele ≥ 44 px, Grundschrift 17 px, Status nie nur über Farbe (immer Label/Wort), Metatext WCAG-AA-Kontrast auf Creme.
- **Keine Spenden-Hinweise** im Mitglieder-/Erfassungs-UI; die Geld-/Spendensicht existiert **nur** in der Schatzmeister-Auswertung.

## DSGVO (verbindlich)

- **Schriften self-hosten** (Source Serif 4 / Source Sans 3 / Source Code Pro) – **nicht** über das Google-Fonts-CDN aus `tokens/fonts.css` laden.
- Daten in **Supabase EU/Frankfurt**; Zugriff bevorzugt clientseitig mit **RLS**; keine personenbezogenen Daten in URLs/Query-Strings.
- **Logo:** der mitgelieferte Schriftzug ist ein Platzhalter; das offizielle Lions-Emblem ist markenrechtlich geschützt und wird vom Club beigestellt – **kein** Emblem ohne Freigabe einbauen.

## Reihenfolge (Meilensteine, Details im Implementierungsplan)

- **M0 Fundament:** SvelteKit+TS scaffolden, Supabase-Projekt (EU) anbinden, Tokens/CSS portieren, Fonts self-hosten, Kernkomponenten in Svelte, **E-Mail-OTP-Auth** (6-stelliger Code).
- **M1 Mitglieder:** Verzeichnis, Profil/Partner-Selbstpflege, Ämter/Rollen + **RLS-Policies** (mit Tests).
- **M2 Termine:** Übersicht (Anstehend/Vergangen, Status + Zähler, antippbar → Meldungen-Sheet), Detail (Zusagen/Absagen immer sichtbar – blau/clay), Begleitperson.
- **M3 Anwesenheit & Finanzen:** Anwesenheitserfassung (Vorstand), Abwesenheits-Spenden (konfigurierbarer Satz aus `setting`), Schatzmeister-Auswertung + **PDF/CSV-Export**.
- **M4 Abfragen & Admin:** flexible Abfrage-Engine **pro Person inkl. Begleitperson**, Admin-Jahresplanung (Massenpflege/Serientermine, antippbare Zähler).
- **M5 Engagement:** Web-Push + E-Mail-Reminder (Default 3 Tage; Supabase pg_cron/Edge Function), Geburtstage automatisch, PWA (Manifest/Service Worker/Offline-Shell).
- **M6 Rest & Launch:** Dokumente, News, Galerie-Link (Google-Share), Feinschliff, Tests (Vitest/Playwright), Deployment (Netlify + Supabase EU).
- **Phase 2 (später):** eigenständiger Umfrage-Bereich auf derselben Abfrage-Engine.

## Lieferform je Meilenstein

Versionierte DB-Migrationen, RLS-Policies **mit Tests**, sauber getrennte Komponenten, kurze Notiz „erledigt / offen" am Ende jedes Meilensteins.

## Bekannte Risiken (früh adressieren)

- iOS-Web-Push nur für **installierte PWAs (ab iOS 16.4)** → E-Mail-Fallback wichtig.
- Geplante Reminder brauchen zuverlässige Cron-Infrastruktur (Supabase) → früh verifizieren.
- PDF-Erzeugung: Ansatz in M3 festlegen (Client-Lib vs. serverseitig).
