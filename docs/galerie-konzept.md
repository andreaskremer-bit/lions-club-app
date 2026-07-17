# Galerie — Konzept & Entscheidungsstand

**Status:** AUF HOLD — interne Club-Klärung ausstehend.
**Aktuelle Lösung bleibt vorerst:** `/galerie` verlinkt auf das geteilte Google-Drive
(`PUBLIC_GALLERY_URL`, `window.open` in neuem Fenster). Dieses Dokument hält die
Überlegungen für die spätere Entscheidung fest.

---

## ENTSCHEIDUNG 2026-07-16: Drive bleibt Foto-Ablage, App-Galerie bleibt auf Hold

Bewusst getroffen — Begründung und aktuelle Drive-Freigabe:

- **App-native Galerie (Supabase Storage, Variante B unten) NICHT bauen.** Grund: Der Free-Tier
  bietet nur **1 GB Storage**; Club-Fotos (Reisen/Veranstaltungen, viele MB pro Bild) würden das
  in 1–2 Jahren sprengen → dann Zwang zu **Supabase Pro (~300 €/Jahr)**. Das widerspricht der
  bewusst gewählten **Null-Euro-Linie** (Free-Tier + KeepAlive-Action, siehe
  `notifications-go-live` / KeepAlive). Google Drive kostet für Fotos effektiv nichts und ist
  ohnehin die Ablage, die der Club pflegt.
- **Statt Zugriffsschutz über die App: Drive-Freigabe gelockert.** Der Ordner „Bilder"
  (`1VO_eLP7kV-buk7HTcYb373ra0NFgqEOG`, in einer **Shared Drive**) steht jetzt auf
  **„Jeder, der über den Link verfügt → Betrachter"** (`anyone: reader`). Damit entfällt das
  bisherige Problem, dass Mitglieder am Google-Login/an der Gruppen-Zugehörigkeit scheiterten.
  Bewusst akzeptiertes Restrisiko: Wer den (nicht erratbaren) Link weitergibt, öffnet ihn auch für
  Nicht-Mitglieder. Für Club-Fotos akzeptabel; der Link taucht praktisch nur in der OTP-geschützten
  App auf.
- **Mitglieder sollen beitragen/hochladen können** → Google-Gruppe
  `mitglieder@lions-bonn-rheinaue.de` bleibt **Mitwirkender (Contributor / API `writer`)**, NICHT
  Betrachter. Es gibt keinen Rollentyp „hochladen aber nicht löschen" — Upload erfordert Schreibrecht.
- **Sicherheitsnetz gegen versehentliches Löschen/Verschieben:** Weil der Ordner in einer
  **Shared Drive** liegt, landen Löschungen im **Papierkorb der Team-Ablage (30 Tage,
  wiederherstellbar durch Manager)** und Dateien gehören der Team-Ablage, nicht der Person. Ein
  Fehlklick ist reparabel, kein endgültiger Datenverlust. Das große Umsortieren/Löschen ist
  ohnehin den höheren Rollen (Inhaltsmanager/Manager) vorbehalten; die Mitglieder-Gruppe hat mit
  Contributor bereits die schonendste Upload-Rolle.
- **Rollen-Stand (aus der Drive-Freigabe):** du + Webmaster = Manager (Organisator), Thomas =
  Inhaltsmanager (fileOrganizer), Mitglieder-Gruppe = Mitwirkender (writer), zusätzlich
  `anyone: reader`. Kein Konflikt zwischen „Jeder mit Link = Betrachter" und Gruppe = Bearbeiter:
  Google nimmt immer die **höchste** zutreffende Rolle; niemand wird durch die Link-Freigabe
  herabgestuft.

Der ausführliche Storage-Umbau (Variante B) unten bleibt als **archiviertes Konzept** für den Fall,
dass der Club später doch eine app-native Galerie will (z. B. bei Wechsel auf Pro/Self-Host).

---

## Problem mit der aktuellen Lösung (Drive-Link)

- **Nicht fail-safe:** Funktioniert nur, wenn das Mitglied im richtigen Google-Konto
  eingeloggt ist / Zugriff hat. Sonst „Zugriff anfragen".
- **DSGVO:** Ist der Ordner „jeder mit Link", sind erkennbare Mitglieder-Fotos faktisch
  öffentlich im Netz. Ist er „nur bestimmte Personen", scheitern viele Mitglieder am Zugriff.
- Kein Einfluss auf Darstellung/Erlebnis.

## Geprüfte Alternative: In-App-Viewer **direkt über den Drive-Share**

Technisch baubar (Anzeige im `<img>`/Lightbox hat **kein** CORS-Problem). Aber zwei harte Haken:

