var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { SENSOR_KEYWORDS } from './sensor-keywords';
let HausgeistCardEditor = class HausgeistCardEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.config = {};
        this._hass = undefined;
        this.testValues = {};
        this.rulesJson = '';
        this.notify = false;
        this.highThreshold = 2000;
        this._lastAreas = [];
        // Use arrow function to auto-bind 'this'
        this._onDebugChange = (e) => {
            const debug = e.target.checked;
            this.config = { ...this.config, debug };
            this._configChanged();
        };
    }
    _autodetect(areaId, type) {
        const states = Object.values(this.hass?.states || {});
        // 1. device_class
        let s = states.find((st) => st.attributes?.area_id === areaId && st.attributes?.device_class === type);
        if (s && s.entity_id)
            return s.entity_id;
        // 2. keywords from centralized list
        const kw = SENSOR_KEYWORDS[type] || [type];
        s = states.find((st) => st.attributes?.area_id === areaId && kw.some(k => st.entity_id.toLowerCase().includes(k) ||
            (st.attributes.friendly_name || '').toLowerCase().includes(k)));
        if (s && s.entity_id)
            return s.entity_id;
        // 3. fallback: area name
        const areaName = (this.hass?.areas && this.hass.areas[areaId]?.name?.toLowerCase()) || areaId.toLowerCase();
        s = states.find((st) => (st.entity_id.toLowerCase().includes(areaName) ||
            (st.attributes.friendly_name || '').toLowerCase().includes(areaName)) && kw.some(k => st.entity_id.toLowerCase().includes(k)));
        return s && s.entity_id ? s.entity_id : undefined;
    }
    setConfig(config) {
        this.config = config;
    }
    // Getter and setter for hass
    get hass() {
        return this._hass;
    }
    set hass(hass) {
        this._hass = hass;
        this.requestUpdate();
    }
    // Handle sensor selection change for a specific area and type
    _onAreaSensorChange(areaId, type, e) {
        const entity_id = e.target.value;
        const overrides = { ...(this.config.overrides || {}) };
        overrides[areaId] = { ...(overrides[areaId] || {}), [type]: entity_id };
        this.config = { ...this.config, overrides };
        this._configChanged();
    }
    // Dispatch a custom event to notify that the config has changed
    _configChanged() {
        // Always include the current areas in the config
        if (this._lastAreas && Array.isArray(this._lastAreas)) {
            // Build auto-mapping: auto[area_id][type] = entity_id (wie im Editor angezeigt)
            const auto = {};
            const areas = this._lastAreas;
            const sensorTypes = [
                'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'
            ];
            // Debug: Show all states with their area_ids
            if (this.config.debug) {
                const states = Object.values(this.hass?.states || {});
                console.log('All states with area_ids:', states.filter((s) => s.attributes?.area_id)
                    .map((s) => `${s.entity_id} (${s.attributes.area_id})`));
            }
            for (const area of areas) {
                auto[area.area_id] = {};
                for (const type of sensorTypes) {
                    const autoId = this._autodetect(area.area_id, type);
                    if (autoId)
                        auto[area.area_id][type] = autoId;
                    // Debug: Log each detected sensor
                    if (this.config.debug) {
                        console.log(`Auto-detected for ${area.area_id} - ${type}: ${autoId || 'none'}`);
                    }
                }
            }
            // Debug: Log the final auto config
            if (this.config.debug) {
                console.log('Final auto config:', JSON.stringify(auto, null, 2));
            }
            this.config = { ...this.config, areas: this._lastAreas, auto };
        }
        const event = new CustomEvent('config-changed', {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
    // Handle test value changes for a specific area and type
    handleTestValueChange(areaId, type, e) {
        const value = e.target.value;
        this.testValues = { ...this.testValues, [areaId + '_' + type]: value };
        this.requestUpdate();
    }
    // Handle changes in the rules JSON text area
    handleRulesChange(e) {
        this.rulesJson = e.target.value;
        this._configChanged();
    }
    // Handle changes in the notification checkbox
    handleNotifyChange(e) {
        this.notify = e.target.checked;
        this._configChanged();
    }
    // Handle changes in the high threshold input
    handleThresholdChange(e) {
        this.highThreshold = Number(e.target.value);
        this._configChanged();
    }
    // Handle area enable/disable
    _onAreaEnabledChange(areaId, e) {
        const checked = e.target.checked;
        const areas = [...(this.config.areas || this._lastAreas.map(a => ({ ...a })))];
        const areaIndex = areas.findIndex(a => a.area_id === areaId);
        if (areaIndex >= 0) {
            areas[areaIndex] = { ...areas[areaIndex], enabled: checked };
        }
        else {
            areas.push({ area_id: areaId, name: areaId, enabled: checked });
        }
        this.config = { ...this.config, areas };
        this._configChanged();
    }
    // Render the editor UI
    render() {
        const hass = this.hass;
        // Find all Weather Entities
        const weatherEntities = Object.entries(hass?.states || {})
            .filter(([entity_id, state]) => entity_id.startsWith('weather.'))
            .map(([entity_id, state]) => ({
            entity_id,
            name: state.attributes?.friendly_name || entity_id
        }));
        const areas = hass?.areas
            ? Object.values(hass.areas)
            : Array.from(new Set(Object.values(hass?.states || {}).map((e) => e.attributes?.area_id).filter(Boolean))).map((area_id) => ({ area_id, name: area_id }));
        this._lastAreas = areas;
        const states = Object.values(hass?.states || {});
        // Nur die Sensoren die wir pro Raum brauchen
        const requiredSensorTypes = [
            'temperature', // Raumtemperatur
            'humidity', // Luftfeuchtigkeit
            'co2', // CO2-Gehalt
            'window', // Fenster-Status
            'door', // Tür-Status
            'curtain', // Vorhang-Status
            'blind', // Rolladen-Status
            'heating', // Heizungs-Status (an/aus)
            'heating_level', // Heizungs-Level (0-100%)
            'target' // Zieltemperatur
        ];
        const missingSensorsPerArea = areas.map(area => {
            const missing = requiredSensorTypes.filter(type => {
                const found = states.some((e) => e.attributes?.area_id === area.area_id && (type === 'heating' || type === 'heating_level'
                    ? ['heating', 'heizung', 'thermostat', 'climate'].some(k => e.entity_id.toLowerCase().includes(k))
                    : e.attributes?.device_class === type || (e.entity_id.toLowerCase().includes(type))));
                return !found;
            });
            return { area, missing };
        });
        // Styles einbinden
        return html `
      <style>
      .card-config {
        padding: 1em;
      }
      hr { margin: 1em 0; border: none; border-top: 1px solid #ddd; }
      select { min-width: 200px; }
      li { margin: 0.2em 0; }
      .sensor-row {
        display: flex;
        align-items: center;
        gap: 0.5em;
        margin-bottom: 0.5em;
      }
      .target-row {
        margin-bottom: 1em;
      }
      .sensor-label {
        min-width: 120px;
        font-weight: bold;
      }
      .sensor-select {
        flex-grow: 1;
      }
      .help-text {
        color: #666;
        font-size: 0.9em;
        margin-top: 0.3em;
      }
      .weather-info {
        margin-top: 0.5em;
        font-size: 0.95em;
        color: #333;
      }
      </style>
      <div class="card-config">
      <!-- Debug Mode -->
      <label>
        <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
        Debug mode
      </label>

      <!-- Weather Entity Selection -->
      <div style="margin-top:1em;">
        <b>Weather Entity:</b>
        <select 
        @change=${(e) => {
            this.config = {
                ...this.config,
                weather_entity: e.target.value
            };
            this._configChanged();
        }}
        >
        ${weatherEntities.map(entity => html `
          <option 
          value="${entity.entity_id}" 
          ?selected=${(this.config.weather_entity || 'weather.home') === entity.entity_id}
          >
          ${entity.name} (${entity.entity_id})
          </option>
        `)}
        </select>
        ${(() => {
            const selectedWeather = hass?.states?.[this.config.weather_entity || 'weather.home'];
            if (!selectedWeather)
                return '';
            const temp = selectedWeather.attributes?.temperature;
            const tempUnit = selectedWeather.attributes?.temperature_unit || selectedWeather.attributes?.unit_of_measurement || '°C';
            // Rain: try precipitation, precipitation_probability, or forecast
            let rain = selectedWeather.attributes?.precipitation;
            let rainUnit = selectedWeather.attributes?.precipitation_unit || 'mm';
            if (rain === undefined && selectedWeather.attributes?.forecast && Array.isArray(selectedWeather.attributes.forecast) && selectedWeather.attributes.forecast.length > 0) {
                rain = selectedWeather.attributes.forecast[0].precipitation ?? selectedWeather.attributes.forecast[0].rain;
                rainUnit = selectedWeather.attributes.forecast[0].precipitation_unit || rainUnit;
            }
            // Precipitation probability
            let rainProb = selectedWeather.attributes?.precipitation_probability;
            if (rainProb === undefined && selectedWeather.attributes?.forecast && Array.isArray(selectedWeather.attributes.forecast) && selectedWeather.attributes.forecast.length > 0) {
                rainProb = selectedWeather.attributes.forecast[0].precipitation_probability;
            }
            return html `
          <div class="weather-info">
            Temperatur: ${temp !== undefined ? `${temp} ${tempUnit}` : 'n/a'}
            <br />
            Regen: ${rain !== undefined ? `${rain} ${rainUnit}` : 'n/a'}
            ${rainProb !== undefined ? html `<br />Regenwahrscheinlichkeit: ${rainProb}%` : ''}
          </div>
          `;
        })()}
      </div>

      <!-- Default Target Temperature -->
      <div style="margin-top:1em;">
        <b>Default Target Temperature:</b>
        <input 
        type="number" 
        min="15" 
        max="30" 
        step="0.5"
        .value=${this.config.default_target || "21"} 
        @change=${(e) => {
            this.config = {
                ...this.config,
                default_target: Number(e.target.value)
            };
            this._configChanged();
        }}
        />°C
      </div>

      <hr />
      <b>Areas and Sensors:</b>
      ${areas.map(area => {
            const isEnabled = this.config.areas?.find(a => a.area_id === area.area_id)?.enabled !== false;
            return html `
        <div class="${isEnabled ? '' : 'disabled-area'}">
        <div class="area-header">
          <input 
          type="checkbox" 
          .checked=${isEnabled} 
          @change=${(e) => this._onAreaEnabledChange(area.area_id, e)}
          />
          <b>${area.name || area.area_id}</b>
        </div>
        <ul>
          ${requiredSensorTypes.map(type => {
                const areaSensors = states.filter((e) => e.attributes?.area_id === area.area_id);
                const matchingByClass = areaSensors.filter((e) => e.attributes?.device_class === type);
                const matchingByKeyword = areaSensors.filter((e) => {
                    const keywords = SENSOR_KEYWORDS[type] || [type];
                    return keywords.some(k => e.entity_id.toLowerCase().includes(k) ||
                        (e.attributes.friendly_name || '').toLowerCase().includes(k)) && !matchingByClass.includes(e);
                });
                const otherSensors = areaSensors.filter(s => !matchingByClass.includes(s) && !matchingByKeyword.includes(s));
                const autoId = this._autodetect(area.area_id, type);
                // Zeige ALLE Entities aus dem Bereich: area_id direkt ODER device_id->area_id
                const allEntities = Object.values(this.hass?.states || {});
                const devices = this.hass?.devices || {};
                const relevantEntities = allEntities.filter((e) => {
                    if (e.attributes?.area_id === area.area_id)
                        return true;
                    if (e.attributes?.device_id && devices[e.attributes.device_id]?.area_id === area.area_id)
                        return true;
                    return false;
                });
                relevantEntities.sort((a, b) => (a.attributes.friendly_name || a.entity_id).localeCompare(b.attributes.friendly_name || b.entity_id));
                const selected = this.config.overrides?.[area.area_id]?.[type] || '';
                return html `
            <li>
            <div class="sensor-row ${type === 'target' ? 'target-row' : ''}">
            <span class="sensor-label">
            ${type === 'target' ? 'Zieltemperatur' :
                    type === 'heating' ? 'Heizung' :
                        type === 'heating_level' ? 'Heizleistung' :
                            type}:
            </span>
            <div class="sensor-select">
            <select @change=${(e) => this._onAreaSensorChange(area.area_id, type, e)} .value=${selected || ''}>
            <option value="none">(kein Sensor ausgewählt)</option>
            
            ${relevantEntities.map((s) => html `
              <option 
                value="${s.entity_id}" 
                ?selected=${selected === s.entity_id}
                title="${s.attributes.friendly_name || s.entity_id} [${s.state}${s.attributes.unit_of_measurement ? s.attributes.unit_of_measurement : ''}]${s.attributes.device_class ? ` (${s.attributes.device_class})` : ''}${s.attributes.area_id ? ` (Bereich: ${this.hass.areas?.[s.attributes.area_id]?.name || s.attributes.area_id})` : ''}"
              >
                ${s.attributes.friendly_name || s.entity_id} 
                [${s.state}${s.attributes.unit_of_measurement ? s.attributes.unit_of_measurement : ''}]
                ${s.attributes.device_class ? ` (${s.attributes.device_class})` : ''}
                ${s.attributes.area_id ? ` (Bereich: ${this.hass.areas?.[s.attributes.area_id]?.name || s.attributes.area_id})` : ''}
              </option>
            `)}
            </select>
            ${type === 'target' ? html `
            <div class="help-text">
            Wählen Sie einen Sensor für die Zieltemperatur aus oder lassen Sie es leer, 
            um den Standard-Wert von ${this.config.default_target || 21}°C zu verwenden.
            </div>
            ` : ''}
          </div>
          </div>
          </li>
          `;
            })}
        </ul>
        </div>
      `;
        })}
      </div>

      <!-- Missing Sensors per Area -->
      <div style="margin-top:1em;">
      <b>Fehlende Sensoren pro Bereich:</b>
      <ul>
        ${missingSensorsPerArea.map(a => html `<li><b>${a.area.name}</b>: ${a.missing.length === 0 ? 'Alle gefunden' : a.missing.join(', ')}</li>`)}
      </ul>
      </div>

      <!-- Notifications & High Threshold -->
      <div style="margin-top:1em;">
      <label><input type="checkbox" .checked=${this.notify} @change=${this.handleNotifyChange} /> Regel-Treffer als Home Assistant Notification anzeigen</label>
      </div>
      <div style="margin-top:1em;">
      <label>High Threshold: <input type="number" .value=${this.highThreshold} @input=${this.handleThresholdChange} /></label>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], HausgeistCardEditor.prototype, "config", void 0);
__decorate([
    property({ type: Object })
], HausgeistCardEditor.prototype, "testValues", void 0);
__decorate([
    property({ type: String })
], HausgeistCardEditor.prototype, "rulesJson", void 0);
__decorate([
    property({ type: Boolean })
], HausgeistCardEditor.prototype, "notify", void 0);
__decorate([
    property({ type: Number })
], HausgeistCardEditor.prototype, "highThreshold", void 0);
HausgeistCardEditor = __decorate([
    customElement('hausgeist-card-editor')
], HausgeistCardEditor);
export { HausgeistCardEditor };
//# sourceMappingURL=hausgeist-card-editor.js.map