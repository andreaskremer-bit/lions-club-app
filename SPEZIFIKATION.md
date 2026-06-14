# Spezifikation – Clubverwaltungs-App Lions Club Bonn-Rheinaue

**Status:** v1.8 – bereit für Design-Phase · **Stand:** 13.06.2026 · **Verantwortlich:** Andreas Kremer
**Zweck:** Ablösung der Avareto-LionsApp durch eine eigene, schlanke und DSGVO-konforme Web-App (PWA).

> Dieses Dokument ist die gemeinsame Arbeitsgrundlage **vor** dem Design- und Programmierprozess. Offene Punkte sind mit `❓OFFEN` markiert und am Ende gesammelt.

---

## 1. Ziel & Kontext

Der Lions Club Bonn-Rheinaue nutzt heute die LionsApp von Avareto zur Mitglieder- und Veranstaltungsorganisation. Diese soll durch eine eigene Web-App ersetzt werden, die

- die bewährten Avareto-Kernfunktionen abbildet und im Bedienkomfort verbessert,
- den manuellen Aufwand des Vorstands weiter reduziert,
- DSGVO-konform mit Datenhaltung in der EU betrieben wird,
- langfristig durch wenige ehrenamtliche Personen wartbar bleibt.

**Clubgröße:** aktuell 34 Mitglieder.

**Abgrenzung kommerzielle Perspektive:** Sollte sich daraus später ein Mehr-Club-/Produktangebot entwickeln, wäre das ein separater Business-Case (privat, nicht des Clubs) mit eigener rechtlicher und technischer Grundlage. Die jetzige Architektur wird so gewählt, dass sie das _nicht verbaut_, aber auch _nicht vorfinanziert_.

---

## 2. Plattform & technischer Ansatz

| Aspekt             | Entscheidung                                      | Begründung                                                                                                                         |
| ------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| App-Typ            | **PWA** (installierbare Web-App)                  | 90 % mobile Nutzung; Desktop automatisch mit abgedeckt; kein App-Store-Zwang                                                       |
| Frontend           | **SvelteKit**                                     | Echtes App-Framework (SPA+SSR, Routing, Form-Actions, Auth-Hooks); technisch bester Fit für eine auth-geschützte, interaktive PWA  |
| Backend/DB         | **Supabase (Region EU/Frankfurt)**                | Postgres + Auth + Row-Level-Security + Storage; AV-Vertrag abschließen                                                             |
| Hosting Frontend   | **Netlify** (DPF-zertifiziert)                    | EU-US Data Privacy Framework + AVV als Transfergrundlage; dort liegt auch das bestehende Lions-Projekt                             |
| Benachrichtigungen | Web-Push (PWA) + E-Mail-Fallback                  | Reminder-Automatik statt Chat                                                                                                      |
| Authentifizierung  | Supabase Auth — **E-Mail-OTP (6-stelliger Code)** | Umgeht das PWA-Link-Problem (Code wird in der App eingegeben); kostenlos. SMS verworfen (Kosten, US-Subprozessor, nicht sicherer). |

**Bewusste Nicht-Entscheidung jetzt:** Native iOS/Android-App im Store. Bleibt über die PWA technisch nachrüstbar (z. B. via Wrapper), wird aber nicht gebaut.

---

## 3. Rollen & Rechte

**Ämter sind Rollen mit eigenen Rechten** (nicht nur Anzeige-Titel), technisch über Supabase Row-Level-Security durchgesetzt. Jedes Mitglied hat die Basisrechte; rechte-tragende Ämter addieren Rechte. Ämter ohne eigene Rechte (z. B. Past-Präsident, Activity-Beauftragter) erhalten nur den **Anzeige-Titel**.

**Basis – jedes Mitglied:** eigene Stammdaten + Partner pflegen; Mitgliederverzeichnis sehen; zu Terminen an-/abmelden; News, Dokumente, Galerie sehen.

**Rechte-tragende Ämter (zusätzlich zur Basis):**

