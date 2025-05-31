import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { filterSensorsByArea } from './utils';
import { loadRules } from './plugin-loader';
import { SENSOR_KEYWORDS } from './sensor-keywords';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';
import { styles } from './styles';

const TRANSLATIONS = { de, en };


@customElement('hausgeist-card')
export class HausgeistCard extends LitElement {
  @property({ type: Object }) public hass: any;
  @property({ type: Object }) public config: { 
    area_id?: string; 
    overrides?: any; 
    auto?: any; 
    debug?: boolean; 
    notify?: boolean; 
    highThreshold?: number; 
    rulesJson?: string; 
    areas?: Array<{ area_id: string; name: string; enabled?: boolean }>;
    weather_entity?: string;
    default_target?: number;
  } = {};
  @property({ type: Boolean }) public debug = false;
  @property({ type: Boolean }) public notify = false;
  @property({ type: Number }) public highThreshold = 2000;
  @property({ type: String }) public rulesJson = '';


  static styles = styles;

  // Support the editor UI
  public static async getConfigElement() {
    return document.createElement('hausgeist-card-editor');
  }

  // Provide default configuration
  public static getStubConfig() {
    return {
      debug: false,
      notify: false,
      highThreshold: 2000,
      weather_entity: 'weather.home',
      default_target: 21
    };
  }

  // Add required setConfig method for custom cards
  setConfig(config: any) {
    // Store the configuration
    this.config = config;
    
    // Set debug flag from config
    this.debug = config.debug ?? false;
    
    // Set notification preference from config
    this.notify = config.notify ?? false;
    
    // Set high threshold from config
    this.highThreshold = config.highThreshold ?? 2000;
    
    // Set rules JSON if provided
    if (config.rulesJson) {
      this.rulesJson = config.rulesJson;
    }
  }


  private engine?: RuleEngine;
  private texts: Record<string, string> = TRANSLATIONS['de'];
  private ready = false;

  async connectedCallback() {
    super.connectedCallback();
    
    try {
      if (this.debug) {
        console.log('[Hausgeist] Connected callback starting...');
      }

      let rules;
      if (this.rulesJson) {
        if (this.debug) {
          console.log('[Hausgeist] Using provided rulesJson');
        }
        rules = JSON.parse(this.rulesJson);
      } else {
        if (this.debug) {
          console.log('[Hausgeist] Loading rules from plugin-loader');
        }
        rules = await loadRules();
      }
      
      if (!rules || !Array.isArray(rules)) {
        console.error('[Hausgeist] Invalid rules format:', rules);
        this.ready = false;
        return;
      }

      if (this.debug) {
        console.log('[Hausgeist] Loaded rules:', rules);
      }

      this.engine = new RuleEngine(rules);
      this.ready = true;
      
      if (this.debug) {
        console.log('[Hausgeist] Initialization complete, requesting update');
      }
      
      this.requestUpdate();
    } catch (error) {
      console.error('[Hausgeist] Error initializing card:', error);
      this.ready = false;
    }
  }

  // Find sensor by type in area, with overrides and auto-detection
  private _findSensor(
    sensors: Array<{ entity_id: string; state: any; attributes: { [key: string]: any } }>,
    area: string,
    usedSensors: Array<{ type: string; entity_id: string; value: any }>,
    sensorType: string
  ) {
    if (this.debug) {
      console.log(`[_findSensor] Looking for ${sensorType} in area ${area}`);
      console.log(`[_findSensor] config.overrides[${area}]:`, this.config?.overrides?.[area]);
      console.log(`[_findSensor] config.auto[${area}]:`, this.config?.auto?.[area]);
    }

    // 1. Check for manual override in config
    const overrideId = this.config?.overrides?.[area]?.[sensorType];
    if (overrideId) {
      const sensor = sensors.find((s) => s.entity_id === overrideId);
      if (sensor) {
        usedSensors.push({
          type: `${sensorType} (override)`,
          entity_id: sensor.entity_id,
          value: sensor.state
        });
        return sensor;
      }
      if (this.debug) console.log(`[_findSensor] Override sensor ${overrideId} not found`);
    }

    // 2. Check auto-detected sensor from config
    const autoId = this.config?.auto?.[area]?.[sensorType];
    if (autoId) {
      const sensor = sensors.find((s) => s.entity_id === autoId);
      if (sensor) {
        usedSensors.push({
          type: `${sensorType} (auto)`,
          entity_id: sensor.entity_id,
          value: sensor.state
        });
        return sensor;
      }
      if (this.debug) console.log(`[_findSensor] Auto sensor ${autoId} not found`);
    }

    // 3. Not found
    if (this.debug) {
      usedSensors.push({
        type: sensorType,
        entity_id: '[NOT FOUND]',
        value: 'No matching sensor found'
      });
    }
    return undefined;
  }

