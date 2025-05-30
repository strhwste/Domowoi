import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';

@customElement('hausgeist-card-editor')
export class HausgeistCardEditor extends LitElement {
  @property({ type: Object }) config: { debug?: boolean, overrides?: Record<string, Record<string, string>>, areas?: Array<{ area_id: string; name: string }>, auto?: Record<string, Record<string, string>> } = {};
  private _hass: any = undefined;
  @property({ type: Object }) testValues: { [key: string]: any } = {};
  @property({ type: String }) rulesJson = '';
  @property({ type: Boolean }) notify = false;
  @property({ type: Number }) highThreshold = 2000;
  private _lastAreas: Array<{ area_id: string; name: string }> = [];

  setConfig(config: any) {
    this.config = config;
  }
  // Getter and setter for hass
  get hass() {
    return this._hass;
  }
  set hass(hass: any) {
    this._hass = hass;
    this.requestUpdate();
  }

  // Use arrow function to auto-bind 'this'
  _onDebugChange = (e: Event) => {
    const debug = (e.target as HTMLInputElement).checked;
    this.config = { ...this.config, debug };
    this._configChanged();
  };
    // Handle sensor selection change for a specific area and type
  _onAreaSensorChange(areaId: string, type: string, e: Event) {
    const entity_id = (e.target as HTMLSelectElement).value;
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
      const auto: Record<string, Record<string, string>> = {};
      const hass = this.hass;
      const areas = this._lastAreas;
      const states = Object.values(hass?.states || {});
      const sensorTypes = [
        'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'
      ];
      function autodetect(areaId: string, type: string): string | undefined {
        let s = states.find((st: any) => st.attributes?.area_id === areaId && st.attributes?.device_class === type) as any;
        if (s && s.entity_id) return s.entity_id;
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
        const areaName = (hass.areas && hass.areas[areaId]?.name?.toLowerCase()) || areaId.toLowerCase();
        s = states.find((st: any) => (st.entity_id.toLowerCase().includes(areaName) || (st.attributes.friendly_name||'').toLowerCase().includes(areaName)) && kw.some(k => st.entity_id.toLowerCase().includes(k))) as any;
        return s && s.entity_id ? s.entity_id : undefined;
      }
      for (const area of areas) {
        auto[area.area_id] = {};
        for (const type of sensorTypes) {
          const autoId = autodetect(area.area_id, type);
          if (autoId) auto[area.area_id][type] = autoId;
        }
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
  handleTestValueChange(areaId: string, type: string, e: any) {
    const value = e.target.value;
    this.testValues = { ...this.testValues, [areaId + '_' + type]: value };
    this.requestUpdate();
  }
    // Handle changes in the rules JSON text area
  handleRulesChange(e: any) {
    this.rulesJson = e.target.value;
    this._configChanged();
  }
    // Handle changes in the notification checkbox
  handleNotifyChange(e: any) {
    this.notify = e.target.checked;
    this._configChanged();
  }
    // Handle changes in the high threshold input
  handleThresholdChange(e: any) {
    this.highThreshold = Number(e.target.value);
    this._configChanged();
  }
    // Render the editor UI
  render() {
    const hass = this.hass;
    const areas: Array<{ area_id: string; name: string }> = hass?.areas
      ? Object.values(hass.areas)
      : Array.from(new Set(Object.values(hass?.states || {}).map((e: any) => e.attributes?.area_id).filter(Boolean))).map((area_id: string) => ({ area_id, name: area_id }));
    this._lastAreas = areas;
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
    // Felder, für die oft ein Helper/Template-Sensor benötigt wird
    const helperFields = [
      {
        key: 'rain_soon',
        name: 'Rain soon',
        yaml: `template:\n  - sensor:\n      - name: "Rain Soon"\n        state: >\n          {{ state_attr('weather.home', 'forecast')[0].condition == 'rain' }}\n        unique_id: rain_soon` },
      {
        key: 'adjacent_room_temp',
        name: 'Adjacent room temperature',
        yaml: `template:\n  - sensor:\n      - name: "Adjacent Room Temperature"\n        state: >\n          {{ states('sensor.adjacent_room_temperature') }}\n        unique_id: adjacent_room_temp` },
      {
        key: 'air_quality',
        name: 'Air quality',
        yaml: `template:\n  - sensor:\n      - name: "Air Quality"\n        state: >\n          {{ states('sensor.air_quality') }}\n        unique_id: air_quality` },
      {
        key: 'forecast_sun',
        name: 'Forecast sun',
        yaml: `template:\n  - sensor:\n      - name: "Forecast Sun"\n        state: >\n          {{ state_attr('weather.home', 'forecast')[0].condition == 'sunny' }}\n        unique_id: forecast_sun` },
    ];
    // Prüfen, ob Helper fehlen
    const missingHelpers = helperFields.filter(hf => !states.some((s: any) => s.entity_id.includes(hf.key)));
    // Feature 1: Automatische Erkennung und Anzeige von fehlenden Standard-Sensoren pro Bereich
    const requiredSensorTypes = [
      'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'target'
    ];
    const missingSensorsPerArea = areas.map(area => {
      const missing = requiredSensorTypes.filter(type => {
        const found = states.some((e: any) => e.attributes?.area_id === area.area_id && (
          type === 'heating'
            ? ['heating','heizung','thermostat'].some(k => e.entity_id.toLowerCase().includes(k))
            : e.attributes?.device_class === type || (e.entity_id.toLowerCase().includes(type))
        ));
        return !found;
      });
      return { area, missing };
    });
    // Feature 2: Link zur Helper-Verwaltung
    const helperLink = '/config/helpers';
    // Feature 4: Mehrsprachigkeit im Editor (Sprache aus hass übernehmen)
    const editorLang = hass?.selectedLanguage || 'de';
    // Feature 5: Erweiterte Debug-Ansicht
    // (Debug-Ausgabe ist bereits vorhanden, kann aber um Kontextdaten erweitert werden)
    // Feature 6: Regel-Editor (JSON-Textfeld, editierbar)
    if (!this.rulesJson && hass?.rules) this.rulesJson = JSON.stringify(hass.rules, null, 2);
    // Feature 8: Benachrichtigungsoptionen (Checkbox für Notification)
    // Feature 9: Konfigurierbare Schwellenwerte im Editor
    // DEBUG: Show info about areas and states
    const debugInfo = html`
      <div style="background:#eee; color:#333; font-size:0.95em; padding:0.5em; margin-bottom:1em; border-radius:0.3em;">
        <b>Debug Info:</b><br>
        Areas: ${areas.length} | States: ${states.length}<br>
        Areas: ${areas.map(a => a.name).join(', ')}<br>
        Example state: ${states[0] && (states[0] as any).entity_id ? (states[0] as any).entity_id : 'none'}
      </div>
    `;
    return html`
      ${debugInfo}
      <style>
        select { max-width: 260px; font-size: 1em; }
        .card-config { font-family: inherit; }
        ul { margin: 0 0 0 1em; padding: 0; }
        li { margin: 0.2em 0; }
        .auto-sensor-info { color: #888; font-size: 0.95em; margin-left: 0.5em; }
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
                // Keywords wie in autodetect
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
                // Filter: device_class oder Keyword im Namen/ID
                const sensors = states.filter((e: any) =>
                  e.attributes?.area_id === area.area_id && (
                    (type === 'heating')
                      ? ['heating','heizung','thermostat'].some(k => e.entity_id.toLowerCase().includes(k))
                      : (e.attributes?.device_class === type ||
                         kw.some(k => e.entity_id.toLowerCase().includes(k) || (e.attributes.friendly_name||'').toLowerCase().includes(k)))
                  )
                );
                const autoId = autodetect(area.area_id, type);
                const selected = this.config.overrides?.[area.area_id]?.[type] || '';
                return html`<li>${type}:
                  <select style="max-width: 260px;" @change=${(e: Event) => this._onAreaSensorChange(area.area_id, type, e)} .value=${selected || ''}>
                    <option value="">(auto${autoId ? ': ' + autoId : ': none'})</option>
                    ${sensors.map((s: any) => html`<option value="${s.entity_id}" ?selected=${selected === s.entity_id}>${s.entity_id} (${s.attributes.friendly_name || ''})</option>`)}
                  </select>
                  <span style="color: #888; font-size: 0.95em; margin-left: 0.5em;">${autoId ? `Auto: ${autoId}` : 'Auto: none gefunden'}</span>
                </li>`;
              })}
            </ul>
          </div>
        `)}
      </div>
      ${missingHelpers.length > 0 ? html`
        <div style="margin-top:2em; padding:1em; background:#fffbe6; border:1px solid #ffe58f; border-radius:0.5em;">
          <b>⚠️ Zusätzliche Sensoren/Helper benötigt:</b>
          <ul>
            ${missingHelpers.map(hf => html`<li>
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
          ${missingSensorsPerArea.map(a => html`<li><b>${a.area.name}</b>: ${a.missing.length === 0 ? 'Alle gefunden' : a.missing.join(', ')}</li>`)}
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
          ${areas.map(area => html`
            <li><b>${area.name}</b>:
              <ul>
                ${requiredSensorTypes.map(type => html`
                  <li>${type}: <input type="text" .value=${this.testValues[area.area_id + '_' + type] || ''} @input=${(e: any) => this.handleTestValueChange(area.area_id, type, e)} /></li>
                `)}
              </ul>
            </li>
          `)}
        </ul>
        <span style="font-size:0.95em; color:#888;">(Gib Testwerte ein, um die Regeln zu simulieren. Diese Werte überschreiben die echten Sensordaten temporär.)</span>
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
}
