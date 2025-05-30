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
    const sensorTypes = [
      'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target' // heating/target neu
    ];
    // Helper: Autodetect sensor for area/type
    function autodetect(areaId: string, type: string): string | undefined {
      // 1. device_class
      let s = states.find((st: any) => st.attributes?.area_id === areaId && st.attributes?.device_class === type) as any;
      if (s && s.entity_id) return s.entity_id;
      // 2. keywords
      const keywords: Record<string, string[]> = {
        temperature: ['temperature','temperatur','température'],
        humidity: ['humidity','feuchtigkeit','humidité'],
        co2: ['co2'],
        window: ['window','fenster'],
        door: ['door','tür'],
        curtain: ['curtain','vorhang'],
        blind: ['blind','jalousie'],
        heating: ['heating','heizung','thermostat'],
        target: ['target','soll','setpoint']
      };
      const kw = keywords[type] || [type];
      s = states.find((st: any) => st.attributes?.area_id === areaId && kw.some(k => st.entity_id.toLowerCase().includes(k) || (st.attributes.friendly_name||'').toLowerCase().includes(k))) as any;
      if (s && s.entity_id) return s.entity_id;
      // 3. fallback: area name
      const areaName = (hass.areas && hass.areas[areaId]?.name?.toLowerCase()) || areaId.toLowerCase();
      s = states.find((st: any) => (st.entity_id.toLowerCase().includes(areaName) || (st.attributes.friendly_name||'').toLowerCase().includes(areaName)) && kw.some(k => st.entity_id.toLowerCase().includes(k))) as any;
      return s && s.entity_id ? s.entity_id : undefined;
    }
    return html`
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
        ${areas.map(area => html`
          <div style="margin-bottom: 1em;">
            <b>${area.name}</b>
            <ul>
              ${sensorTypes.map(type => {
                // Alle passenden Sensoren für diesen Bereich/Typ
                const sensors = states.filter((e: any) =>
                  e.attributes?.area_id === area.area_id &&
                  (type === 'heating' ? ['heating','heizung','thermostat'].some(k => e.entity_id.toLowerCase().includes(k)) : true)
                );
                const autoId = autodetect(area.area_id, type);
                const selected = this.config.overrides?.[area.area_id]?.[type] || '';
                return html`<li>${type}:
                  <select style="max-width: 260px;" @change=${(e: Event) => this._onAreaSensorChange(area.area_id, type, e)}>
                    <option value="">(auto${autoId ? ': ' + autoId : ': none'})</option>
                    ${sensors.map((s: any) => html`<option value="${s.entity_id}" ?selected=${selected === s.entity_id}>${s.entity_id} (${s.attributes.friendly_name || ''})</option>`)}
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
