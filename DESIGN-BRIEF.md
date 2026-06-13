# Design-Brief – Clubverwaltungs-App Lions Club Bonn-Rheinaue

**Zweck:** Startgrundlage für den Design-Prozess in **Claude Design**. Abschnitte können direkt als Prompt-Kontext eingefügt werden.
**Basis:** SPEZIFIKATION.md v1.2 · **Stand:** 13.06.2026
**Design-Richtung:** bestätigt — „Lions 2.0": warm-reduziert in Anthropic-Anmutung, Lions-Farben modern interpretiert, lesbarkeitsoptimiert (visueller Anker: abgestimmtes Konzept der Terminübersicht).

---

## 1. Zielnutzer & Kontext

- **34 Mitglieder**, gemischtes Alter — von technikaffin bis zurückhaltend.
- **Nutzung 90 % mobil**, 10 % Desktop (v. a. Vorstand für die Jahresplanung).
- Ehrenamtlich betrieben: Bedienung muss **selbsterklärend** sein, ohne Schulung.
- Ablösung der Avareto-LionsApp — vertraute Grundfunktionen, aber komfortabler.

## 2. Designprinzipien

1. **Mobile-first & PWA-tauglich** — Daumen-Bedienung, klare Bottom-Navigation, installierbar.
2. **Barrierearm** — hoher Kontrast, große Touch-Ziele (min. 44 px), gut lesbare Schriftgrößen, keine reine Farbcodierung.
3. **Klarheit vor Funktionsfülle** — wenige Schritte je Aufgabe; die häufigste Aktion (An-/Abmelden) immer max. 1–2 Taps entfernt.
4. **Seriös & vertrauenswürdig** — ruhiges, aufgeräumtes Layout (es geht um persönliche Mitgliederdaten).
5. **Konsistenz** — wiederkehrende Komponenten und Muster über alle Screens.
6. **Warm-reduzierte Eleganz** — ruhige Creme-Flächen, Serifen-Headlines, viel Weißraum, disziplinierte Farbpalette; inspiriert vom Anthropic/Claude-Stil, aber bewusst lesbarkeitsoptimiert.

## 3. Design-System – „Lions 2.0" (bestätigte Richtung)

> Warm-reduziert im Anthropic-Stil, Lions-Farben modern interpretiert, lesbarkeitsoptimiert. **Hex-Werte sind Näherungen aus dem abgestimmten Konzept** und final feinzujustieren (auch gegen das offizielle Lions-Markenhandbuch).

