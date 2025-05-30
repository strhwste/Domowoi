var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { filterSensorsByArea } from './utils';
import { loadRules } from './plugin-loader';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';
const TRANSLATIONS = { de, en };
let HausgeistCard = class HausgeistCard extends LitElement {
    constructor() {
        super(...arguments);
        this.config = {};
        this.debug = false;
        this.notify = false;
        this.highThreshold = 2000;
        this.rulesJson = '';
        this.texts = TRANSLATIONS['de'];
        this.ready = false;
    }
    async firstUpdated() {
        try {
            let rules;
            if (this.config.rulesJson) {
                rules = JSON.parse(this.config.rulesJson);
            }
            else {
                rules = await loadRules();
            }
            this.engine = new RuleEngine(rules);
            this.ready = true;
        }
        catch (error) {
            console.error('Failed to load rules:', error);
            this.ready = false;
        }
        this.requestUpdate();
    }
    setConfig(config) {
        this.config = config;
        this.debug = !!config?.debug;
        this.notify = !!config?.notify;
        this.highThreshold = typeof config?.highThreshold === 'number' ? config.highThreshold : 2000;
        this.rulesJson = config?.rulesJson || '';
    }
    static getConfigElement() {
        return document.createElement('hausgeist-card-editor');
    }
    static getStubConfig() {
        return { debug: false, notify: false, highThreshold: 2000, rulesJson: '' };
    }
    render() {
        if (!this.ready || !this.engine) {
            return html `<p>Loading…</p>`;
        }
        // Debug-Flag direkt aus Config übernehmen (zur Sicherheit)
        this.debug = !!this.config?.debug;
        let debugOut = [];
        const states = Object.values(this.hass.states);
        const areas = this.hass.areas
            ? Object.values(this.hass.areas)
            : Array.from(new Set(states.map((e) => e.attributes?.area_id).filter(Boolean))).map((area_id) => ({ area_id, name: area_id }));
        const areaIds = areas.map(a => a.area_id);
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        const defaultTarget = this.config?.overrides?.default_target || 21;
        if (this.debug) {
            debugOut.push(`DEBUG: areaIds: ${JSON.stringify(areaIds)}`);
            debugOut.push(`DEBUG: states.length: ${states.length}`);
            debugOut.push(`DEBUG: Erste 10 area_id aus states:`);
            debugOut.push(states.filter((s) => s.attributes && s.attributes.area_id).slice(0, 10).map((s) => `${s.entity_id}: '${s.attributes.area_id}'`).join('\n'));
            debugOut.push('DEBUG: Erste 3 States als JSON:');
            debugOut.push(states.slice(0, 3).map((s) => JSON.stringify(s, null, 2)).join('\n---\n'));
        }
        // Debug-Hinweis oben anzeigen
        const debugBanner = this.debug ? html `<div style="background:#ffe; color:#a00; padding:0.5em; border:1px solid #cc0; margin-bottom:1em;">Debug active! (hausgeist-card)</div>` : '';
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS['de'];
        }
        // Fix: add type annotations and correct scoping
        const areaMessages = areaIds.map((area) => {
            const sensors = filterSensorsByArea(states, area);
            const usedSensors = [];
            if (this.debug) {
                // Zeige alle area_id Werte aus states
                const allAreaIds = states
                    .filter((s) => s.attributes && s.attributes.area_id)
                    .map((s) => `${s.entity_id}: '${s.attributes.area_id}'`)
                    .join('\n');
                debugOut.push(`All area_id values in states:\n${allAreaIds}`);
                // Zeige die Area-IDs, die für die Schleife verwendet werden
                debugOut.push(`areaIds used for mapping: ${JSON.stringify(areaIds)}`);
                // Zeige für die erste Area die Entity-IDs, die filterSensorsByArea zurückgibt
                if (areaIds.length > 0) {
                    const sensorsForFirst = filterSensorsByArea(states, areaIds[0]);
                    debugOut.push(`Entities for areaIds[0] ('${areaIds[0]}'): ${sensorsForFirst.map((s) => s.entity_id).join(', ')}`);
                }
                // Zeige die Anzahl der gefundenen Sensoren pro Area
                debugOut.push(`Area: ${area} | sensors.length: ${sensors.length}`);
                debugOut.push(`Sensors found by filterSensorsByArea: ${sensors.map((s) => s.entity_id + ' (' + (s.attributes.device_class || '-') + ')').join(', ')}`);
            }
            // Multilingual sensor keywords for fallback
            const SENSOR_KEYWORDS = {
                temperature: [
                    'temperature', 'temperatur', 'température', 'temperatura', 'temperatuur', 'температура', '温度', '온도'
                ],
                humidity: [
                    'humidity', 'feuchtigkeit', 'humidité', 'umidità', 'vochtigheid', 'humedad', 'влажность', '湿度', '습도'
                ],
                co2: [
                    'co2', 'kohlendioxid', 'dioxyde de carbone', 'anidride carbonica', 'kooldioxide', 'dióxido de carbono', 'углекислый газ', '二氧化碳', '이산화탄소'
                ],
                window: [
                    'window', 'fenster', 'fenêtre', 'finestra', 'raam', 'ventana', 'окно', '窗', '창문'
                ],
                door: [
                    'door', 'tür', 'porte', 'porta', 'deur', 'puerta', 'дверь', '문'
                ],
                curtain: [
                    'curtain', 'vorhang', 'rideau', 'tenda', 'gordijn', 'cortina', 'занавеска', '커튼'
                ],
                blind: [
                    'blind', 'jalousie', 'store', 'persiana', 'jaloezie', 'persiana', 'жалюзи', '블라인드'
                ],
                energy: [
                    'energy', 'energie', 'énergie', 'energia', 'energía', 'энергия', '에너지'
                ],
                motion: [
                    'motion', 'bewegung', 'mouvement', 'movimento', 'beweging', 'movimiento', 'движение', '움직임'
                ],
                occupancy: [
                    'occupancy', 'belegung', 'occupation', 'occupazione', 'bezetting', 'ocupación', 'занятость', '점유'
                ],
                air_quality: [
                    'air_quality', 'luftqualität', "qualité de l'air", "qualità dell'aria", 'luchtkwaliteit', 'calidad del aire', 'качество воздуха', '공기질'
                ],
                rain: [
                    'rain', 'regen', 'pluie', 'pioggia', 'lluvia', 'дождь', '비'
                ],
                sun: [
                    'sun', 'sonne', 'soleil', 'sole', 'zon', 'sol', 'солнце', '태양'
                ],
                adjacent: [
                    'adjacent', 'benachbart', 'adjacent', 'adiacente', 'aangrenzend', 'adyacente', 'смежный', '인접'
                ],
                forecast: [
                    'forecast', 'vorhersage', 'prévision', 'previsione', 'voorspelling', 'pronóstico', 'прогноз', '예보'
                ]
            };
            // Inline findSensor logic (since _findSensor is not a method)
            const findSensor = (cls) => {
                // 1. Check for manual override in config
                const overrideId = this.config?.overrides?.[area]?.[cls];
                if (overrideId) {
                    const s = sensors.find((st) => st.entity_id === overrideId);
                    if (s) {
                        usedSensors.push({ type: cls + ' (override)', entity_id: s.entity_id, value: s.state });
                        return s;
                    }
                }
                // 2. Autodetect by device_class
                let s = sensors.find((st) => st.attributes.device_class === cls);
                if (s) {
                    usedSensors.push({ type: cls, entity_id: s.entity_id, value: s.state });
                    return s;
                }
                // 3. Fallback: search by friendly_name or entity_id for keywords
                const keywords = SENSOR_KEYWORDS[cls] || [];
                let found = sensors.find((st) => {
                    const name = (st.attributes.friendly_name || '').toLowerCase();
                    const eid = st.entity_id.toLowerCase();
                    return keywords.some((k) => name.includes(k) || eid.includes(k));
                });
                if (found) {
                    usedSensors.push({ type: cls, entity_id: found.entity_id, value: found.state });
                    return found;
                }
                // 4. Extra fallback: look for sensors whose entity_id or friendly_name contains the area name
                const areaName = (this.hass.areas && this.hass.areas[area]?.name?.toLowerCase()) || area.toLowerCase();
                found = sensors.find((st) => {
                    const name = (st.attributes.friendly_name || '').toLowerCase();
                    const eid = st.entity_id.toLowerCase();
                    return name.includes(areaName) || eid.includes(areaName);
                });
                if (found) {
                    usedSensors.push({ type: cls + ' (area-fallback)', entity_id: found.entity_id, value: found.state });
                    return found;
                }
                // If still not found, log a warning in debug
                if (this.debug) {
                    usedSensors.push({ type: cls, entity_id: '[NOT FOUND]', value: 'No matching sensor found' });
                }
                return undefined;
            };
            // Ensure all required sensor types are checked for sensor presence (for usedSensors and warning logic)
            const requiredSensorTypes = [
                'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'energy', 'motion', 'occupancy', 'air_quality', 'rain', 'sun', 'adjacent', 'forecast'
            ];
            // Call findSensor for all required types to populate usedSensors, even if not used in context
            requiredSensorTypes.forEach(type => { findSensor(type); });
            const get = (cls) => {
                const s = findSensor(cls);
                return s ? Number(s.state) : undefined;
            };
            // Helper to always cast to 'any' for state lookups
            const findState = (fn) => {
                const found = states.find(fn);
                return found ? found : undefined;
            };
            const context = {
                target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
                humidity: get('humidity'),
                co2: get('co2'),
                window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
                heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
                motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
                occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
                outside_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.temperature ?? 15),
                forecast_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.forecast?.[0]?.temperature ?? 15),
                energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
                high_threshold: this.highThreshold,
                temp_change_rate: 0,
                now: Date.now(),
                curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
                blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
                // Ergänzungen für Regeln
                rain_soon: findState((e) => e.entity_id.includes('rain') && e.attributes.area_id === area)?.state === 'on' || false,
                adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
                air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
                forecast_sun: findState((e) => e.entity_id.includes('forecast') && e.entity_id.includes('sun') && e.attributes.area_id === area)?.state === 'on' || false,
            };
            const evals = this.engine ? this.engine.evaluate(context) : [];
            if (this.debug) {
                debugOut.push(`--- ${area} ---\n` +
                    'Sensors used:\n' +
                    usedSensors.map((s) => `  [${s.type}] ${s.entity_id}: ${s.value}`).join('\n') +
                    `\nRules checked: ${this.engine ? this.engine['rules'].length : 0}\n` +
                    `Rules matched: ${evals.length}\n` +
                    evals.map((ev) => `${ev.priority}: ${ev.message_key}`).join("\n"));
            }
            // Attach usedSensors to area for later display
            return { area, evals, usedSensors };
        });
        // Top messages: only areas with at least one rule hit
        const topMessages = areaMessages.filter((a) => a.evals.length > 0)
            .map((a) => {
            // Pick highest prio message for each area
            const top = a.evals.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0))[0];
            if (!top)
                return null; // Skip if no evals
            // Return area with its top message and used sensors
            if (this.debug) {
                debugOut.push(`Top message for ${a.area}: ${top.priority} - ${top.message_key}`);
            }
            if (!top.message_key) {
                console.warn(`Missing message_key for area ${a.area} in evals:`, a.evals);
                return null; // Skip if no message_key
            }
            return { area: a.area, ...top, usedSensors: a.usedSensors };
        });
        const anySensorsUsed = areaMessages.some((areaMsg) => areaMsg.usedSensors && areaMsg.usedSensors.length > 0 && areaMsg.usedSensors.some((s) => s.entity_id !== '[NOT FOUND]'));
        const anyRulesApplied = areaMessages.some((a) => a.evals.length > 0);
        // Render the card content
        return html `
      ${debugBanner}
      <h2>👻 Hausgeist sagt:</h2>
      ${!anySensorsUsed ? html `<p class="warning">⚠️ No sensors detected for any area!<br>Check your sensor configuration, area assignment, or use the visual editor to select sensors.</p>` :
            (!anyRulesApplied ? html `<p class="warning">⚠️ No rules applied (no comparisons made for any area).</p>` :
                topMessages.map(e => html `<p class="${e.priority}"><b>${e.area}:</b> ${this.texts?.[e.message_key] || `Missing translation: ${e.message_key}`}</p>`))}
      <div class="debug" style="white-space:pre-wrap; background:#f5f5f5; color:#333; font-size:0.95em; margin-top:1em;">${debugOut.join('\n\n')}</div>
      ${this.debug ? html `
        <div class="sensors-used">
          <b>Sensors used:</b>
          <ul>
            ${areaMessages.map(areaMsg => html `
              <li><b>${areaMsg.area}:</b>
                <ul>
                  ${areaMsg.usedSensors.map(s => html `<li>[${s.type}] ${s.entity_id}: ${s.value}</li>`)}
                </ul>
              </li>
            `)}
          </ul>
        </div>
      ` : ''}
    `;
    }
};
HausgeistCard.styles = css `
    :host {
      display: block;
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 1em);
      box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.07));
      padding: 1.5em;
      font-family: var(--primary-font-family, inherit);
      color: var(--primary-text-color, #222);
    }
  
    private _findSensor(
      sensors: any[],
      area: string,
      usedSensors: Array<{ type: string; entity_id: string; value: any }>,
      cls: keyof typeof SENSOR_KEYWORDS
    ) {
      // 1. Check for manual override in config
      const overrideId = this.config?.overrides?.[area]?.[cls];
      if (overrideId) {
        const s = sensors.find((st) => (st as any).entity_id === overrideId);
        if (s) {
          usedSensors.push({
            type: cls + ' (override)',
            entity_id: (s as any).entity_id,
            value: (s as any).state,
          });
          return s;
        }
      }
      // 2. Autodetect by device_class
      let s = sensors.find((st) => (st as any).attributes.device_class === cls);
      if (s) {
        usedSensors.push({
          type: cls,
          entity_id: (s as any).entity_id,
          value: (s as any).state,
        });
        return s;
      }
      // 3. Fallback: search by friendly_name or entity_id for keywords
      const keywords = SENSOR_KEYWORDS[cls] || [];
      let found = sensors.find((st) => {
        const name = ((st as any).attributes.friendly_name || '').toLowerCase();
        const eid = (st as any).entity_id.toLowerCase();
        return keywords.some((k: string) => name.includes(k) || eid.includes(k));
      });
      if (found) {
        usedSensors.push({
          type: cls,
          entity_id: (found as any).entity_id,
          value: (found as any).state,
        });
        return found;
      }
      // 4. Extra fallback: look for sensors whose entity_id or friendly_name contains the area name
      const areaName =
        (this.hass.areas && this.hass.areas[area]?.name?.toLowerCase()) ||
        area.toLowerCase();
      found = sensors.find((st) => {
        const name = ((st as any).attributes.friendly_name || '').toLowerCase();
        const eid = (st as any).entity_id.toLowerCase();
        return name.includes(areaName) || eid.includes(areaName);
      });
      if (found) {
        usedSensors.push({
          type: cls + ' (area-fallback)',
          entity_id: (found as any).entity_id,
          value: (found as any).state,
        });
        return found;
      }
      // If still not found, log a warning in debug
      if (this.debug) {
        usedSensors.push({
          type: cls,
          entity_id: '[NOT FOUND]',
          value: 'No matching sensor found',
        });
      }
      return undefined;
    }
    h2 {
      margin-top: 0;
      font-size: 1.3em;
      color: var(--primary-text-color, #4a4a4a);
    }
    p.warning {
      color: var(--warning-color, #b85c00);
      background: var(--warning-bg, #fff7e6);
      border-left: 4px solid var(--warning-border, #ffb300);
      padding: 0.5em 1em;
      border-radius: 0.5em;
      margin: 0.5em 0;
    }
    p.info {
    let debugOut: string[] = [];
    const areaMessages = areaIds.map(area => {
      const sensors = filterSensorsByArea(states, area);
      if (this.debug) {
        debugOut = []; // Initialize debug output only if debug is true
      }
      padding: 0.5em 1em;
      border-radius: 0.5em;
      margin: 0.5em 0;
    }
    p.ok {
      color: var(--success-color, #357a38);
      background: var(--success-bg, #e6f9e6);
      border-left: 4px solid var(--success-border, #4caf50);
      padding: 0.5em 1em;
      border-radius: 0.5em;
      margin: 0.5em 0;
    }
    .debug {
      font-size: 0.9em;
      color: var(--secondary-text-color, #888);
      background: var(--secondary-background-color, #f5f5f5);
      border-radius: 0.5em;
      padding: 0.5em 1em;
      margin: 0.5em 0;
      white-space: pre-wrap;
    }
  `;
__decorate([
    property({ type: Object })
], HausgeistCard.prototype, "hass", void 0);
__decorate([
    property({ type: Object })
], HausgeistCard.prototype, "config", void 0);
__decorate([
    property({ type: Boolean })
], HausgeistCard.prototype, "debug", void 0);
__decorate([
    property({ type: Boolean })
], HausgeistCard.prototype, "notify", void 0);
__decorate([
    property({ type: Number })
], HausgeistCard.prototype, "highThreshold", void 0);
__decorate([
    property({ type: String })
], HausgeistCard.prototype, "rulesJson", void 0);
HausgeistCard = __decorate([
    customElement('hausgeist-card')
], HausgeistCard);
export { HausgeistCard };