| Amt                | Zusätzliche Rechte                                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Präsident**      | Voller Clubbetrieb: Termine verwalten, Teilnehmer-/Anwesenheitslisten, Anwesenheit erfassen, News/Dokumente veröffentlichen, fremde Stammdaten korrigieren, Spenden-Auswertung einsehen                                                            |
| **Vizepräsident**  | Wie Präsident (Vertretung)                                                                                                                                                                                                                         |
| **Sekretär**       | News/Dokumente/Protokolle veröffentlichen, fremde Stammdaten pflegen, Teilnehmer-/Anwesenheitslisten, **Anwesenheit erfassen**; **Neumitglieder anlegen/einladen**; **Ämter-/Rollenverwaltung und Mitglieder löschen** (Beschluss 2026-06-17); **Mitgliederdaten für Meldungen an Lions Deutschland (Wiesbaden) exportieren** |
| **Schatzmeister**  | Abwesenheits-Spenden-Auswertung und Export                                                                                                                                                                                                         |
| **Clubmaster**     | Termine anlegen/ändern (v. a. Club-Reisen & gesellige Termine), Teilnehmerlisten einsehen                                                                                                                                                          |
| **Webmaster / IT** | Technische Administration: Nutzer-/Rollenverwaltung, Stammdaten korrigieren, Löschungen, Systemeinstellungen                                                                                                                                       |

> „Anwesenheit erfassen" (löst die Spende aus) liegt bei **Präsident/Vizepräsident und Sekretär**. Die Club-Abende organisieren Präsident/VP; der **Clubmaster** organisiert v. a. Club-Reisen und gesellige Termine. Feinjustierung jederzeit möglich.

---

## 4. Funktionsmodule

Legende: **Muss** = für Ablösung zwingend · **Soll** = wichtig, nicht blockierend · **Kann** = später.

### 4.1 Mitgliederverwaltung — _Muss_

