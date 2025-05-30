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
      background: var(--card-background-color, #fff);
      border-radius: 1em;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      padding: 1.5em;
      font-family: inherit;
    }
    h2 {
      margin-top: 0;
      font-size: 1.3em;
      color: #4a4a4a;
    }
    p.warning {
      color: #b85c00;
      background: #fff7e6;
      border-left: 4px solid #ffb300;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      margin: 0.5em 0;
    }
    p.info {
      color: #00529b;
      background: #e6f2ff;
      border-left: 4px solid #2196f3;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      margin: 0.5em 0;
    }
    p.ok {
      color: #357a38;
      background: #e6f9e6;
      border-left: 4px solid #4caf50;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      margin: 0.5em 0;
    }
  `;

  private engine!: RuleEngine;
  private texts: Record<string,string> = {};

  async firstUpdated() {
    const rules = await loadRules();
    this.engine = new RuleEngine(rules);
  }

  setConfig(config: any) {
    if (!config.area_id) throw new Error('area_id fehlt');
    this.config = config;
  }

  render() {
    const area = this.config.area_id;
    const lang = this.hass.selectedLanguage || 'de';
    if (!this.texts || Object.keys(this.texts).length === 0) {
      this.texts = TRANSLATIONS[lang] || TRANSLATIONS['de'];
    }
    // Kontext-Objekt für die RuleEngine bauen
    const states = Object.values(this.hass.states);
    const sensors = filterSensorsByArea(states, area);
    // Hilfsfunktion für Wert aus Sensor holen
    const get = (cls: string) => {
      const s = sensors.find(st => (st as any).attributes.device_class === cls);
      return s ? Number((s as any).state) : undefined;
    };
    // Kontextdaten extrahieren
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
      temp_change_rate: 0, // Hier ggf. Logik für Temperaturänderung einbauen
      now: Date.now(),
    };
    const evals = this.engine.evaluate(context);
    // Priorität sortieren und top 3
    const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
    // evals enthält jetzt {message_key, priority}, daher RuleEngine anpassen!
    const top = evals.sort((a,b) => (prioOrder[b.priority]||0) - (prioOrder[a.priority]||0)).slice(0,3);
    return html`
      <h2>👻 Hausgeist sagt:</h2>
      ${top.length === 0 ? html`<p class="ok">${this.texts['all_ok'] || 'Alles in Ordnung!'}</p>` :
        top.map(e => html`<p class="${e.priority}">${this.texts[e.message_key] || e.message_key}</p>`)}
    `;
  }
}