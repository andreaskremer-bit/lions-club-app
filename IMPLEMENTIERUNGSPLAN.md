# Implementierungsplan – Clubverwaltungs-App Lions Club Bonn-Rheinaue

**Status:** v0.1 (Entwurf) · **Stand:** 14.06.2026 · **Verantwortlich:** Andreas Kremer
**Grundlagen:** SPEZIFIKATION.md v1.8 · DESIGN-BRIEF.md · DESIGN-PUNCHLISTE.md · Claude-Design-Prototyp („Lions 2.0")
**Entscheidung:** **SvelteKit + Supabase**; das Claude-Design dient als **visuelle Referenz** (Tokens/Komponenten), nicht als Drop-in-Code.

---

## 1. Stack & Architektur

| Schicht       | Wahl                                                                                    | Hinweis                                                |
| ------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Frontend/App  | **SvelteKit** (SSR + SPA-Hybrid), TypeScript                                            | PWA-tauglich, app-orientiert                           |
| UI/Styling    | CSS-Variablen aus „Lions 2.0", Komponentenbibliothek selbst                             | keine schweren UI-Frameworks nötig                     |
| Backend/DB    | **Supabase (Region EU/Frankfurt)** – Postgres, Auth, RLS, Storage, Edge Functions       | AV-Vertrag/DPA abschließen                             |
| Auth          | Supabase Auth – **E-Mail-OTP (6-stelliger Code)**                                       | kein Magic-Link, kein SMS                              |
| Hosting       | **Netlify** (`adapter-netlify`), DPF-zertifiziert                                       | Frontend; personenbez. Daten möglichst client→Supabase |
| Push/Reminder | Web-Push (VAPID) + E-Mail-Fallback; geplante Jobs via Supabase (pg_cron/Edge Functions) | siehe §8                                               |
| PWA           | `vite-plugin-pwa` (Manifest, Service Worker, Offline-Shell)                             | installierbar                                          |

**Architekturprinzip DSGVO:** Datenzugriff bevorzugt **clientseitig direkt gegen Supabase (EU)** mit RLS; SSR-Routen, die personenbezogene Daten über Netlify leiten, sparsam halten.

## 2. Projekt-Setup / Dev-Umgebung

- Repo (Git) anlegen; SvelteKit-Skeleton (`npm create svelte`), TypeScript, ESLint + Prettier.
- Supabase-Projekt in **Frankfurt** anlegen; `.env` mit URL + anon key (Service-Key nur serverseitig/CI).
- `@supabase/supabase-js` + `@supabase/ssr` für Session-Handling.
- `adapter-netlify`, `vite-plugin-pwa`.
- Schriftarten **Source Serif 4 / Source Sans 3 / Source Code Pro** self-hosten (DSGVO – keine Google-Fonts-CDN).
- Tests: Vitest (Unit) + Playwright (E2E der Kernflüsse).
- DB-Migrationen versioniert (Supabase CLI), Seed-Daten für Entwicklung.

## 3. Design-System in Code

Aus dem Claude-Design übernehmen (framework-neutral):

- **Tokens:** Farben (Creme `#F6F1E7`, Ink, Lions-Blau `#1E4FA3`, Gold `#B98A22`, Clay `#B4502F`, Status-Semantik), Typo-Skala, Spacing, Radii, Haarlinien – als CSS-Custom-Properties (exakte Werte aus dem Design-System / Lions-Markenhandbuch final ziehen).
- **Status-Semantik:** Zugesagt = Gold, Abgesagt = Clay, Offen = Neutral, Anwesend = Sage – als wiederverwendbare Badge/Token.
- **Komponenten (Svelte):** Button (Primary/Secondary/Ghost/Danger, Größen), IconButton, Card, StatusBadge, TypeBadge, ListRow (Avatar + Direktaktionen), SegmentedControl (Liste/Kalender, Anstehend/Vergangen, Zusagen/Absagen), CountStat (antippbar), MeldungenSheet, **QuestionField** (Einfach-/Mehrfachauswahl, Freitext, Ja/Nein, Zahl), BottomNav.

## 4. Datenmodell (Supabase / Postgres)

Kern-Tabellen (Details/Constraints in Migrationen):

- **member** – Person, Kontakt, Foto, **status** (`aktiv|inaktiv|ehrenmitglied`), Beitrittsdatum, Geburtstag; **Partner/in** (Name, Geburtstag, E-Mail, Handy); Verknüpfung zu `auth.users`.
- **amt / member_amt** – Ämter mit Rechten (Präsident, Vize, Sekretär, Schatzmeister, Clubmaster, Webmaster/IT) + reine Anzeige-Titel (Past-Präsident, Activity-Beauftragter …).
- **event** – Titel (Programm/Thema), **typ** (`clubabend|versammlung|reise|gesellig|lions_termin`), Ort, Beginn, Beschreibung; abgeleitet aus Typ: Begleitperson erlaubt?, spendenpflichtig?.
- **event_response** – je Mitglied: `zugesagt|abgesagt|offen`, Zeitpunkt, Kommentar.
- **companion** – Begleitperson als Sub-Eintrag einer `event_response` (für personenbezogene Abfragen je Begleitung).
- **attendance** – je spendenpflichtigem Termin: anwesend/abwesend je aktivem Mitglied.
- **donation_entry** – Abwesenheits-Spende, abgeleitet aus `attendance`; Betrag aus `setting`.
- **question / answer** – flexible Abfrage (Fragetyp + Optionen) je Termin; **Antwort pro Person** (member oder companion). Wiederverwendbar für Umfragen (Phase 2).
- **document**, **news_post**, **photo** (Link/Verweis aufs Google-Share), **notification**, **setting** (Spendenbetrag, Reminder-Vorlauf …).

## 5. Authentifizierung (E-Mail-OTP)

- Supabase `signInWithOtp` (E-Mail); E-Mail-Template auf **6-stelligen Code** (`{{ .Token }}`) statt Link.
- App-Screens: E-Mail → Code-Eingabe (6 Felder) → Session.
- Mapping `auth.users` ↔ `member`; nur eingeladene/angelegte Mitglieder erhalten Zugriff (kein Self-Signup).
- Admin-Weg für Adresswechsel/Neueinladung (Sekretär/Webmaster).

## 6. Rollen & Row-Level-Security

- **Basis (Mitglied):** eigene Daten + Partner pflegen; Verzeichnis lesen; An-/Abmelden; News/Dokumente/Galerie lesen.
- **Ämter** addieren Rechte gemäß Matrix (Spec §3): Termine verwalten, Listen/Anwesenheit, Anwesenheit erfassen (Präsident/Vize/Sekretär), Spenden-Auswertung (Schatzmeister), Neumitglieder + Lions-Export (Sekretär), System/Admin (Webmaster/IT).
- Umsetzung als **RLS-Policies pro Tabelle** (Lesen/Schreiben), plus serverseitige Checks für sensible Aktionen. Tests je Policy.

## 7. Module / Screens (Design als Referenz)

Mapping Prototyp → Umsetzung: Login+OTP · Terminübersicht (Anstehend/Vergangen, Status+Zähler, antippbar→Meldungen-Sheet) · Termin-Detail (Zusagen/Absagen, Begleitperson, Abfragen pro Person, Meldungen) · Mitgliederverzeichnis + Profil/Partner · Anwesenheit erfassen (Vorstand) · Schatzmeister-Auswertung (konfigurierbarer Satz, Zählung, **PDF/CSV-Export**, „Buchung extern") · Admin-Jahresplanung (Massenpflege/Serientermine, antippbare Zähler) · Mehr-Hub · Dokumente · Galerie (Link Google-Share) · Geburtstage · Benachrichtigungen.

**Wichtig:** Keine Spenden-Hinweise im Mitglieder-/Erfassungs-UI; Geldsicht nur beim Schatzmeister.

## 8. Benachrichtigungen & Reminder

- **Web-Push** (Service Worker, VAPID-Keys) + **E-Mail-Fallback**.
- **Automatik:** Reminder **3 Tage** vor Termin an Nicht-Rückmelder (Default konfigurierbar); Vorstand-Erinnerung zur Anwesenheitserfassung; **Geburtstage automatisch an alle**.
- Zeitsteuerung über **Supabase pg_cron / Scheduled Edge Function** (täglicher Lauf, prüft fällige Reminder).

## 9. PWA

- Web-App-Manifest, Icons, Theme-Color (Lions 2.0), Offline-Shell, „installieren"-Hinweis.
- Architektur so, dass ein späterer nativer Store-Wrapper möglich bleibt (nicht jetzt bauen).

## 10. DSGVO (Architekturtreiber)

- Datenhaltung Supabase **Frankfurt** + **AV-Vertrag**; Netlify **DPF** + AVV.
- RLS als technische Zugriffskontrolle; **Löschkonzept** (ausgeschiedene Mitglieder werden gelöscht); Foto-Einwilligung einfach (clubinterne Galerie).
- **Verarbeitungsverzeichnis** inkl. Lions-Deutschland-Meldung (Inland/EU, kein Drittland) und Datenschutzerklärung der App.

## 11. Export

- **CSV** (Teilnehmer-/Spendenlisten, Lions-Meldung) – trivial serverseitig.
- **PDF** (Aushang/Druck) – via JS-Bibliothek (z. B. pdfmake) oder serverseitig; Format an Lions 2.0 angelehnt.

## 12. Meilensteine (Reihenfolge)

- **M0 – Fundament:** Setup, Design-System in Code, Auth (E-Mail-OTP).
- **M1 – Mitglieder:** Verzeichnis, Profil/Partner-Selbstpflege, Ämter/Rollen + RLS.
- **M2 – Termine:** Übersicht (Anstehend/Vergangen, Status+Zähler), Detail, An-/Abmeldung, Meldungen-Sheet.
- **M3 – Anwesenheit & Finanzen:** Anwesenheitserfassung, Abwesenheits-Spenden, Schatzmeister-Auswertung + Export.
- **M4 – Abfragen & Admin:** Zusatzabfragen pro Person, Admin-Jahresplanung (Massenpflege/Serien).
- **M5 – Engagement:** Benachrichtigungen/Reminder-Automatik, PWA, Geburtstage.
- **M6 – Rest & Launch:** Dokumente, News, Galerie-Link, Feinschliff, Tests, Deployment (Netlify + Supabase EU).
- **Phase 2:** eigenständiger Umfrage-Bereich (gleiche Abfrage-Engine).

## 13. Handoff an Claude Code

An Claude Code übergeben: **dieser Plan + SPEZIFIKATION.md + DESIGN-PUNCHLISTE.md + Design-Export** (HTML/Screens als visuelle Referenz, Tokens/CSS). Auftrag: **SvelteKit + Supabase scaffolden**, Meilensteine M0→M6 abarbeiten, Design als **Referenz** umsetzen (nicht den React-Code übernehmen), Migrationen + RLS-Tests mitliefern.

## 14. Offene technische Punkte / Risiken

- **iOS-Web-Push** funktioniert nur für **installierte PWAs (ab iOS 16.4)** – Mitglieder müssen die App zum Homescreen hinzufügen; E-Mail-Fallback wichtig.
- **Geplante Reminder** brauchen eine zuverlässige Cron-Infrastruktur (Supabase pg_cron/Edge Functions) – früh testen.
- **PDF-Erzeugung**: Ansatz (Client-Lib vs. serverseitig) in M3 festlegen.
- **Begleitperson-Identität**: als Sub-Eintrag ohne eigenes Konto – Modell für personenbezogene Abfragen bestätigen.
- **Supabase/Netlify als US-Unternehmen** (EU-Hosting + DPF/AVV): bewusst akzeptiert; im Verarbeitungsverzeichnis dokumentieren.
