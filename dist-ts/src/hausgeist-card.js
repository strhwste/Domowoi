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
        this.debug = false;
        this.texts = {};
        this.ready = false;
    }
    async firstUpdated() {
        const rules = await loadRules();
        this.engine = new RuleEngine(rules);
        this.ready = true;
        this.requestUpdate();
    }
    setConfig(config) {
        this.config = config;
    }
    static getConfigElement() {
        return document.createElement('hausgeist-card-editor');
    }
    static getStubConfig() {
        return { debug: false };
    }
    render() {
        if (!this.ready || !this.engine) {
            return html `<p>Loading…</p>`;
        }
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        }
        const states = Object.values(this.hass.states);
        const areaIds = Array.from(new Set(states.map(e => e.attributes?.area_id).filter(Boolean)));
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        let debugOut = [];
        const areaMessages = areaIds.map(area => {
            const sensors = filterSensorsByArea(states, area);
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
                    'blind', 'jalousie', 'volet', 'persiana', 'jaloezie', 'persiana', 'жалюзи', '블라인드'
                ]
            };
            // Track which sensors are used for debug
            const usedSensors = [];
            // Helper to find a sensor by device_class, multilingual fallback, or area name in entity_id/friendly_name
            const self = this;
            function findSensor(cls) {
                let s = sensors.find(st => st.attributes.device_class === cls);
                if (s) {
                    usedSensors.push({ type: cls, entity_id: s.entity_id, value: s.state });
                    return s;
                }
                // Fallback: search by friendly_name or entity_id for keywords
                const keywords = SENSOR_KEYWORDS[cls] || [];
                let found = sensors.find(st => {
                    const name = (st.attributes.friendly_name || '').toLowerCase();
                    const eid = st.entity_id.toLowerCase();
                    return keywords.some((k) => name.includes(k) || eid.includes(k));
                });
                if (found) {
                    usedSensors.push({ type: cls, entity_id: found.entity_id, value: found.state });
                    return found;
                }
                // Extra fallback: look for sensors whose entity_id or friendly_name contains the area name
                const areaName = (self.hass.areas && self.hass.areas[area]?.name?.toLowerCase()) || area.toLowerCase();
                found = sensors.find(st => {
                    const name = (st.attributes.friendly_name || '').toLowerCase();
                    const eid = st.entity_id.toLowerCase();
                    return name.includes(areaName) || eid.includes(areaName);
                });
                if (found) {
                    usedSensors.push({ type: cls + ' (area-fallback)', entity_id: found.entity_id, value: found.state });
                    return found;
                }
                // If still not found, log a warning in debug
                if (self.debug) {
                    usedSensors.push({ type: cls, entity_id: '[NOT FOUND]', value: 'No matching sensor found' });
                }
                return undefined;
            }
            const get = (cls) => {
                const s = findSensor(cls);
                return s ? Number(s.state) : undefined;
            };
            const context = {
                temp: get('temperature'),
                humidity: get('humidity'),
                co2: get('co2'),
                target: Number(states.find(e => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? 21),
                window: states.find(e => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
                heating: states.find(e => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
                motion: states.find(e => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
                occupied: states.find(e => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
                outside_temp: Number(states.find(e => e.entity_id === 'weather.home')?.attributes?.temperature ?? 15),
                forecast_temp: Number(states.find(e => e.entity_id === 'weather.home')?.attributes?.forecast?.[0]?.temperature ?? 15),
                energy: Number(states.find(e => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
                high_threshold: 2000,
                temp_change_rate: 0,
                now: Date.now(),
                curtain: states.find(e => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
                blind: states.find(e => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
            };
            const evals = this.engine.evaluate(context);
            if (this.debug) {
                debugOut.push(`--- ${area} ---\n` +
                    'Sensors used:\n' +
                    usedSensors.map(s => `  [${s.type}] ${s.entity_id}: ${s.value}`).join('\n') +
                    '\n' +
                    evals.map(ev => `${ev.priority}: ${ev.message_key}`).join("\n"));
            }
            // Attach usedSensors to area for later display
            return evals.length === 0 ? null : { area, ...top, usedSensors };
        }).filter(Boolean);
        const topMessages = areaMessages.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0)).slice(0, 3);
        const anySensorsUsed = areaMessages.some(areaMsg => areaMsg.usedSensors.length > 0 && areaMsg.usedSensors.some(s => s.entity_id !== '[NOT FOUND]'));
        return html `
      <h2>👻 Hausgeist sagt:</h2>
      ${!anySensorsUsed ? html `<p class="warning">⚠️ No sensors detected for any area!<br>Check your sensor configuration, area assignment, or use the visual editor to select sensors.</p>` :
            (topMessages.length === 0 ? html `<p class="ok">${this.texts['all_ok'] || 'Alles in Ordnung!'}</p>` :
                topMessages.map(e => html `<p class="${e.priority}"><b>${e.area}:</b> ${this.texts[e.message_key] || e.message_key}</p>`))}
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
      ${this.debug ? html `<div class="debug">${debugOut.join('\n\n')}</div>` : ''}
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
      color: var(--info-color, #00529b);
      background: var(--info-bg, #e6f2ff);
      border-left: 4px solid var(--info-border, #2196f3);
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
    property({ attribute: false })
], HausgeistCard.prototype, "hass", void 0);
__decorate([
    property({ type: Object })
], HausgeistCard.prototype, "config", void 0);
__decorate([
    property({ type: Boolean })
], HausgeistCard.prototype, "debug", void 0);
HausgeistCard = __decorate([
    customElement('hausgeist-card')
], HausgeistCard);
export { HausgeistCard };
