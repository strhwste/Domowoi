# Domowoi
A friendly Ghost who watches over your home and gives recommendations.

# Hausgeist Card

Eine intelligente, mehrsprachige Home Assistant Lovelace Karte für Raumklima, Energie und Komforthinweise.

## Features
- Flexible, konfigurierbare Regeln (`src/rules.json`)
- Mehrsprachigkeit (de/en, leicht erweiterbar)
- Automatische Auswertung aller Sensoren im gewählten Bereich, robuste Erkennung (mehrsprachig, device_class und Name)
- Zeigt die wichtigsten Hinweise für alle Räume/Bereiche (nicht nur einen)
- Debug-Modus: Zeigt alle evaluierten Regeln pro Raum (umschaltbar im Editor)
- Visueller Editor für Home Assistant (Lovelace UI)
- Modernes, anpassbares Design (nutzt Home Assistant Theme-Variablen)

## Installation
1. **Build** (im Projektordner):
   ```bash
   npm install
   npm run build
   ```
   (Passe ggf. das Build-Target in `rollup.config.js` an, z.B. auf `dist/hausgeist-card.js`)

2. **Kopiere die gebaute JS-Datei** (z.B. `dist/hausgeist-card.js` oder `hausgeist-card.js`) nach `/config/www/` auf deinem Home Assistant Server.

3. **Füge die Ressource in Home Assistant hinzu:**
   - Einstellungen → Dashboards → Ressourcen → Ressource hinzufügen
   - URL: `/local/hausgeist-card.js`
   - Typ: JavaScript Modul

4. **Karte im Lovelace Dashboard einbinden:**
   ```yaml
   type: 'custom:hausgeist-card'
   # area_id ist optional, die Karte zeigt automatisch alle Bereiche an
   debug: false  # Optional: Debug-Modus anzeigen
   ```
   (Passe weitere Optionen im visuellen Editor oder YAML an)

## Regeln & Übersetzungen
- Regeln: `src/rules.json` (message_key, Bedingung als JS-Ausdruck)
- Übersetzungen: `translations/de.json`, `translations/en.json`
- Neue Regeln: z.B. für "Fenster schließen bei Regen", "Tür schließen bei Wärmeverlust", etc.

## Visueller Editor
- Die Karte unterstützt den Home Assistant Visual Editor (Lovelace UI).
- Debug-Modus und weitere Optionen können direkt im Editor konfiguriert werden.

## Entwicklung
- Quellcode: `src/`
- Übersetzungen: `translations/`
- Build: `npm run build`
- Automatisches Kopieren der gebauten Datei für HACS/Manuelle Installation

## HACS & 3D-Geist-Integration

- Nach der Installation über HACS findest du die Card-JS unter `dist/hausgeist-card.js`.
- Das 3D-Modell `ghost.glb` liegt im Ordner `www/` und muss **manuell** nach `/config/www/` deiner Home Assistant-Installation kopiert werden.
- In der Card-Konfiguration:
  ```yaml
  type: 'custom:hausgeist-card'
  ghost_model_url: /local/ghost.glb
  ...
  ```
- Prüfe nach dem Kopieren, ob das Modell unter `http://<dein-ha>/local/ghost.glb` erreichbar ist.
- HACS kann das Modell nicht automatisch nach `/config/www/` kopieren – das ist ein manueller Schritt!

## Lizenz
Siehe LICENSE.
