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
    // Handle "Use Auto-Detected" button click
    _onUseAutoDetected(areaId, type) {
        const autoId = this._autodetect(areaId, type);
        if (!autoId)
            return; // Should never happen as button is only shown when autoId exists
        // Update overrides to use the auto-detected sensor
        const overrides = { ...(this.config.overrides || {}) };
        overrides[areaId] = { ...(overrides[areaId] || {}), [type]: autoId };
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
        // Use Object.keys of SENSOR_KEYWORDS for consistent typing
        const sensorTypes = Object.keys(SENSOR_KEYWORDS);
        // Felder, für die oft ein Helper/Template-Sensor benötigt wird
        const helperFields = [
            {
                key: 'rain_soon',
                name: 'Rain soon',
                yaml: `template:\n  - sensor:\n      - name: "Rain Soon"\n        state: >\n          {{ state_attr('weather.home', 'forecast')[0].precipitation > 0 }}\n        unique_id: rain_soon`
            },
            {
                key: 'forecast_sun',
                name: 'Forecast sun',
                yaml: `template:\n  - sensor:\n      - name: "Forecast Sun"\n        state: >\n          {{ state_attr('weather.home', 'forecast')[0].condition == 'sunny' }}\n        unique_id: forecast_sun`
            },
        ];
        // Prüfen, ob Helper fehlen
        const missingHelpers = helperFields.filter(hf => !states.some((s) => s.entity_id.includes(hf.key)));
        const requiredSensorTypes = [
            'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'
        ];
        const missingSensorsPerArea = areas.map(area => {
            const missing = requiredSensorTypes.filter(type => {
                const found = states.some((e) => e.attributes?.area_id === area.area_id && (type === 'heating'
                    ? ['heating', 'heizung', 'thermostat'].some(k => e.entity_id.toLowerCase().includes(k))
                    : e.attributes?.device_class === type || (e.entity_id.toLowerCase().includes(type))));
                return !found;
            });
            return { area, missing };
        });
        // Link zur Helper-Verwaltung
        const helperLink = '/config/helpers';
        // Styles einbinden
        return html `
      <style>
        .card-config {
          padding: 1em;
        }
        hr { margin: 1em 0; border: none; border-top: 1px solid #ddd; }
        select { min-width: 200px; }
        li { margin: 0.2em 0; }
        .auto-sensor-info { color: #888; font-size: 0.95em; margin-left: 0.5em; }
        .area-header {
          display: flex;
          align-items: center;
          margin-bottom: 0.5em;
        }
        .area-header input[type="checkbox"] {
          margin-right: 0.5em;
        }
        .disabled-area {
          opacity: 0.5;
        }
      </style>
      <div class="card-config">
        <label>
          <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
          Debug mode
        </label>
        <div style="margin-top:1em;">
          <b>Weather Entity:</b>
          <select @change=${(e) => {
            this.config = {
                ...this.config,
                weather_entity: e.target.value
            };
            this._configChanged();
        }} .value=${this.config.weather_entity || 'weather.home'}>
            ${weatherEntities.map(entity => html `
              <option value="${entity.entity_id}">${entity.name} (${entity.entity_id})</option>
            `)}
          </select>
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
              ${sensorTypes.map(type => {
                // Get all sensors for this area
                const areaSensors = states.filter((e) => e.attributes?.area_id === area.area_id);
                // Group sensors by relevance
                const matchingByClass = areaSensors.filter((e) => e.attributes?.device_class === type);
                const matchingByKeyword = areaSensors.filter((e) => {
                    // Use the imported SENSOR_KEYWORDS
                    const keywords = SENSOR_KEYWORDS[type] || [type];
                    return keywords.some(k => e.entity_id.toLowerCase().includes(k) ||
                        (e.attributes.friendly_name || '').toLowerCase().includes(k));
                });
                const otherSensors = areaSensors.filter(s => !matchingByClass.includes(s) && !matchingByKeyword.includes(s));
                const autoId = this._autodetect(area.area_id, type);
                const selected = this.config.overrides?.[area.area_id]?.[type] || '';
                return html `<li>${type}:
                  <select style="max-width: 260px;" @change=${(e) => this._onAreaSensorChange(area.area_id, type, e)} .value=${selected || ''}>
                    <option value="">(auto${autoId ? ': ' + autoId : ': none'})</option>
                    <option value="none">None (no sensor)</option>
                    ${areaSensors.map((s) => html `
                      <option value="${s.entity_id}" ?selected=${selected === s.entity_id}>
                        ${s.entity_id} ${s.attributes.device_class ? `[${s.attributes.device_class}]` : ''} ${s.attributes.friendly_name ? `(${s.attributes.friendly_name})` : ''}
                      </option>
                    `)}
                  </select>
                  ${autoId && !selected ? html `
                    <button 
                      class="use-auto" 
                      @click=${() => this._onUseAutoDetected(area.area_id, type)}
                      title="Use the auto-detected sensor as an override">
                      Use Auto-Detected
                    </button>
                  ` : ''}
                </li>`;
            })}
            </ul>
          </div>
        `;
        })}
      </div>

      ${missingHelpers.length > 0 ? html `
        <div style="margin-top:2em; padding:1em; background:#fffbe6; border:1px solid #ffe58f; border-radius:0.5em;">
          <b>⚠️ Zusätzliche Sensoren/Helper benötigt:</b>
          <ul>
            ${missingHelpers.map((hf) => html `<li>
              <b>${hf.name}</b>:<br/>
              <span style="font-size:0.95em; color:#888;">Sensor nicht gefunden. Füge folgenden YAML-Code in deine <b>configuration.yaml</b> oder nutze die Helper-Verwaltung:</span>
              <pre style="background:#f5f5f5; border-radius:0.3em; padding:0.5em; margin:0.5em 0;">${hf.yaml}</pre>
            </li>`)}
          </ul>
        </div>
      ` : ''}
      <!-- Feature 1: Fehlende Sensoren pro Bereich anzeigen -->
      <div style="margin-top:1em;">
        <b>Fehlende Sensoren pro Bereich:</b>
        <ul>
          ${missingSensorsPerArea.map(a => html `<li><b>${a.area.name}</b>: ${a.missing.length === 0 ? 'Alle gefunden' : a.missing.join(', ')}</li>`)}
        </ul>
      </div>
      <!-- Feature 2: Link zur Helper-Verwaltung -->
      <div style="margin-top:1em;">
        <a href="${helperLink}" target="_blank" rel="noopener" style="color:#00529b; text-decoration:underline;">Home Assistant Helper-Verwaltung öffnen</a>
      </div>
      <!-- Feature 3: Testmodus/Simulation -->
      <div style="margin-top:1em;">
        <b>Testmodus / Simulation:</b>
        <ul>
          ${areas.map(area => html `
            <li><b>${area.name}</b>:
              <ul>
                ${requiredSensorTypes.map((type) => html `
                  <li>${type}: <input type="text" .value=${this.testValues[area.area_id + '_' + type] || ''} @change=${(e) => this.handleTestValueChange(area.area_id, type, e)}></li>
                `)}
              </ul>
            </li>
          `)}
        </ul>
      </div>
      <!-- Feature 6: Regel-Editor (JSON) -->
      <div style="margin-top:1em;">
        <b>Regeln bearbeiten (JSON):</b><br/>
        <textarea style="width:100%; min-height:120px; font-family:monospace;" @input=${this.handleRulesChange} .value=${this.rulesJson}></textarea>
        <span style="font-size:0.95em; color:#888;">(Bearbeite die Regeln als JSON. Änderungen werden übernommen.)</span>
      </div>
      <!-- Feature 8: Benachrichtigungsoptionen -->
      <div style="margin-top:1em;">
        <label><input type="checkbox" .checked=${this.notify} @change=${this.handleNotifyChange} /> Regel-Treffer als Home Assistant Notification anzeigen</label>
      </div>
      <!-- Feature 9: Schwellenwert -->
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
