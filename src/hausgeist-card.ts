import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { filterSensorsByArea } from './utils';
import { loadRules } from './plugin-loader';
import en from '../translations/en.json';
import de from '../translations/de.json';

const TRANSLATIONS = { de, en };

@customElement('hausgeist-card')
export class HausgeistCard extends LitElement {
  @property({ attribute: false }) public hass: any;
  @property({ type: Object }) public config!: { area_id: string; overrides?: any };

  static styles = css`
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

  @property({ type: Boolean }) debug = false;
  private engine!: RuleEngine;
  private texts: Record<string,string> = {};
  private ready = false;

  async firstUpdated() {
    const rules = await loadRules();
    this.engine = new RuleEngine(rules);
    this.ready = true;
    this.requestUpdate();
  }

  setConfig(config: any) {
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
      return html`<p>Loading…</p>`;
    }
    const lang = this.hass.selectedLanguage || 'de';
    const langKey = lang as keyof typeof TRANSLATIONS;
    if (!this.texts || Object.keys(this.texts).length === 0) {
      this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
    }
    const states = Object.values(this.hass.states);
    const areaIds = Array.from(new Set(states.map(e => (e as any).attributes?.area_id).filter(Boolean)));
    const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
    let debugOut: string[] = [];
    const areaMessages = areaIds.map(area => {
      const sensors = filterSensorsByArea(states, area);
      // Multilingual sensor keywords for fallback
      const SENSOR_KEYWORDS: Record<string, string[]> = {
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
      // Helper to find a sensor by device_class or multilingual fallback
      function findSensor(cls: keyof typeof SENSOR_KEYWORDS) {
        let s = sensors.find(st => (st as any).attributes.device_class === cls);
        if (s) return s;
        // Fallback: search by friendly_name or entity_id for keywords
        const keywords = SENSOR_KEYWORDS[cls] || [];
        return sensors.find(st => {
          const name = ((st as any).attributes.friendly_name || '').toLowerCase();
          const eid = (st as any).entity_id.toLowerCase();
          return keywords.some((k: string) => name.includes(k) || eid.includes(k));
        });
      }
      const get = (cls: keyof typeof SENSOR_KEYWORDS) => {
        const s = findSensor(cls);
        return s ? Number((s as any).state) : undefined;
      };
      const context: Record<string, any> = {
        temp: get('temperature'),
        humidity: get('humidity'),
        co2: get('co2'),
        target: Number((states.find(e => (e as any).entity_id.endsWith('_temperature_target') && (e as any).attributes.area_id === area) as any)?.state ?? 21),
        window: (states.find(e => (e as any).entity_id.includes('window') && (e as any).attributes.area_id === area) as any)?.state,
        heating: (states.find(e => (e as any).entity_id.includes('heating') && (e as any).attributes.area_id === area) as any)?.state,
        motion: (states.find(e => (e as any).entity_id.includes('motion') && (e as any).attributes.area_id === area) as any)?.state === 'on',
        occupied: (states.find(e => (e as any).entity_id.includes('occupancy') && (e as any).attributes.area_id === area) as any)?.state === 'on',
        outside_temp: Number((states.find(e => (e as any).entity_id === 'weather.home') as any)?.attributes?.temperature ?? 15),
        forecast_temp: Number((states.find(e => (e as any).entity_id === 'weather.home') as any)?.attributes?.forecast?.[0]?.temperature ?? 15),
        energy: Number((states.find(e => (e as any).entity_id.includes('energy') && (e as any).attributes.area_id === area) as any)?.state ?? 0),
        high_threshold: 2000,
        temp_change_rate: 0,
        now: Date.now(),
        curtain: (states.find(e => (e as any).entity_id.includes('curtain') && (e as any).attributes.area_id === area) as any)?.state,
        blind: (states.find(e => (e as any).entity_id.includes('blind') && (e as any).attributes.area_id === area) as any)?.state,
      };
      const evals = this.engine.evaluate(context);
      if (this.debug) {
        debugOut.push(`--- ${area} ---\n` + evals.map(ev => `${ev.priority}: ${ev.message_key}`).join("\n"));
      }
      if (evals.length === 0) return null;
      const top = evals.sort((a, b) => (prioOrder[b.priority as keyof typeof prioOrder] || 0) - (prioOrder[a.priority as keyof typeof prioOrder] || 0))[0];
      return { area, ...top };
    }).filter(Boolean) as Array<{ area: string; message_key: string; priority: string }>;
    const topMessages = areaMessages.sort((a, b) => (prioOrder[b.priority as keyof typeof prioOrder] || 0) - (prioOrder[a.priority as keyof typeof prioOrder] || 0)).slice(0, 3);
    return html`
      <h2>👻 Hausgeist sagt:</h2>
      ${topMessages.length === 0 ? html`<p class="ok">${this.texts['all_ok'] || 'Alles in Ordnung!'}</p>` :
        topMessages.map(e => html`<p class="${e.priority}"><b>${e.area}:</b> ${this.texts[e.message_key] || e.message_key}</p>`)}
      ${this.debug ? html`<div class="debug">${debugOut.join('\n\n')}</div>` : ''}
    `;
  }
}