# Domowoi
A friendly Ghost who watches over your home and gives recomendations.

# Hausgeist Card

Eine intelligente, mehrsprachige Home Assistant Lovelace Karte für Raumklima, Energie und Komforthinweise.

## Features
- Flexible, konfigurierbare Regeln (src/rules.json)
- Mehrsprachigkeit (de/en, leicht erweiterbar)
- Automatische Auswertung aller Sensoren im gewählten Bereich
- Modernes, anpassbares Design

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
   area_id: wohnzimmer
   ```
   (Passe `area_id` an deinen Bereich an)

## Regeln & Übersetzungen
- Regeln: `src/rules.json` (message_key, Bedingung als JS-Ausdruck)
- Übersetzungen: `translations/de.json`, `translations/en.json`

## Entwicklung
- Quellcode: `src/`
- Übersetzungen: `translations/`
- Build: `npm run build`

## Lizenz
Siehe LICENSE.
