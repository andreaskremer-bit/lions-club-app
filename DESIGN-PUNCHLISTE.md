# Design-Punchliste – Claude Design (Lions Club Bonn-Rheinaue App)

**Zweck:** Änderungswünsche aus dem Review des Prototyps. In Claude Design einfügen und über das gesamte Design-System + alle Screens anwenden.
**Basis:** SPEZIFIKATION.md v1.3 · DESIGN-BRIEF.md (Lions 2.0) · **Stand:** 13.06.2026

> Bitte die Änderungen konsistent über Design-System und alle betroffenen Screens ziehen.

## A · Inhaltliche Korrekturen (Fachlogik)

1. **Spenden-Hinweis überall entfernen.** Die Clay-Karte „Spendenpflichtiger Termin" (Termin-Detail) und der Hinweis „… erzeugen je eine Spendenposition" (Anwesenheit erfassen) **raus**. Begründung: Die Mitglieder kennen die Regel; der Hinweis verunsichert nur. Erfasst werden schlicht An-/Abwesenheiten. Die Spenden-/Geldsicht bleibt **ausschließlich in der Schatzmeister-Auswertung**.

2. **Termintitel = Programm/Thema, nicht der Typ.** Beispiel-Titel ändern, z. B. „Thalia Buchhandlung – gestern, heute, morgen" als Titel, „Club-Abend" nur als **Typ-Badge**. Kein „Club-Abend Juni" als Titel mehr.

## B · Terminübersicht – Status sofort sichtbar (Vorbild Avareto)

3. Auf jeder **Termin-Karte in der Liste** direkt anzeigen:
   - **eigener Status** als Label-Badge (Zugesagt / Abgesagt / Offen),
   - **aggregierte Rückmeldezahlen**: ✓ angemeldet · ✗ abgemeldet · ? offen.
   - In **Lions-2.0-Semantik** (Gold = angemeldet, Clay = abgemeldet, Neutral = offen) – **nicht** in Avareto-Grün/Rot/Gelb. Ersetzt den bisherigen reinen Farbpunkt.

## C · UX & Lesbarkeit

4. **Logout umbenennen:** im Profil „Abmelden" → **„Ausloggen"**. Das Termin-„Abmelden" (Teilnahme absagen) bleibt.

5. **Datums-Chip lesbar machen:** „1206." liest sich wie eine Zahl → **„12.06."** bzw. „12. Juni".

6. **Kontrast-Durchlauf (WCAG AA):** helle Mono-Eyebrows und Metatexte auf Creme sind grenzwertig; Kontrast/Größe anheben (Zielgruppe gemischten Alters).

## D · Screens prüfen / ergänzen

7. **„Termine verwalten · Jahresplanung (Admin)"** – Screen bauen bzw. verlinken (öffnete im Prototyp nicht).

8. **Termin-Detail-Variante für Reise/gesellig** mit **Zusatzabfrage** (z. B. Zimmerwunsch, Menü-/Gang-Auswahl) als eigener Beispiel-Screen, um diesen Typ zu validieren.

---

## E · Nachtrag (Runde 2)

9. **Rückmeldezahlen antippbar → Mitgliederliste je Status.** Tippen auf „Zugesagt / Abgesagt / Offen" (bzw. die ✓/✗/?-Zähler) öffnet eine Liste, welches Mitglied in welcher Gruppe ist.
   - **Sowohl in der Terminübersicht** (Tap auf die Zähler der Karte) **als auch im Termin-Detail** (wie die „Meldungen"-Zeilen in Avareto: Zugesagt 21 ›, Abgesagt 3 ›, Keine Meldung 19 ›).
   - Ziel: ein gemeinsames Listen-/Sheet-Element mit Umschalter zwischen den drei Status, in Lions-2.0-Semantik.
   - **Bestätigt:** dieselben antippbaren Zähler auch in der **Admin-Jahresplanung** (Status kann sich im laufenden Prozess noch ändern).

10. **Anmelden UND Abmelden immer anbieten.** Im Termin-Detail aktuell nur ein kontextabhängiger Button (bei „Offen" nur „Anmelden"). Stattdessen **beide Aktionen sichtbar** — „Anmelden" (primär, Blau) und „Abmelden/Absagen" (sekundär) — damit Mitglieder aus „Offen" heraus aktiv absagen können und kein ungeklärter Status bestehen bleibt. Aktueller Status hervorgehoben (z. B. als Segmented Control Zusagen/Absagen).

11. **Anstehend / Vergangen.** Segment-Umschalter „Anstehend / Vergangen" (Default **Anstehend**, nächster Termin oben) statt endlosem Zurückscrollen. **Vergangene Termine schreibgeschützt** (kein An-/Abmelden), aber mit finalen Rückmeldungen + erfasster Anwesenheit (relevant für Vorstand/Schatzmeister). Kalenderansicht frei navigierbar. **Kein** Umfrage-Modul (nicht im Scope).

12. **Zusagen/Absagen optisch klar trennen.** Aktuell wirken beide CTAs als helle Ghost-Buttons. Stattdessen die vorhandenen Button-Varianten nutzen: **Zusagen = Primary (Lions-Blau, gefüllt)**, **Absagen = Danger/Clay** (passt auch semantisch zum Status „Abgesagt"). Der aktuell gewählte Status gefüllt/aktiv, die andere Option als Outline.

13. **Zusatzabfragen pro Person.** Die Termin-Abfrage (z. B. Menüauswahl) muss **für das Mitglied und jede Begleitperson separat** beantwortbar sein (aktuell gibt es nur eine Menüauswahl, die Begleitung hat keine). Flexible Antworttypen (Einfach-/Mehrfachauswahl, Freitext, Ja/Nein, Zahl). Inline am Termin; ein eigenständiger Umfrage-Bereich folgt erst in Phase 2 (gleiche Engine).

14. **Status-Badge überläuft bei langen Titeln (Layout-Bug).** Auf der Terminkarte kollidiert ein langer, zweizeiliger Titel mit dem rechtsbündigen Status-Badge; „Offen" wird am Kartenrand abgeschnitten. Fix: Badge **aus der Titelzeile lösen** – entweder eigene Zeile oben rechts oder in die untere Meta-Zeile (Typ + Zähler). Karten-Layout generell mit **langen Titeln** auf Robustheit testen (kein Überlauf/Clipping).

---

### Bereits stimmig (nur zur Bestätigung – nicht ändern)
Login + OTP-Eingabe · Bottom-Navigation · „Mehr"-Hub mit Vorstand-Bereich · Galerie → Google-Share (Extern-Icon) · Schatzmeister-Auswertung mit konfigurierbarem Satz, Zählung je Mitglied, PDF/CSV-Export und Hinweis „Buchung extern" · Lions-2.0-Look (Creme, Serif, Blau/Gold/Clay).
