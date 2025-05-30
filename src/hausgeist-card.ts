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
    // Find all unique area_ids from entities
    const areaIds = Array.from(new Set(states.map(e => (e as any).attributes?.area_id).filter(Boolean)));
    // For each area, evaluate rules and pick the most important message
    const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
    const areaMessages = areaIds.map(area => {
      const sensors = filterSensorsByArea(states, area);
      const get = (cls: string) => {
        const s = sensors.find(st => (st as any).attributes.device_class === cls);
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
      };
      const evals = this.engine.evaluate(context);
      if (evals.length === 0) return null;
      // Pick the most important message for this area
      const top = evals.sort((a, b) => (prioOrder[b.priority as keyof typeof prioOrder] || 0) - (prioOrder[a.priority as keyof typeof prioOrder] || 0))[0];
      return { area, ...top };
    }).filter(Boolean) as Array<{ area: string; message_key: string; priority: string }>;
    // Sort all area messages by priority and pick top 3
    const topMessages = areaMessages.sort((a, b) => (prioOrder[b.priority as keyof typeof prioOrder] || 0) - (prioOrder[a.priority as keyof typeof prioOrder] || 0)).slice(0, 3);
    return html`
      <h2>👻 Hausgeist sagt:</h2>
      ${topMessages.length === 0 ? html`<p class="ok">${this.texts['all_ok'] || 'Alles in Ordnung!'}</p>` :
        topMessages.map(e => html`<p class="${e.priority}"><b>${e.area}:</b> ${this.texts[e.message_key] || e.message_key}</p>`)}
    `;
  }
}