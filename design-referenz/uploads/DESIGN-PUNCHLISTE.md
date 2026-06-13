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

### Bereits stimmig (nur zur Bestätigung – nicht ändern)
Login + OTP-Eingabe · Bottom-Navigation · „Mehr"-Hub mit Vorstand-Bereich · Galerie → Google-Share (Extern-Icon) · Schatzmeister-Auswertung mit konfigurierbarem Satz, Zählung je Mitglied, PDF/CSV-Export und Hinweis „Buchung extern" · Lions-2.0-Look (Creme, Serif, Blau/Gold/Clay).
