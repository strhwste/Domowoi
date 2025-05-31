var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { filterSensorsByArea } from './utils';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';
import { styles } from './styles';
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
    // Find sensor by type in area, with overrides and auto-detection
    _findSensor(sensors, area, usedSensors, sensorType) {
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
            if (this.debug)
                console.log(`[_findSensor] Override sensor ${overrideId} not found`);
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
            if (this.debug)
                console.log(`[_findSensor] Auto sensor ${autoId} not found`);
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
        if (!this.engine || !this.ready) {
            return html `<div>Loading...</div>`;
        }
        const debugBanner = this.debug ? html `<p class="debug-banner">🛠️ Debug mode active</p>` : '';
        const debugOut = [];
        const { states } = this.hass;
        const areas = (this.config.areas || []).filter(a => a.enabled !== false);
        const areaIds = areas.map(a => a.area_id);
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        const defaultTarget = this.config?.overrides?.default_target || 21;
        const weatherEntity = this.config.weather_entity || 'weather.home';
        if (this.debug) {
            debugOut.push(`DEBUG: Enabled areas: ${JSON.stringify(areas.map(a => a.name || a.area_id))}`);
            debugOut.push(`DEBUG: Weather entity: ${weatherEntity}`);
        }
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS['de'];
        }
        // Mapping areaId -> Klartextname (aus config.areas)
        const areaIdToName = {};
        areas.forEach(a => { areaIdToName[a.area_id] = a.name; });
        const areaMessages = areaIds.map((area) => {
            const sensors = filterSensorsByArea(states, area);
            const usedSensors = [];
            if (this.debug) {
                const sensors = filterSensorsByArea(states, area);
                debugOut.push(`Processing area: ${area}`);
                debugOut.push(`Available sensors: ${sensors.map((s) => s.entity_id).join(', ')}`);
                debugOut.push(`Configured overrides: ${JSON.stringify(this.config?.overrides?.[area])}`);
                debugOut.push(`Auto-detected sensors: ${JSON.stringify(this.config?.auto?.[area])}`);
            }
            // Use imported SENSOR_KEYWORDS from sensor-keywords.ts
            const findSensor = (cls) => {
                return this._findSensor(Object.values(this.hass.states), area, usedSensors, cls);
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
            // Get target temperature, default to config override or 21°C
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
            return { area: areaIdToName[area] || area, evals, usedSensors };
        });
        // Only show areas with rule matches
        const topMessages = areaMessages
            .filter((a) => a.evals.length > 0)
            .map((a) => {
            // Pick highest priority message for each area
            const top = a.evals.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0))[0];
            if (!top || !top.message_key) {
                return undefined; // Skip if no valid message
            }
            if (this.debug) {
                debugOut.push(`Top message for ${a.area}: ${top.priority} - ${top.message_key}`);
            }
            return { area: a.area, ...top, usedSensors: a.usedSensors };
        })
            .filter((e) => !!e);
        const anySensorsUsed = areaMessages.some((areaMsg) => areaMsg.usedSensors?.some((s) => s.entity_id !== '[NOT FOUND]'));
        const anyRulesApplied = areaMessages.some((a) => a.evals.length > 0);
        return html `
      ${debugBanner}
      <h2>👻 Hausgeist sagt:</h2>
      ${!anySensorsUsed
            ? html `<p class="warning">⚠️ No sensors detected for any area!<br>Check your sensor configuration, area assignment, or use the visual editor to select sensors.</p>`
            : !anyRulesApplied
                ? html `<p class="warning">⚠️ No rules applied (no comparisons made for any area).</p>`
                : topMessages.map(e => html `<p class="${e.priority}"><b>${e.area}:</b> ${this.texts?.[e.message_key] || `Missing translation: ${e.message_key}`}</p>`)}
      ${this.debug ? html `
        <div class="debug">${debugOut.join('\n\n')}</div>
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
    // Build evaluation context for rules with weather data and sensor values
    _buildContext(area, usedSensors, states, weatherEntity, defaultTarget) {
        const findSensor = (type) => {
            return this._findSensor(Object.values(this.hass.states), area, usedSensors, type);
        };
        const get = (type) => {
            const s = findSensor(type);
            return s ? Number(s.state) : undefined;
        };
        const findState = (fn) => {
            const found = states.find(fn);
            return found ? found : undefined;
        };
        // Get weather data
        const weather = findState((e) => e.entity_id === weatherEntity);
        const weatherAttributes = weather?.attributes || {};
        const forecast = weatherAttributes.forecast?.[0] || {};
        return {
            debug: this.debug,
            target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
            temp: get('temperature'),
            humidity: get('humidity'),
            co2: get('co2'),
            window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
            heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
            motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
            occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
            energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
            high_threshold: this.highThreshold,
            temp_change_rate: 0,
            now: Date.now(),
            curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
            blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
            // Weather data directly from weather entity
            outside_temp: Number(weatherAttributes.temperature ?? 15),
            forecast_temp: Number(forecast.temperature ?? 15),
            rain_soon: (forecast.precipitation ?? 0) > 0,
            forecast_sun: forecast.condition === 'sunny',
            // Additional sensor data
            adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
            air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
        };
    }
    setConfig(config) {
        this.config = config;
        this.debug = !!config?.debug;
        this.notify = !!config?.notify;
        this.highThreshold = typeof config?.highThreshold === 'number' ? config.highThreshold : 2000;
        this.rulesJson = config?.rulesJson || '';
        this.requestUpdate();
    }
};
HausgeistCard.styles = styles;
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