1. **API-Key-Listing braucht einen öffentlichen Ordner** → Mitglieder-Fotos öffentlich + kein
   Zugriffsschutz in der App (DSGVO-Problem).
2. **Nutzbare Drive-Bild-URLs sind inoffiziell/fragil** (Google kann sie ändern, Rate-Limits,
   „Scan-Warnung").

- **Privat-Variante (Service-Account-Proxy):** hält den Ordner privat, aber das Backend
  **proxyt die Bytes** → zählt gegen die **Free-Egress**. Dann hostet man de facto selbst →
  Supabase Storage ist einfacher.
- **Fazit:** „In-App über Drive" erzwingt entweder öffentlichen Ordner (DSGVO) oder Egress-Proxy
  — beides untergräbt Datenschutz bzw. Free.

## Empfohlene Lösung: **Supabase Storage + reduzierte Bilder (Variante B)**

Drive bleibt **einzige Verwaltungs-Oberfläche** (anlegen/sortieren/löschen nur dort).
Die App ist reiner **Viewer**; **kein Upload durch Mitglieder**.

**Sync-Job (Polling + Spiegelung), z. B. täglich als GitHub Action:**

1. Drive-Ordner (inkl. Unterordner = Alben) per Drive-API listen.
2. Vergleich per **Drive-Datei-ID** mit Supabase:
   - **Neu** → herunterladen, **herunterrechnen** (max. ~1600px ≈ 200–400 KB), in `gallery`-Bucket.
   - **In Drive gelöscht** → in Supabase ebenfalls löschen (Löschungen fließen mit).
   - **Unverändert** → überspringen.
3. Neue Unterordner → neue Alben.

- **Drive-Zugriff:** Google-**Service-Account** (Ordner mit dessen Mail teilen) → Ordner bleibt **privat**.
- **Lauf-Ort:** GitHub Action (Node + `sharp` zum Herunterrechnen) schreibt via Supabase-
  **Service-Key** (CI-Secret, nie im Repo/Client) in den `gallery`-Bucket.
- **App:** Grid (Alben → Bilder) + Lightbox, **signierte URLs** aus privatem Bucket, nur für
  eingeloggte Mitglieder (RLS) — dasselbe Muster wie Mitgliederfotos/Dokumente.
- Optional „**Jetzt aktualisieren**"-Knopf (nur Vorstand) für sofortigen Sync.

**Warum Variante B (komprimiert):** Free hat **1 GB Storage / 5 GB Egress/Mo**. Komprimiert →
tausende Bilder passen in 1 GB, Egress moderat. (Ziel ist **Free**, nicht Pro.)

## Frage „Original im Drive öffnen"-Link

- Belastet das **Supabase-Kontingent NICHT** (Mitglied ↔ Google direkt; in der DB nur die
  Drive-Datei-ID als String).
- **Aber:** funktioniert nur, wenn das Mitglied das Original in Drive **öffnen darf** → kollidiert
  mit dem Privat-Ordner-Modell. Drei Optionen für Originale:
  1. **Kein Original-Link** — Ordner strikt privat, nur komprimierte In-App-Ansicht (maximal
     privat, Free-schonend). **Default-Empfehlung.**
  2. **Original-Link + Drive für Mitglieder lesbar** — Link geht (kostet Supabase nichts), aber
     Ordner für Mitglieder/Link zugänglich → Drive-/DSGVO-Frage betrifft nur die Originale.
  3. **Originale auch in Supabase** (Variante A) — privat + zuverlässig, aber zählen voll gegen
     Storage + Egress → auf Free der Knackpunkt.

## Offene Entscheidungen (für die interne Klärung)

1. **Sync-Takt:** täglich vs. alle paar Stunden (+ optional „Jetzt aktualisieren"-Button)?
2. **Alben** = Drive-Unterordner 1:1, oder erstmal flach?
3. **Originale:** Option 1, 2 oder 3 (siehe oben)?
4. **Service-Account-Weg** (Google-Cloud-Projekt + Ordner teilen) okay?
5. Bewertung der Fotos: eher unkritisch/öffentlich-ok vs. clubintern/heikel (beeinflusst 2/3).

## Bei „los" zu bauen (grob)

`gallery`-Bucket + `gallery_album`/`gallery_photo`-Tabellen (Drive-ID unique) + RLS/pgTAP ·
Sync-GitHub-Action (Service-Account-JSON + Service-Key als CI-Secrets) · Grid + Lightbox-
Komponente · ggf. „Jetzt aktualisieren"-Route. Alles mit etablierten Bausteinen (signierte URLs,
Storage-RLS wie `member-photos`/`documents`).
