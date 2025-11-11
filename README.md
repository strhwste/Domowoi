# Domowoi
A friendly ghost who watches over your home and gives recommendations.

# Hausgeist Card

An intelligent, multilingual Home Assistant Lovelace card for indoor climate, energy, and comfort suggestions.

## Features
- Flexible, configurable rules (`src/rules.json`)
- Multilingual support (de/en, easily extendable)
- Automatic evaluation of all sensors in the selected area, robust detection (multilingual, device_class and name)
- Shows the most important suggestions for all rooms/areas (not just one)
- Debug mode: shows all evaluated rules per room (toggleable in the editor)
- Visual editor for Home Assistant (Lovelace UI)
- Modern, customizable design (uses Home Assistant theme variables)

## Screenshots
![Screenshot 1](assets/ghost_bsp.png)

## Installation
1. **Build** (in the project folder):
   ```bash
   npm install
   npm run build
   ```
   (If needed, adjust the build target in `rollup.config.js`, e.g. to `dist/hausgeist-card.js`)

2. **Copy the built JS file** (e.g. `dist/hausgeist-card.js` or `hausgeist-card.js`) to `/config/www/` on your Home Assistant server.

3. **Add the resource in Home Assistant:**
   - Settings → Dashboards → Resources → Add resource
   - URL: `/local/hausgeist-card.js`
   - Type: JavaScript Module

4. **Add the card to your Lovelace dashboard:**
   ```yaml
   type: 'custom:hausgeist-card'
   # area_id is optional; the card will automatically show all areas
   debug: false  # Optional: show debug mode
   ```
   (Adjust further options in the visual editor or YAML)

## Rules & Translations
- Rules: `src/rules.json` (message_key, condition as JS expression)
- Translations: `translations/de.json`, `translations/en.json`
- New rules: e.g. for "close windows when it rains", "close doors to prevent heat loss", etc.

## Visual Editor
- The card supports the Home Assistant Visual Editor (Lovelace UI).
- Debug mode and other options can be configured directly in the editor.

## Development
- Source code: `src/`
- Translations: `translations/`
- Build: `npm run build`
- Automatic copying of the built file for HACS/manual installation

## HACS & 3D Ghost Integration

- After installation via HACS, you will find the card JS under `dist/hausgeist-card.js`.
- The 3D model `ghost.glb` is located in the `www/` folder and must be **manually** copied to `/config/www/` of your Home Assistant installation.
- In the card configuration:
  ```yaml
  type: 'custom:hausgeist-card'
  ghost_model_url: /local/ghost.glb
  ...
  ```
- After copying, check if the model is accessible at `http://<your-ha>/local/ghost.glb`.
- HACS cannot automatically copy the model to `/config/www/` – this is a manual step!

## License
See LICENSE.
