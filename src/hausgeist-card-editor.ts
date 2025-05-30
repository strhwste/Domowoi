import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('hausgeist-card-editor')
export class HausgeistCardEditor extends LitElement {
  @property({ type: Object }) config: { debug?: boolean, overrides?: Record<string, Record<string, string>> } = {};
  @property({ type: Object }) hass: any = undefined;

  setConfig(config: any) {
    this.config = config;
  }

  set hassInstance(hass: any) {
    this.hass = hass;
    this.requestUpdate();
  }

  // Use arrow function to auto-bind 'this'
  _onDebugChange = (e: Event) => {
    const debug = (e.target as HTMLInputElement).checked;
    this.config = { ...this.config, debug };
    this._configChanged();
  };

  _onAreaSensorChange(areaId: string, type: string, e: Event) {
    const entity_id = (e.target as HTMLSelectElement).value;
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
    const areas: Array<{ area_id: string; name: string }> = hass?.areas
      ? Object.values(hass.areas)
      : Array.from(new Set(Object.values(hass?.states || {}).map((e: any) => e.attributes?.area_id).filter(Boolean))).map((area_id: string) => ({ area_id, name: area_id }));
    const states = Object.values(hass?.states || {});
    const sensorTypes = ['temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind'];
    return html`
      <div class="card-config">
        <label>
          <input type="checkbox" .checked=${this.config.debug ?? false} @change=${this._onDebugChange} />
          Debug mode
        </label>
        <hr />
        <b>Sensor Overrides:</b>
        ${areas.map(area => html`
          <div style="margin-bottom: 1em;">
            <b>${area.name}</b>
            <ul>
              ${sensorTypes.map(type => {
                const sensors = states.filter((e: any) =>
                  e.attributes?.area_id === area.area_id ||
                  (e.entity_id && e.entity_id.toLowerCase().includes(area.name.toLowerCase()))
                );
                return html`<li>${type}:
                  <select @change=${(e: Event) => this._onAreaSensorChange(area.area_id, type, e)}>
                    <option value="">(auto)</option>
                    ${sensors.map((s: any) => html`<option value="${s.entity_id}" ?selected=${this.config.overrides?.[area.area_id]?.[type] === s.entity_id}>${s.entity_id} (${s.attributes.friendly_name || ''})</option>`)}
                  </select>
                </li>`;
              })}
            </ul>
          </div>
        `)}
      </div>
    `;
  }
}
