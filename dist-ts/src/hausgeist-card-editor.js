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
        const sensorTypes = ['temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind'];
        return html `
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
            const sensors = states.filter((e) => e.attributes?.area_id === area.area_id ||
                (e.entity_id && e.entity_id.toLowerCase().includes(area.name.toLowerCase())));
            return html `<li>${type}:
                  <select @change=${(e) => this._onAreaSensorChange(area.area_id, type, e)}>
                    <option value="">(auto)</option>
                    ${sensors.map((s) => html `<option value="${s.entity_id}" ?selected=${this.config.overrides?.[area.area_id]?.[type] === s.entity_id}>${s.entity_id} (${s.attributes.friendly_name || ''})</option>`)}
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