- Mitgliederverzeichnis mit Kontaktdaten, Foto, Titel, Amt/Funktion.
- **Partner/in** je Mitglied pflegbar (aus Avareto übernommen): Name, Geburtstag, **E-Mail, Handy** und Kontaktdaten.
- **Selbstpflege** der eigenen Stammdaten durch jedes Mitglied (Kernvorteil ggü. Excel).
- Suche und Filter (Name, Amt, Status).
- Statusverwaltung: aktiv / inaktiv / Ehrenmitglied. **Kein Status „ausgetreten"** — ausgeschiedene Mitglieder werden gelöscht.
- Admin: Mitglied anlegen, einladen, deaktivieren, löschen.
- **Verbesserungen ggü. Avareto:** Geburtstagsübersicht, Direkt-Anruf/-Mail aus dem Profil. („Visitenkarte teilen" verworfen.)

### 4.2 Veranstaltungen & An-/Abmeldung — _Muss_

- **Terminübersicht** für Mitglieder: alle anstehenden Termine auf einen Blick (Listen- und Kalenderansicht). Je Termin direkt sichtbar: **eigener Status** (Zugesagt/Abgesagt/Offen) **und aggregierte Rückmeldezahlen** (✓ angemeldet · ✗ abgemeldet · ? offen) – wie in Avareto, aber in Lions-2.0-Semantik. Dazu das Jahresprogramm.
- **Rückmeldezahlen sind antippbar:** Tippen auf eine Zahl öffnet die **Mitgliederliste je Status** (wer hat zugesagt / abgesagt / nicht gemeldet) — aus der Terminübersicht, dem Termin-Detail **und der Admin-Jahresplanung** (vgl. „Meldungen" in Avareto).
- **Anstehend vs. Vergangen:** Standard zeigt **anstehende** Termine (nächster oben). Ein Segment-Umschalter **„Anstehend / Vergangen"** wechselt zu vergangenen Terminen (kein endloses Zurückscrollen). Vergangene Termine sind **schreibgeschützt** (keine An-/Abmeldung), zeigen aber die **finalen Rückmeldungen und die erfasste Anwesenheit** (relevant für Vorstand/Schatzmeister). Die Kalenderansicht bleibt frei über Monate navigierbar. Ein eigenständiger **Umfrage-Bereich** kommt erst in **Phase 2** (nicht im ersten Launch); die Abfrage-Engine wird aber bereits jetzt flexibel/personenbezogen angelegt.
- Terminanlage mit **Titel = Programm/Thema** (z. B. „Thalia Buchhandlung – gestern, heute, morgen"), Datum/Zeit, Ort, Beschreibung, **Dokumenten-Anhang** und **Veranstaltungstyp** (Eigenschaft/Badge, _nicht_ der Titel).
- An-/Abmeldung durch Mitglieder inkl. optionalem Kommentar; **Begleitpersonen je nach Typ** (siehe Matrix).
- **Beide Aktionen immer verfügbar:** „Anmelden" (Zusagen) **und** „Abmelden" (Absagen) sind im Termin-Detail stets sichtbar – nicht nur die zum aktuellen Status passende. So kann ein Mitglied aus „Offen" heraus direkt absagen; ein **ungeklärter „Offen"-Status soll möglichst nicht bestehen bleiben**. **Visuelle Differenzierung:** Zusagen = Primär (Lions-Blau, gefüllt), Absagen = Danger/Clay; der aktuell gewählte Status erscheint gefüllt/aktiv, die andere Option als Outline.
- **Optionale Zusatzabfragen je Termin** (v. a. gesellige Termine & Reisen): flexible Frage-/Antworttypen (Einfach-/Mehrfachauswahl, Freitext, Ja/Nein, Zahl), z. B. Menü-/Gang-Auswahl, Allergien, Zimmerwunsch. **Antwort pro Person** – für das Mitglied **und jede Begleitperson** separat (wichtig z. B. für Menüzahlen ans Restaurant). Antworten erscheinen in Teilnehmerliste und Export. Technisch als **wiederverwendbare Abfrage-Engine** angelegt, die später den Umfrage-Bereich (Phase 2) trägt.
- Teilnehmerliste in Echtzeit für Vorstand einsehbar; Export (PDF/CSV).
- **Komfort-Massenpflege** am Desktop für die Jahresplanung (mehrere Termine schnell anlegen, ggf. Serientermine).

**Veranstaltungstypen & Regeln:**

| Typ                                                            | Begleitperson | Spendenpflicht (Abwesenheit aktiver Mitglieder) |
| -------------------------------------------------------------- | ------------- | ----------------------------------------------- |
| Club-Abend                                                     | ja            | **ja**                                          |
| Mitglieder-Versammlung (findet statt eines Club-Abends statt)  | nein          | **ja**                                          |
| Club-Reise                                                     | ja            | nein                                            |
| Gesellige Termine (Weihnachtsfeier, P-Übergabe …)              | ja            | nein                                            |
| Offizielle Lions-Termine (Zonentreffen, Distriktversammlung …) | nein          | nein                                            |

Der frühere Flag „offizieller Clubabend" entspricht damit **spendenpflichtig = Club-Abend + Mitglieder-Versammlung**.

### 4.3 Anwesenheit & Abwesenheits-Spenden — _Muss (neu ggü. Avareto)_

- Bei **spendenpflichtigen Terminen** (Club-Abend, Mitglieder-Versammlung) erfasst der Vorstand die Anwesenheit.
- Bei Abwesenheit eines **aktiven** Mitglieds → automatisch eine **Spendenposition** (Begünstigter: Förderverein). **Inaktive Mitglieder und Ehrenmitglieder sind befreit.**
- **Keine Ausnahmen:** Jede Nicht-Teilnahme eines aktiven Mitglieds löst die Spende aus — unabhängig vom Grund (auch entschuldigt/Krankheit); kein Jahresdeckel.
- **Betrag:** pro Abwesenheit ein **konfigurierbarer Betrag** (kann sich ändern, daher nicht fest in der App verdrahtet). Die App erfasst primär die **Abwesenheiten**; die Schatzmeister-Auswertung zeigt die Anzahl je Mitglied und — zum aktuell hinterlegten Satz — die Summe.
- **Keine Spenden-Hinweise im Mitglieder- oder Erfassungs-UI:** Die Spendenpflicht wird _nicht_ als Hinweis/Badge angezeigt (die Mitglieder kennen die Regel). Erfasst werden schlicht An-/Abwesenheiten; die Spenden-/Geldsicht bleibt intern und erscheint nur in der Schatzmeister-Auswertung.
- Schatzmeister-Sicht: Übersicht offener/erfasster Beträge je Mitglied und Zeitraum, **Export** für die manuelle Weiterverarbeitung.
- **Klare Abgrenzung — Nicht-Ziel:** Es findet **keine Zahlungsabwicklung** in der App statt (kein Lastschrift-/Payment-Provider). Die App erfasst und wertet nur aus; das Geld bucht der Schatzmeister wie bisher außerhalb.

### 4.4 Benachrichtigungen & Reminder-Automatik — _Muss_

- Web-Push über die PWA; E-Mail als Fallback für Nutzer ohne Push.
- **Automatische Reminder**, z. B.:
  - **3 Tage vor** einem Termin an alle, die **noch nicht** geantwortet haben (Vorlauf pro Termin überschreibbar). Hintergrund: rechtzeitige Teilnehmerzahl, z. B. für die Raumplanung des Club-Restaurants.
  - Erinnerung an den Vorstand zur Anwesenheitserfassung nach einem Clubabend.
- Manuelle Push-/Info-Nachricht des Vorstands an alle oder Gruppen.
- **Geburtstagserinnerung automatisch an alle Mitglieder** (Mitglieds-Geburtstage). Partner-Geburtstage nur im Profil sichtbar.

### 4.5 News — _Soll_

- Vorstand veröffentlicht Vereinsnachrichten; Mitglieder sehen Feed; optional Push.

### 4.6 Dokumente — _Soll_

- Zentrale Ablage (Protokolle, Satzung, Jahresprogramm). Zugriff rollenabhängig.
- Versionierung ❓Kann.

### 4.7 Fotogalerie — _Soll_

- Eindrücke von Club-Events, Reisen etc.
- **Entscheidung:** vorerst **Verlinkung auf das bestehende Google-Share** (kein Rebuild, kein zusätzlicher Storage/Datenschutz-Aufwand). Eine eigene In-App-Galerie bleibt als spätere Option offen.
- Zugriff **clubintern**; Einwilligung bewusst **einfach gehalten**, da Mitglieder den Zugriff auf Reise-/Eventbilder ausdrücklich wünschen.

### 4.8 Komfortfunktionen — _Kann_

- Geburtstagsübersicht, Online-Meeting-Link am Termin, Kontakt-Schnellaktionen.

---

## 5. Datenmodell (grobe Skizze)

> Detaillierung erfolgt im Design. Erste Entitäten:

- **member** — Person, Kontaktdaten, Foto, Status (aktiv/inaktiv/Ehrenmitglied), Beitrittsdatum, Geburtstag, **Partner/in (Name, Geburtstag, E-Mail, Handy)**.
- **role / member_role** — Rollen- und Amtszuordnung.
- **event** — Termin, **Typ** (Club-Abend / Mitglieder-Versammlung / Club-Reise / gesellig / offizieller Lions-Termin → steuert Begleitperson & Spendenpflicht), Ort, Zeit.
- **question / answer** — flexible Abfrage (Fragetyp + Antwortoptionen), an einen Termin angehängt; **Antwort pro Person** (Mitglied bzw. einzelne Begleitperson). Wiederverwendbar für den späteren Umfrage-Bereich (Phase 2).
- **event_response** — Zu-/Absage je Mitglied, Begleitpersonen (als Sub-Einträge, damit personenbezogene Abfragen je Begleitperson möglich sind), Kommentar.
- **attendance** — Anwesend/abwesend je Mitglied je Clubabend.
- **donation_entry** — Abwesenheits-Spende (Betrag aus Einstellung), abgeleitet aus attendance, Status.
- **setting** — konfigurierbare Werte (z. B. Spendenbetrag, Reminder-Vorlauf-Default).
- **document** — Datei, Kategorie, Sichtbarkeit.
- **news_post** — Nachricht.
- **photo** — Galerie-Bild, Einwilligungsbezug.
- **notification** — Push-/E-Mail-Versand, Auslöser.

---

## 6. Nicht-Ziele (bewusst ausgeschlossen)

- **Chat / Messenger** in der App (wird nicht genutzt; teuer in Bau und Wartung).
- **Zahlungsabwicklung / Buchhaltung** (bleibt beim Schatzmeister; nur Erfassung der Abwesenheits-Spenden).
- **Multimandantenfähigkeit / mehrere Clubs** (erst relevant beim separaten Business-Case).
- **Native Store-Apps** (PWA genügt).
- **Magazine-Modul** wie bei Avareto — nicht benötigt, **gestrichen** (News + Dokumente decken das ab).
- **Eigenständiger Umfrage-Bereich** → **Phase 2** (nicht im ersten Launch). Die Abfrage-Engine wird aber bereits jetzt flexibel und personenbezogen angelegt, damit Umfragen später darauf aufsetzen.

---

## 7. DSGVO & Datenschutz

Datenhaltung ist Architekturtreiber, nicht Anhang.

- **Datenhaltung EU/DE:** Supabase Region Frankfurt. **Hinweis (transparent):** Supabase Inc. ist ein US-Unternehmen; Daten liegen physisch in der EU, ein **AV-Vertrag (DPA)** ist abzuschließen. DSGVO-rechtlich verbleibt der bekannte US-Bezug (SCC/Cloud Act) — bewusst akzeptiert in der pragmatischen Variante.
- **Frontend-Hosting:** **Netlify**. Netlify, Inc. ist nach dem **EU-US Data Privacy Framework** zertifiziert (gültige Transfergrundlage); zusätzlich **AVV/DPA** abschließen. Architektur-Empfehlung: personenbezogene Daten möglichst **clientseitig direkt mit Supabase (EU)** austauschen; SSR-Routen, die personenbezogene Daten über Netlify leiten, sparsam einsetzen.
- **Rollen & Zugriffsschutz:** Row-Level-Security in Supabase; Mitglieder sehen nur, was ihre Rolle erlaubt.
- **Foto-Einwilligung:** einfach gehalten — Galerie ist clubintern (nur Mitglieder), der Zugriff wird ausdrücklich gewünscht; Widerruf/Löschung einzelner Bilder möglich.
- **Betroffenenrechte:** Auskunft, Berichtigung (Selbstpflege deckt das ab), Löschung; technisches Löschkonzept vorsehen.
- **Verzeichnis von Verarbeitungstätigkeiten / Datenschutzerklärung** für die App erforderlich.
- **Lions-Meldungen:** Der Sekretär meldet Mitgliederdaten (inkl. Neuanmeldungen) an **Lions Deutschland (Wiesbaden)** — ein Transfer **innerhalb Deutschlands/der EU, kein Drittlandtransfer**. Die App greift nicht auf Lions-Systeme zu, sondern unterstützt nur den Export. Der Vorgang sollte im Verarbeitungsverzeichnis des Clubs erfasst sein; App-seitig kein zusätzlicher Handlungsbedarf.

---

## 8. Entscheidungen (alle Fragen geklärt)

**Stand v1.0: keine offenen Fragen mehr — bereit für die Design-Phase.**

- **Login = E-Mail-OTP (6-stelliger Code)**; SMS verworfen (Kosten, US-Subprozessor, nicht sicherer).
- **Ämter-Rechte-Matrix** definiert (§3): rechte-tragend = Präsident, Vizepräsident, Sekretär, Schatzmeister, Clubmaster, Webmaster/IT; übrige nur Anzeige-Titel. Anwesenheitserfassung bei Präsident/VP/Sekretär; Clubmaster für Reisen & gesellige Termine. Sekretär exportiert zudem Mitgliederdaten für Lions-Meldungen (inkl. Neuanmeldungen) und hat — per Beschluss 2026-06-17 — zusätzlich Ämter-/Rollenverwaltung und das Recht, Mitglieder zu löschen.
- **Partner/in:** Name, Geburtstag, E-Mail, Handy + Kontaktdaten.
- **Status:** aktiv / inaktiv / Ehrenmitglied; inaktive & Ehrenmitglieder spendenbefreit.
- **Veranstaltungstypen & Regeln** definiert (§4.2); Spendenpflicht nur Club-Abend + Mitglieder-Versammlung.
- **Terminübersicht** mit eigenem An-/Abmeldestatus; **Zusatzabfragen je Termin** (z. B. Menü/Gang) für gesellige Termine & Reisen.
- **Abwesenheits-Spende:** keine Ausnahmen, kein Jahresdeckel; **Betrag konfigurierbar** (nicht fest verdrahtet) — die App erfasst die Abwesenheiten.
- **Reminder:** 3 Tage vor Termin an Nicht-Rückmelder, pro Termin überschreibbar.
- **Geburtstage:** Mitglieds-Geburtstage automatisch an alle; Partner nur im Profil.
- **Export:** PDF + CSV.
- **Magazine-Modul:** gestrichen.
- **Fotogalerie:** vorerst Verlinkung auf bestehendes Google-Share.
- **Hosting:** Netlify (DPF-zertifiziert) + AVV; Datenbank Supabase EU/Frankfurt.
- **Clubgröße:** 34 Mitglieder.
- Status „ausgetreten" entfällt; „Visitenkarte teilen" verworfen; Foto-Einwilligung einfach; Lions-interne Vorgaben nicht einschlägig.

---

## 9. Nächste Schritte

1. ✅ Offene Fragen geklärt, Spezifikation auf **v1.0** finalisiert.
2. **Design-Prozess in Claude Design** (Screens: Mitgliederverzeichnis, Termin-Detail mit An-/Abmeldung, Anwesenheitserfassung, Schatzmeister-Auswertung, Admin/Massenpflege).
3. Erst danach Umsetzung & Programmierung (SvelteKit + Supabase).
