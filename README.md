# Einmal AINS · Perfusor

Perfusor-Rechner für Anästhesie und Intensivmedizin im Design von **Einmal AINS** (Design System v2, Tag- und Nachtdienst-Thema).
Installierbare Web-App (PWA): läuft nach dem ersten Öffnen vollständig offline, speichert nichts außerhalb des Geräts und überträgt keine Daten.

## Funktionen

- **Dosis → Laufrate** und **Laufrate → Dosis**, umschaltbar ohne Datenverlust
- Alle gängigen Dosiseinheiten: µg/kg/min · µg/kg/h · mg/kg/h · µg/min · µg/h · mg/min · mg/h · mg/24 h · IE/kg/h · IE/min · IE/h · IE/24 h · mmol/kg/h · mmol/h · mmol/24 h – Einheitenwechsel rechnet den eingegebenen Wert um
- Konzentration pro Berechnung abweichend vom Standard änderbar (deutlich markiert)
- Ergebnisdetails: Absolutdosis, Gewicht, Laufzeit der Spritze, Formel
- **Dosistabelle** über den hinterlegten Bereich, aktuelle Dosis markiert
- **Plausibilitätsprüfung:** Laufrate > 99,9 ml/h, Dosis außerhalb des Bereichs (> Faktor 3 = unplausibel), Gewicht außerhalb 0,3–350 kg, Spritze < 1 h; mehrdeutige Zahlen wie „1.000“ werden abgelehnt statt geraten
- **Bibliothek mit 22 Medikamenten** in vier Gruppen, durchsuchbar, Favoriten
- Jedes Medikament ist **„ungeprüft“**, bis es mit dem Hausstandard abgeglichen und bestätigt wurde; Änderungen an Kerndaten heben die Bestätigung auf
- Eigene Medikamente anlegen, bearbeiten, löschen; **Export/Import** als JSON (Backup, zweites Gerät)
- Körpergewicht wird **nicht gespeichert** – „Neuer Patient“ löscht alle Eingaben
- Hell / Dunkel / System, Schnellumschalter in der Kopfzeile

## Wichtig vor dem klinischen Einsatz

Die Startbibliothek (`js/drugs.js`) ist eine **allgemeine Ausgangsliste, kein geprüfter Hausstandard**. Konzentrationen und Bereiche müssen gegen den Perfusor-Standard der eigenen Abteilung und die Fachinformation abgeglichen und in der App einzeln bestätigt werden. Die Bereiche sind ein Netz gegen Tipp- und Einheitenfehler, keine Dosierempfehlung.

## Rechenweg

```
ml/h  = Dosis × (kg) × Zeitfaktor ÷ Konzentration
Dosis = ml/h × Konzentration ÷ (kg) ÷ Zeitfaktor
Zeitfaktor: /min × 60 · /h × 1 · /24 h ÷ 24     Masse intern in mg (µg × 0,001)
```

Anzeige: Laufrate ab 1 ml/h auf 0,1 ml/h, darunter auf 0,01 ml/h; Dosis mit drei signifikanten Stellen.

## Entwicklung

Kein Build-Schritt, reines HTML/CSS/JavaScript (ES-Module).

```bash
npm test                      # Rechenkern-Tests (Node ≥ 20)
python3 -m http.server 8765   # lokal unter http://localhost:8765
```

| Datei | Inhalt |
| --- | --- |
| `js/calc.js` | Rechenkern, Einheiten, Zahlenformat, Plausibilität (ohne DOM, getestet) |
| `js/drugs.js` | Startbibliothek |
| `js/store.js` | Speicher auf dem Gerät, Validierung, Export/Import |
| `js/app.js` | Oberfläche und Navigation |
| `sw.js` | Offline-Cache; bei jeder Änderung `VERSION` erhöhen |

## Bereitstellen

Die App braucht **HTTPS** (Service Worker). Jeder statische Webserver genügt; nach der Installation läuft sie offline, der Server wird nur für Installation und Updates gebraucht.

- **GitHub Pages:** Repository anlegen, Dateien pushen, unter *Settings → Pages* „Deploy from a branch“, `main`, `/ (root)`.
- **Netlify Drop:** Ordner auf app.netlify.com/drop ziehen (mit Konto dauerhaft).
- **Eigener Webspace (Apache, z. B. IONOS):** Alle Dateien inklusive `.htaccess` per SFTP in einen Ordner laden, der über HTTPS erreichbar ist (am besten eine eigene Subdomain). Die `.htaccess` setzt den Dateityp fürs Manifest und verhindert, dass alte Versionen hängen bleiben.
- **Homelab:** Ordner in einen Nginx-Container legen und über Nginx Proxy Manager mit Let's-Encrypt-Zertifikat ausliefern, oder nur im Tailnet per `tailscale serve`.

**Update ausrollen:** Dateien ändern, in `sw.js` die `VERSION` erhöhen, neu hochladen. Die App zeigt „Neue Version verfügbar – Neu laden“.

## Installation am Handy

- **iPhone (Safari):** Teilen → Zum Home-Bildschirm → Hinzufügen
- **Android (Chrome):** Menü ⋮ → App installieren
