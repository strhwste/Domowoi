var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
let HausgeistCardEditor = class HausgeistCardEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.config = {};
        this.hass = undefined;
        // Use arrow function to auto-bind 'this'
        this._onDebugChange = (e) => {
            const debug = e.target.checked;
            this.config = { ...this.config, debug };
            this._configChanged();
        };
    }
    setConfig(config) {
        this.config = config;
    }
    set hassInstance(hass) {
        this.hass = hass;
        this.requestUpdate();
    }
    _onAreaSensorChange(areaId, type, e) {
        const entity_id = e.target.value;
        const overrides = { ...(this.config.overrides || {}) };
        overrides[areaId] = { ...(overrides[areaId] || {}), [type]: entity_id };
        this.config = { ...this.config, overrides };
        this._configChanged();
    }
    _configChanged() {
        const event = new CustomEvent('config-changed', {
            detail: { config: this.config },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }
    render() {
        const hass = this.hass;
        const areas = hass?.areas
            ? Object.values(hass.areas)
            : Array.from(new Set(Object.values(hass?.states || {}).map((e) => e.attributes?.area_id).filter(Boolean))).map((area_id) => ({ area_id, name: area_id }));
        const states = Object.values(hass?.states || {});
        const sensorTypes = [
            'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target' // heating/target neu
        ];
        // Helper: Autodetect sensor for area/type
        function autodetect(areaId, type) {
            // 1. device_class
            let s = states.find((st) => st.attributes?.area_id === areaId && st.attributes?.device_class === type);
            if (s && s.entity_id)
                return s.entity_id;
            // 2. keywords
            const keywords = {
                temperature: ['temperature', 'temperatur', 'température'],
                humidity: ['humidity', 'feuchtigkeit', 'humidité'],
                co2: ['co2'],
                window: ['window', 'fenster'],
                door: ['door', 'tür'],
                curtain: ['curtain', 'vorhang'],
                blind: ['blind', 'jalousie'],
                heating: ['heating', 'heizung', 'thermostat'],
                target: ['target', 'soll', 'setpoint']
            };
            const kw = keywords[type] || [type];
            s = states.find((st) => st.attributes?.area_id === areaId && kw.some(k => st.entity_id.toLowerCase().includes(k) || (st.attributes.friendly_name || '').toLowerCase().includes(k)));
            if (s && s.entity_id)
                return s.entity_id;
            // 3. fallback: area name
            const areaName = (hass.areas && hass.areas[areaId]?.name?.toLowerCase()) || areaId.toLowerCase();
            s = states.find((st) => (st.entity_id.toLowerCase().includes(areaName) || (st.attributes.friendly_name || '').toLowerCase().includes(areaName)) && kw.some(k => st.entity_id.toLowerCase().includes(k)));
            return s && s.entity_id ? s.entity_id : undefined;
        }
        return html `
      <style>
        select { max-width: 260px; font-size: 1em; }
        .card-config { font-family: inherit; }
        ul { margin: 0 0 0 1em; padding: 0; }
        li { margin: 0.2em 0; }
      </style>
      <div class="card-config">
        <label>
          <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
          Debug mode
        </label>
        <hr />
        <b>Sensor Overrides:</b>
        ${areas.map(area => html `
          <div style="margin-bottom: 1em;">
            <b>${area.name}</b>
            <ul>
              ${sensorTypes.map(type => {
            // Alle passenden Sensoren für diesen Bereich/Typ
            const sensors = states.filter((e) => e.attributes?.area_id === area.area_id &&
                (type === 'heating' ? ['heating', 'heizung', 'thermostat'].some(k => e.entity_id.toLowerCase().includes(k)) : true));
            const autoId = autodetect(area.area_id, type);
            const selected = this.config.overrides?.[area.area_id]?.[type] || '';
            return html `<li>${type}:
                  <select style="max-width: 260px;" @change=${(e) => this._onAreaSensorChange(area.area_id, type, e)}>
                    <option value="">(auto${autoId ? ': ' + autoId : ': none'})</option>
                    ${sensors.map((s) => html `<option value="${s.entity_id}" ?selected=${selected === s.entity_id}>${s.entity_id} (${s.attributes.friendly_name || ''})</option>`)}
                  </select>
                </li>`;
        })}
            </ul>
          </div>
        `)}
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], HausgeistCardEditor.prototype, "config", void 0);
__decorate([
    property({ type: Object })
], HausgeistCardEditor.prototype, "hass", void 0);
HausgeistCardEditor = __decorate([
    customElement('hausgeist-card-editor')
], HausgeistCardEditor);
export { HausgeistCardEditor };