- **Farben:**
  - Grundfläche: **warmes Creme** ≈ `#F6F1E7` (statt Reinweiß) — Quelle der „Wärme".
  - Flächen/Karten: ≈ `#FCFAF4`, abgegrenzt durch **Haarlinien** ≈ `#E4DCCB` (keine Schatten, keine schweren Karten).
  - Text: warmes Near-Black ≈ `#211E18`; sekundär ≈ `#6E675A` (kräftiger Kontrast — kein blasses Hellgrau).
  - **Primär/Aktion:** modernisiertes **Lions-Blau** ≈ `#1E4FA3` (Buttons, aktive Zustände, Links).
  - **Akzent:** **Lions-Gold** ≈ `#B98A22`, sparsam (Badges, „angemeldet"-Status, Highlights).
  - Sanfte Hinweise/Warnungen: **Clay/Rot** ≈ `#B4502F` mit hellem Hintergrund.
  - **Light Mode als Standard**; Dark Mode optional später.
- **Typografie:** **Serifen-Display nur für Headlines** (final feinere Serife als Georgia testen, z. B. Source Serif / Fraunces); **klare Sans für Inhalte/Bedienung** (Grundgröße ≈ 16–18 px); **Mono sparsam** für Uhrzeiten/Datum und kurze Versal-Labels. Durchgängig **höherer Kontrast und größere Schrift als das editoriale Vorbild**.
- **Komponenten:** ruhige Karten mit Haarlinie statt Schatten; Status-Badges (angemeldet/offen/abgemeldet); Listenzeilen mit Status-Kreis links + Mono-Datum rechts; sanfte Hinweiskarten mit farbigem 4-px-Randstrich; Primär-Button in Lions-Blau (≥ 44 px); Formularfelder mit deutlichen Fehlermeldungen; Bottom-Tab-Bar mit Linien-Icons, aktiver Tab in Blau.
- **Abstände:** großzügig, viel Weißraum, ruhiges Raster.

## 4. Navigation (mobil)

Bottom-Tab-Bar mit den Kernzielen, Vorstand sieht zusätzliche Bereiche:

- **Termine** (Startseite) · **Mitglieder** · **News** · **Mehr** (Dokumente, Galerie-Link, Profil/Einstellungen)
- Vorstands-/Admin-Funktionen kontextuell (z. B. „Anwesenheit erfassen" im Termin-Detail; Schatzmeister-Auswertung im Mehr-Menü).

## 5. Screen-Liste

**Kern (zuerst gestalten):**

1. **Login** — E-Mail eingeben → 6-stelligen **OTP-Code** in der App eingeben. Klar, ein Schritt pro Bildschirm.
2. **Terminübersicht (Start)** — anstehende Termine als Karten mit Datum, Typ, Ort und **eigenem Status** (angemeldet/abgemeldet/offen). Listen- & Kalenderansicht.
3. **Termin-Detail + An-/Abmeldung** — Infos, Dokumente; An-/Abmelden mit einem Tap; **Begleitperson je nach Typ**; **Zusatzabfragen** (z. B. Menü-/Gang-Auswahl) bei geselligen Terminen/Reisen.
4. **Mitgliederverzeichnis** — Suche/Filter, Karten mit Foto, Amt, Direktaktionen (Anruf/Mail).
5. **Mitgliedsprofil / Selbstpflege** — eigene Stammdaten + **Partner/in** (Name, Geburtstag, E-Mail, Handy) bearbeiten.
6. **Anwesenheitserfassung (Vorstand)** — bei Club-Abend/Mitglieder-Versammlung schnelle An-/Abwesend-Liste; löst Abwesenheits-Spende aus.
7. **Schatzmeister-Auswertung** — Abwesenheiten je Mitglied/Zeitraum, Summe zum aktuellen Satz, **Export (PDF/CSV)**.
8. **Admin-/Massenpflege** — Jahresplanung: mehrere Termine schnell anlegen (Desktop-tauglich), Mitglieder-/Rollenverwaltung.

**Sekundär:** News-Feed, Dokumentenablage, Galerie (Link aufs Google-Share), Benachrichtigungseinstellungen.

## 6. Kernflüsse zum Durchklicken

- **Anmelden zu Termin:** Login → Terminübersicht → Termin → „Anmelden" (+ ggf. Begleitperson/Menü) → Bestätigung.
- **Anwesenheit + Spende:** Vorstand → Termin → „Anwesenheit erfassen" → Liste abhaken → Abwesenheiten erzeugen Spendenpositionen.
- **Selbstpflege:** Profil → Daten/Partner bearbeiten → speichern.
- **Auswertung:** Schatzmeister → Auswertung → Zeitraum wählen → Export.

## 7. Nicht-Ziele (nicht gestalten)

Kein Chat-/Messenger, keine Zahlungsabwicklung, kein Magazine-Modul, keine eigene In-App-Fotogalerie (vorerst nur Link).

## 8. Technischer Handoff-Kontext

Produktion = **SvelteKit + Supabase (EU)**. Der Claude-Design-Prototyp dient als **visuelle und Komponenten-Vorlage** und wird anschließend in SvelteKit umgesetzt — kein Drop-in-Code. Beim Einlesen von Stilen kann optional die bestehende Lions-Adventskalender-Site als Referenz dienen.

## 9. Beispiel-Prompts für Claude Design

- „Erstelle ein mobiles Design-System für eine Vereins-Verwaltungs-App im warm-reduzierten Stil: Grundfläche warmes Creme (≈ #F6F1E7), Lions-Blau (≈ #1E4FA3) als Aktionsfarbe, Lions-Gold (≈ #B98A22) als sparsamer Akzent, Clay-Rot für sanfte Hinweise; Serifen-Headlines + klare Sans für Inhalte; hoher Kontrast, Grundschrift ≥ 16 px, Touch-Ziele ≥ 44 px, Haarlinien statt Schatten. Liefere Farben, Typografie und Komponenten (Buttons, Karten, Status-Badges, Listenzeilen, Tab-Bar)."
- „Gestalte die Startseite ‚Terminübersicht' als Karten-Liste: je Termin Datum, Typ-Badge, Ort und mein Anmeldestatus. Oben Umschalter Liste/Kalender, unten Tab-Navigation (Termine, Mitglieder, News, Mehr)."
- „Gestalte den Screen ‚Termin-Detail' mit An-/Abmelde-Button, optionaler Begleitperson und einer Menü-Auswahl (Vorspeise/Hauptgang/Dessert) für gesellige Termine."
- „Gestalte ‚Anwesenheit erfassen' für den Vorstand: schnelle Abhak-Liste aller aktiven Mitglieder mit Anwesend/Abwesend-Schalter und Hinweis, dass Abwesenheit eine Spende auslöst."