  render() {
    if (!this.config) {
      return html`<ha-card>
        <div class="card-content">
          <p>Invalid configuration</p>
        </div>
      </ha-card>`;
    }

    if (!this.hass) {
      return html`<ha-card>
        <div class="card-content">
          <p>Home Assistant not available</p>
        </div>
      </ha-card>`;
    }

    if (!this.engine || !this.ready) {
      return html`<ha-card>
        <div class="card-content">
          <p>Loading...</p>
        </div>
      </ha-card>`;
    }

    const debugBanner = this.debug ? html`<p class="debug-banner">🛠️ Debug mode active</p>` : '';
    const debugOut: string[] = [];

    const { states } = this.hass;
    
    // If no areas are configured, use all areas from Home Assistant
    let areas = this.config.areas || [];
    if (areas.length === 0 && this.hass.areas) {
      areas = Object.entries(this.hass.areas).map(([id, area]: [string, any]) => ({ 
        area_id: id, 
        name: area.name || id,
        enabled: true 
      }));
    }
    
    // Filter enabled areas
    areas = areas.filter(a => a.enabled !== false);
    
    // If no areas are enabled, show a message
    if (areas.length === 0) {
      return html`<ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <p>No areas enabled. Please enable at least one area in the card configuration.</p>
        </div>
      </ha-card>`;
    }

    const areaIds: string[] = areas.map(a => a.area_id);
    const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
    const defaultTarget = this.config?.overrides?.default_target || 21;
    const weatherEntity = this.config.weather_entity || 'weather.home';


    if (this.debug) {
      debugOut.push(`DEBUG: Enabled areas: ${JSON.stringify(areas.map(a => a.name || a.area_id))}`);
      debugOut.push(`DEBUG: Weather entity: ${weatherEntity}`);
    }


    const lang = this.hass.selectedLanguage || 'de';
    const langKey = lang as keyof typeof TRANSLATIONS;
    this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
    if (!this.texts || Object.keys(this.texts).length === 0) {
      this.texts = TRANSLATIONS['de'];
    }

    // Mapping areaId -> Klartextname (aus config.areas)
    const areaIdToName: Record<string, string> = {};
    areas.forEach(a => { areaIdToName[a.area_id] = a.name; });

    const areaMessages: { area: string; evals: any[]; usedSensors: { type: string; entity_id: string; value: any }[] }[] = areaIds.map((area: string) => {
      const sensors = filterSensorsByArea(states, area);

      const usedSensors: Array<{ type: string, entity_id: string, value: any }> = [];

      if (this.debug) {
        const sensors = filterSensorsByArea(states, area);
        debugOut.push(`Processing area: ${area}`);
        debugOut.push(`Available sensors: ${sensors.map((s: any) => s.entity_id).join(', ')}`);
        debugOut.push(`Configured overrides: ${JSON.stringify(this.config?.overrides?.[area])}`);
        debugOut.push(`Auto-detected sensors: ${JSON.stringify(this.config?.auto?.[area])}`);
      }

      // Use imported SENSOR_KEYWORDS from sensor-keywords.ts
      const findSensor = (cls: keyof typeof SENSOR_KEYWORDS) => {
        return this._findSensor(Object.values(this.hass.states), area, usedSensors, cls);
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
      // Get target temperature, default to config override or 21°C
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
      return { area: areaIdToName[area] || area, evals, usedSensors };
    });

    // Only show areas with rule matches
    const topMessages = areaMessages
      .filter((a) => a.evals.length > 0)
      .map((a) => {
        // Pick highest priority message for each area
        const top = a.evals.sort((a: any, b: any) => 
          (prioOrder[b.priority as keyof typeof prioOrder] || 0) - (prioOrder[a.priority as keyof typeof prioOrder] || 0)
        )[0];
        if (!top || !top.message_key) {
          return undefined; // Skip if no valid message
        }
        if (this.debug) {
          debugOut.push(`Top message for ${a.area}: ${top.priority} - ${top.message_key}`);
        }
        return { area: a.area, ...top, usedSensors: a.usedSensors };
      })
      .filter((e): e is { area: string; message_key: string; priority: string; usedSensors: any[] } => !!e);

    const anySensorsUsed = areaMessages.some((areaMsg) => 
      areaMsg.usedSensors?.some((s) => s.entity_id !== '[NOT FOUND]')
    );
    const anyRulesApplied = areaMessages.some((a) => a.evals.length > 0);

    return html`
      ${debugBanner}
      <ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist sagt:</h2>
          ${!anySensorsUsed 
            ? html`<p class="warning">⚠️ Keine Sensoren in den aktivierten Bereichen gefunden!<br>Bitte überprüfen Sie die Sensor-Konfiguration oder weisen Sie den Sensoren die entsprechenden Bereiche zu.</p>` 
            : !anyRulesApplied 
              ? html`<p class="info">ℹ️ Alle Bereiche in Ordnung - keine Handlungsempfehlungen.</p>` 
              : html`
                ${topMessages.map(e => html`
                  <p class="${e.priority}">
                    <b>${e.area}:</b> ${this.texts?.[e.message_key] || `Fehlende Übersetzung: ${e.message_key}`}
                  </p>
                `)}
              `
          }
          ${this.debug ? html`
            <div class="debug">${debugOut.join('\n\n')}</div>
            <div class="sensors-used">
              <b>Verwendete Sensoren:</b>
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
        </div>
      </ha-card>
    `;
  }

  // Build evaluation context for rules with weather data and sensor values
  private _buildContext(
    area: string, 
    usedSensors: Array<{ type: string; entity_id: string; value: any }>, 
    states: any[],
    weatherEntity: string,
    defaultTarget: number
  ): Record<string, any> {
    const findSensor = (type: string) => {
      return this._findSensor(Object.values(this.hass.states), area, usedSensors, type);
    };

    const get = (type: string) => {
      const s = findSensor(type);
      return s ? Number(s.state) : undefined;
    };

    const findState = (fn: (e: any) => boolean) => {
      const found = states.find(fn);
      return found ? found : undefined;
    };

    // Get weather data
    const weather = findState((e: any) => e.entity_id === weatherEntity);
    const weatherAttributes = weather?.attributes || {};
    const forecast = weatherAttributes.forecast?.[0] || {};

    const target = this._getTargetTemperature(area, states, defaultTarget);

    return {
      debug: this.debug,
      target,
      temp: get('temperature'),
      heating_level: get('heating_level'),
      humidity: get('humidity'),
      co2: get('co2'),
      window: findState((e: any) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
      heating: findState((e: any) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
      motion: findState((e: any) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
      occupied: findState((e: any) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
      energy: Number(findState((e: any) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
      high_threshold: this.highThreshold,
      temp_change_rate: 0,
      now: Date.now(),
      curtain: findState((e: any) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
      blind: findState((e: any) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,

      // Weather data directly from weather entity
      outside_temp: Number(weatherAttributes.temperature ?? 15),
      forecast_temp: Number(forecast.temperature ?? 15),
      rain_soon: (forecast.precipitation ?? 0) > 0,
      forecast_sun: forecast.condition === 'sunny',
      
      // Additional sensor data
      adjacent_room_temp: Number(findState((e: any) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
      air_quality: findState((e: any) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
    };
  }

  private _getTargetTemperature(area: string, states: any[], defaultTarget: number): number {
    try {
      // 1. Prüfe auf Override in den Einstellungen
      const override = this.config?.overrides?.[area]?.target;
      if (override) {
        const overrideSensor = states.find(s => s.entity_id === override);
        if (overrideSensor) {
          const value = Number(overrideSensor.state);
          if (!isNaN(value)) {
            return value;
          }
        }
      }

      // 2. Suche nach einem Zieltemperatur-Sensor im Raum
      const targetSensor = states.find(s => 
        s.attributes?.area_id === area && (
          // Prüfe auf climate.* Entities
          (s.entity_id.startsWith('climate.') && s.attributes?.temperature !== undefined) ||
          // Prüfe auf dedizierte Zieltemperatur-Sensoren
          s.entity_id.includes('target_temp') ||
          s.entity_id.includes('temperature_target') ||
          s.entity_id.includes('setpoint')
        )
      );

      if (targetSensor) {
        // Bei climate Entities nehmen wir temperature aus den Attributen
        if (targetSensor.entity_id.startsWith('climate.')) {
          const value = Number(targetSensor.attributes.temperature);
          if (!isNaN(value)) {
            return value;
          }
        }
        // Sonst den State
        const value = Number(targetSensor.state);
        if (!isNaN(value)) {
          return value;
        }
      }
    } catch (error) {
      console.error('Error getting target temperature:', error);
    }

    // 3. Fallback auf den Default-Wert
    return this.config.default_target || defaultTarget;
  }
}