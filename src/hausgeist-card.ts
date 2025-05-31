import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { filterSensorsByArea } from './utils';
import { loadRules } from './plugin-loader';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';

const TRANSLATIONS = { de, en };


@customElement('hausgeist-card')
export class HausgeistCard extends LitElement {
  @property({ type: Object }) public hass: any;
  @property({ type: Object }) public config: { area_id?: string; overrides?: any; auto?: any; debug?: boolean; notify?: boolean; highThreshold?: number; rulesJson?: string; areas?: Array<{ area_id: string; name: string }> } = {};
  @property({ type: Boolean }) public debug = false;
  @property({ type: Boolean }) public notify = false;
  @property({ type: Number }) public highThreshold = 2000;
  @property({ type: String }) public rulesJson = '';

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
      color: var(--info-color, #0288d1);
      background: var(--info-bg, #e6f4ff);
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
// Define the keywords for sensor detection
  private engine?: RuleEngine;
  private texts: Record<string, string> = TRANSLATIONS['de'];
  private ready = false;

  private _findSensor(
    sensors: any[],
    area: string,
    usedSensors: Array<{ type: string; entity_id: string; value: any }>,
    cls: string
  ) {
    if (this.debug) {
      console.log(`[_findSensor] Looking for ${cls} in area ${area}`);
      console.log(`[_findSensor] config.overrides[${area}]:`, this.config?.overrides?.[area]);
      console.log(`[_findSensor] config.auto[${area}]:`, this.config?.auto?.[area]);
    }
    
    // 1. Check for manual override in config
    const overrideId = this.config?.overrides?.[area]?.[cls];
    if (overrideId) {
      if (this.debug) console.log(`[_findSensor] Found override for ${cls}: ${overrideId}`);
      const s = sensors.find((st) => st.entity_id === overrideId);
      if (s) {
        usedSensors.push({
          type: cls + ' (override)',
          entity_id: s.entity_id,
          value: s.state,
        });
        return s;
      }
      if (this.debug) console.log(`[_findSensor] Override sensor ${overrideId} not found in area sensors`);
    }
    
    // 2. Check for auto-detected sensor from config (as set by the editor)
    const autoId = this.config?.auto?.[area]?.[cls];
    if (autoId) {
      if (this.debug) console.log(`[_findSensor] Found auto-detected for ${cls}: ${autoId}`);
      const s = sensors.find((st) => st.entity_id === autoId);
      if (s) {
        usedSensors.push({
          type: cls + ' (auto)',
          entity_id: s.entity_id,
          value: s.state,
        });
        return s;
      }
      if (this.debug) console.log(`[_findSensor] Auto-detected sensor ${autoId} not found in area sensors`);
    }

    // 3. No sensor found (no fallback matching in the card)
    if (this.debug) {
      usedSensors.push({
        type: cls,
        entity_id: '[NOT FOUND]',
        value: 'No matching sensor found',
      });
    }
    return undefined;
  }

  async firstUpdated() {
    try {
      let rules;
      if (this.config.rulesJson) {
        rules = JSON.parse(this.config.rulesJson);
      } else {
        rules = await loadRules();
      }
      this.engine = new RuleEngine(rules);
      this.ready = true;
    } catch (error) {
      console.error('Failed to load rules:', error);
      this.ready = false;
    }
    this.requestUpdate();
  }

  setConfig(config: any) {
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
      return html`<p>Loading…</p>`;
    }
    // Debug-Flag direkt aus Config übernehmen (zur Sicherheit)
    this.debug = !!this.config?.debug;
    let debugOut: string[] = [];
    const states = Object.values(this.hass.states);
    // Prefer config.areas if present, then hass.areas, then fallback
    const areas: Array<{ area_id: string; name: string }> = (this.config.areas && this.config.areas.length)
      ? this.config.areas
      : (this.hass.areas
        ? Object.values(this.hass.areas)
        : Array.from(new Set(states.map((e: any) => e.attributes?.area_id).filter(Boolean))).map((area_id: string) => ({ area_id, name: area_id })));
    const areaIds: string[] = areas.map(a => a.area_id);
    const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
    const defaultTarget = this.config?.overrides?.default_target || 21;
    if (this.debug) {
      debugOut.push(`DEBUG: areaIds: ${JSON.stringify(areaIds)}`);
      debugOut.push(`DEBUG: states.length: ${states.length}`);
      debugOut.push(`DEBUG: Erste 10 area_id aus states:`);
      debugOut.push(states.filter((s: any) => s.attributes && s.attributes.area_id).slice(0, 10).map((s: any) => `${s.entity_id}: '${s.attributes.area_id}'`).join('\n'));
      debugOut.push('DEBUG: Erste 3 States als JSON:');
      debugOut.push(states.slice(0, 3).map((s: any) => JSON.stringify(s, null, 2)).join('\n---\n'));
    }
    // Debug-Hinweis oben anzeigen
    const debugBanner = this.debug ? html`<div style="background:#ffe; color:#a00; padding:0.5em; border:1px solid #cc0; margin-bottom:1em;">Debug active! (hausgeist-card)</div>` : '';

    const lang = this.hass.selectedLanguage || 'de';
    const langKey = lang as keyof typeof TRANSLATIONS;
    this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
    if (!this.texts || Object.keys(this.texts).length === 0) {
      this.texts = TRANSLATIONS['de'];
    }
    // Mapping areaId -> Klartextname (aus config.areas)
    const areaIdToName: Record<string, string> = {};
    areas.forEach(a => { areaIdToName[a.area_id] = a.name; });
    // Fix: add type annotations and correct scoping
    const areaMessages: { area: string; evals: any[]; usedSensors: { type: string; entity_id: string; value: any }[] }[] = areaIds.map((area: string) => {
      const sensors = filterSensorsByArea(states, area);
      const usedSensors: Array<{ type: string, entity_id: string, value: any }> = [];
      if (this.debug) {
        // Zeige alle area_id Werte aus states
        const allAreaIds = states
          .filter((s: any) => s.attributes && s.attributes.area_id)
          .map((s: any) => `${s.entity_id}: '${s.attributes.area_id}'`)
          .join('\n');
        debugOut.push(`All area_id values in states:\n${allAreaIds}`);
        // Zeige die Area-IDs, die für die Schleife verwendet werden
        debugOut.push(`areaIds used for mapping: ${JSON.stringify(areaIds)}`);
        // Zeige für die erste Area die Entity-IDs, die filterSensorsByArea zurückgibt
        if (areaIds.length > 0) {
          const sensorsForFirst = filterSensorsByArea(states, areaIds[0]);
          debugOut.push(`Entities for areaIds[0] ('${areaIds[0]}'): ${sensorsForFirst.map((s: any) => s.entity_id).join(', ')}`);
        }
        // Zeige die Anzahl der gefundenen Sensoren pro Area
        debugOut.push(`Area: ${area} | sensors.length: ${sensors.length}`);
        debugOut.push(`Sensors found by filterSensorsByArea: ${sensors.map((s: any) => s.entity_id + ' (' + (s.attributes.device_class || '-') + ')').join(', ')}`);
        
        // Neue Debug-Ausgaben für auto-Erkennung
        debugOut.push(`config.auto for area ${area}: ${JSON.stringify(this.config?.auto?.[area])}`);
        debugOut.push(`Selected sensors for area ${area}:`);
        const sensorTypes = ['temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'];
        sensorTypes.forEach((type: string) => {
          const overrideId = this.config?.overrides?.[area]?.[type];
          const autoId = this.config?.auto?.[area]?.[type];
          debugOut.push(`  ${type}: override=${overrideId || 'none'}, auto=${autoId || 'none'}`);
        });
      }
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
      const findSensor = (cls: keyof typeof SENSOR_KEYWORDS) => {
        return this._findSensor(sensors, area, usedSensors, cls);
      };
      // Ensure all required sensor types are checked for sensor presence (for usedSensors and warning logic)
      const requiredSensorTypes: (keyof typeof SENSOR_KEYWORDS)[] = [
        'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'energy', 'motion', 'occupancy', 'air_quality', 'rain', 'sun', 'adjacent', 'forecast'
      ];
      // Call findSensor for all required types to populate usedSensors, even if not used in context
      requiredSensorTypes.forEach(type => { findSensor(type); });
      const get = (cls: keyof typeof SENSOR_KEYWORDS) => {
        const s = findSensor(cls);
        return s ? Number(s.state) : undefined;
      };
      // Helper to always cast to 'any' for state lookups
      const findState = (fn: (e: any) => boolean) => {
        const found = states.find(fn);
        return found ? (found as any) : undefined;
      };

      const context: Record<string, any> = {
        target: Number(findState((e: any) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
        humidity: get('humidity'),
        co2: get('co2'),
        window: findState((e: any) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
        heating: findState((e: any) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
        motion: findState((e: any) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
        occupied: findState((e: any) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
        outside_temp: Number(findState((e: any) => e.entity_id === 'weather.home')?.attributes?.temperature ?? 15),
        forecast_temp: Number(findState((e: any) => e.entity_id === 'weather.home')?.attributes?.forecast?.[0]?.temperature ?? 15),
        energy: Number(findState((e: any) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
        high_threshold: this.highThreshold,
        temp_change_rate: 0,
        now: Date.now(),
        curtain: findState((e: any) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
        blind: findState((e: any) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
        // Ergänzungen für Regeln
        rain_soon: findState((e: any) => e.entity_id.includes('rain') && e.attributes.area_id === area)?.state === 'on' || false,
        adjacent_room_temp: Number(findState((e: any) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
        air_quality: findState((e: any) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
        forecast_sun: findState((e: any) => e.entity_id.includes('forecast') && e.entity_id.includes('sun') && e.attributes.area_id === area)?.state === 'on' || false,
      };
      const evals = this.engine ? this.engine.evaluate(context) : [];
      if (this.debug) {
        debugOut.push(
          `--- ${area} ---\n` +
          'Sensors used:\n' +
          usedSensors.map((s) => `  [${s.type}] ${s.entity_id}: ${s.value}`).join('\n') +
          `\nRules checked: ${this.engine ? this.engine['rules'].length : 0}\n` +
          `Rules matched: ${evals.length}\n` +
          evals.map((ev: any) => `${ev.priority}: ${ev.message_key}`).join("\n")
        );
      }
      // Attach usedSensors to area for later display
      return { area: areaIdToName[area] || area, evals, usedSensors };
    });
    // Top messages: only areas with at least one rule hit
    const topMessages = areaMessages.filter((a) => a.evals.length > 0)
      .map((a) => {
        // Pick highest prio message for each area
        const top = a.evals.sort((a: any, b: any) => (prioOrder[b.priority as keyof typeof prioOrder] || 0) - (prioOrder[a.priority as keyof typeof prioOrder] || 0))[0];
        if (!top) return null; // Skip if no evals
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

    return html`
      ${debugBanner}
      <h2>👻 Hausgeist sagt:</h2>
      ${!anySensorsUsed ? html`<p class="warning">⚠️ No sensors detected for any area!<br>Check your sensor configuration, area assignment, or use the visual editor to select sensors.</p>` :
        (!anyRulesApplied ? html`<p class="warning">⚠️ No rules applied (no comparisons made for any area).</p>` :
        topMessages.map(e => html`<p class="${e.priority}"><b>${e.area}:</b> ${this.texts?.[e.message_key] || `Missing translation: ${e.message_key}`}</p>`))}
      <div class="debug" style="white-space:pre-wrap; background:#f5f5f5; color:#333; font-size:0.95em; margin-top:1em;">${debugOut.join('\n\n')}</div>
      ${this.debug ? html`
        <div class="sensors-used">
          <b>Sensors used:</b>
          <ul>
            ${areaMessages.map(areaMsg => html`
              <li><b>${areaMsg.area}:</b>
                <ul>
                  ${areaMsg.usedSensors.map(s => html`<li>[${s.type}] ${s.entity_id}: ${s.value}</li>`)}
                </ul>
              </li>
            `)}
          </ul>
        </div>
      ` : ''}
    `;
  }
}