var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SENSOR_KEYWORDS } from './sensor-keywords';
const SENSOR_TYPES = [
    'temperature',
    'humidity',
    'co2',
    'window',
    'door',
    'curtain',
    'blind',
    'heating',
    'heating_level',
    'target',
    'occupancy',
];
const SENSOR_DESCRIPTORS = {
    temperature: {
        label: 'Temperature sensor',
        helper: 'Room temperature used for comfort evaluation.',
        domains: ['sensor', 'climate'],
        deviceClasses: ['temperature'],
    },
    humidity: {
        label: 'Humidity sensor',
        helper: 'Relative humidity in %.',
        domains: ['sensor'],
        deviceClasses: ['humidity'],
    },
    co2: {
        label: 'CO2 sensor',
        helper: 'CO2 concentration sensor in ppm.',
        domains: ['sensor'],
        deviceClasses: ['carbon_dioxide', 'aqi'],
        extraKeywords: ['airquality', 'co2', 'air_quality'],
    },
    window: {
        label: 'Window contact',
        helper: 'Binary sensor indicating open windows.',
        domains: ['binary_sensor'],
        deviceClasses: ['window', 'opening'],
        extraKeywords: ['fenster'],
    },
    door: {
        label: 'Door contact',
        helper: 'Binary sensor indicating open doors.',
        domains: ['binary_sensor'],
        deviceClasses: ['door', 'opening'],
        extraKeywords: ['tuer', 'tür'],
    },
    curtain: {
        label: 'Curtain control',
        helper: 'Cover entity for curtains.',
        domains: ['cover'],
        deviceClasses: ['curtain'],
        extraKeywords: ['vorhang'],
    },
    blind: {
        label: 'Blind or shade',
        helper: 'Cover entity for blinds, shutters, or shades.',
        domains: ['cover'],
        deviceClasses: ['blind', 'shade', 'shutter'],
        extraKeywords: ['rolladen', 'jalousie'],
    },
    heating: {
        label: 'Heating device',
        helper: 'Primary climate entity controlling the room heating.',
        domains: ['climate'],
        extraKeywords: ['heating', 'heater', 'thermostat', 'heizung'],
    },
    heating_level: {
        label: 'Heating level',
        helper: 'Sensor or helper representing the valve or heating output in %. ',
        domains: ['sensor', 'number', 'input_number'],
        extraKeywords: ['valve', 'heizleistung', 'duty', 'heizkoerper'],
    },
    target: {
        label: 'Target temperature',
        helper: 'Sensor or helper providing the desired target temperature.',
        domains: ['sensor', 'number', 'input_number', 'climate'],
        deviceClasses: ['temperature'],
        extraKeywords: ['soll', 'setpoint'],
    },
    occupancy: {
        label: 'Occupancy sensor',
        helper: 'Presence or motion sensor for the room.',
        domains: ['binary_sensor', 'sensor', 'person', 'device_tracker'],
        deviceClasses: ['occupancy', 'motion', 'presence'],
        extraKeywords: ['motion', 'presence'],
    },
};
let HausgeistCardEditor = class HausgeistCardEditor extends LitElement {
    constructor() {
        super(...arguments);
        this.config = {};
        this._areas = [];
        this._selectorReady = false;
    }
    set hass(value) {
        this._hass = value;
        this._ensureSelectorSystem();
        this._syncAreas();
    }
    get hass() {
        return this._hass;
    }
    setConfig(config) {
        this.config = {
            debug: false,
            notify: false,
            highThreshold: 2000,
            default_target: 21,
            ...config,
            overrides: { ...(config.overrides ?? {}) },
        };
        this._areas = (config.areas ?? []).map((area) => ({ ...area }));
        this._syncAreas();
    }
    connectedCallback() {
        super.connectedCallback();
        this._ensureSelectorSystem();
    }
    render() {
        if (!this._hass) {
            return nothing;
        }
        return html `
      <div class="card-config">
        ${this._renderGeneralSection()}
        ${this._renderAreasSection()}
        ${this._renderAdvancedSection()}
        ${this._renderMissingSensorsSection()}
      </div>
    `;
    }
    _renderGeneralSection() {
        const weatherSelector = { entity: { domain: 'weather' } };
        const targetSourceSelector = { entity: { domain: ['input_number', 'sensor', 'number'] } };
        const defaultTargetValue = this.config.default_target ?? 21;
        const highThreshold = this.config.highThreshold ?? 2000;
        return html `
      <section class="section">
        <h3>Card Settings</h3>
        ${this._renderField({
            label: 'Debug mode',
            helper: 'Enable verbose logging in the browser developer tools.',
            control: this._renderSelectorControl({
                selector: { boolean: {} },
                value: this.config.debug ?? false,
                valueType: 'boolean',
                onChange: (value) => this._handleConfigValueChange('debug', Boolean(value)),
            }),
        })}
        ${this._renderField({
            label: 'Weather entity',
            helper: 'Used for outside temperature and forecast context.',
            control: this._renderSelectorControl({
                selector: weatherSelector,
                value: this.config.weather_entity ?? '',
                valueType: 'string',
                placeholder: 'Select weather entity',
                onChange: (value) => this._handleConfigValueChange('weather_entity', value),
            }),
        })}
        ${this._renderField({
            label: 'Default target sensor',
            helper: 'Optional entity that provides a reference target temperature.',
            control: this._renderSelectorControl({
                selector: targetSourceSelector,
                value: this.config.default_target_entity ?? '',
                valueType: 'string',
                placeholder: 'Select entity (optional)',
                onChange: (value) => this._handleConfigValueChange('default_target_entity', value),
            }),
        })}
        ${this._renderField({
            label: 'Fallback target temperature',
            helper: 'Used when no area-specific target is available.',
            control: this._renderSelectorControl({
                selector: {
                    number: {
                        min: 15,
                        max: 30,
                        step: 0.5,
                        unit_of_measurement: '°C',
                    },
                },
                value: defaultTargetValue,
                valueType: 'number',
                min: 15,
                max: 30,
                step: 0.5,
                onChange: (value) => this._handleConfigValueChange('default_target', Number(value)),
            }),
        })}
        ${this._renderField({
            label: 'Notify on rule hits',
            helper: 'Send a persistent notification when rules trigger.',
            control: this._renderSelectorControl({
                selector: { boolean: {} },
                value: this.config.notify ?? false,
                valueType: 'boolean',
                onChange: (value) => this._handleConfigValueChange('notify', Boolean(value)),
            }),
        })}
        ${this._renderField({
            label: 'CO2 high threshold',
            helper: 'Upper limit in ppm before escalating recommendations.',
            control: this._renderSelectorControl({
                selector: {
                    number: {
                        min: 600,
                        max: 4000,
                        step: 50,
                        unit_of_measurement: 'ppm',
                    },
                },
                value: highThreshold,
                valueType: 'number',
                min: 600,
                max: 4000,
                step: 50,
                onChange: (value) => this._handleConfigValueChange('highThreshold', Number(value)),
            }),
        })}
      </section>
    `;
    }
    _renderAreasSection() {
        if (!this._areas.length) {
            return html ``;
        }
        return html `
      <section class="section">
        <h3>Areas & Sensors</h3>
        ${this._areas.map((area) => this._renderArea(area))}
      </section>
    `;
    }
    _renderArea(area) {
        const enabled = area.enabled !== false;
        return html `
      <details class="area" ?open=${enabled}>
        <summary>
          <span>${area.name}</span>
          <label class="area-toggle">
            <input
              type="checkbox"
              .checked=${enabled}
              @change=${(event) => this._onAreaToggle(area.area_id, event.target.checked)}
            />
            ${enabled ? 'Enabled' : 'Disabled'}
          </label>
        </summary>
        <div class="area-body">
          ${SENSOR_TYPES.map((type) => this._renderSensorRow(area, type))}
        </div>
      </details>
    `;
    }
    _renderSensorRow(area, type) {
        const descriptor = SENSOR_DESCRIPTORS[type];
        const overrides = this.config.overrides ?? {};
        const overrideValue = overrides[area.area_id]?.[type] ?? '';
        const autoValue = this._autodetect(area.area_id, type);
        const suggestions = this._matchingEntities(area.area_id, type);
        const disabled = area.enabled === false;
        return html `
      <div class="sensor-row ${disabled ? 'is-disabled' : ''}">
        <div class="sensor-text">
          <div class="sensor-label">${descriptor.label}</div>
          ${descriptor.helper ? html `<div class="sensor-helper">${descriptor.helper}</div>` : nothing}
          ${autoValue
            ? html `<div class="sensor-auto">Auto: <code>${autoValue}</code></div>`
            : html `<div class="sensor-auto is-missing">No automatic match found</div>`}
          ${overrideValue
            ? html `<div class="sensor-override">Override: <code>${overrideValue}</code></div>`
            : nothing}
          ${suggestions.length
            ? html `
                <div class="sensor-suggestions">
                  Suggestions:
                  ${suggestions.slice(0, 4).map((entity) => html `
                    <button
                      class="suggestion"
                      type="button"
                      @click=${() => this._onAreaSensorChange(area.area_id, type, entity.entity_id)}
                    >
                      ${entity.attributes?.friendly_name || entity.entity_id}
                    </button>
                  `)}
                </div>
              `
            : nothing}
        </div>
        <div class="sensor-control">
          ${this._renderSelectorControl({
            selector: this._selectorForSensor(type),
            value: overrideValue,
            valueType: 'string',
            disabled,
            inlineLabel: 'Override entity',
            placeholder: autoValue ? `Automatic: ${autoValue}` : 'Select entity',
            onChange: (value) => this._onAreaSensorChange(area.area_id, type, value),
        })}
          ${overrideValue
            ? html `<button class="clear-button" type="button" @click=${() => this._onAreaSensorChange(area.area_id, type, '')}>Clear override</button>`
            : nothing}
        </div>
      </div>
    `;
    }
    _renderAdvancedSection() {
        const rulesContent = this.config.rulesJson ?? '';
        return html `
      <section class="section">
        <h3>Advanced</h3>
        ${this._renderField({
            label: 'Custom rules JSON',
            helper: 'Paste a rules.json payload to override bundled rules (optional).',
            control: this._renderSelectorControl({
                selector: { text: { multiline: true } },
                value: rulesContent,
                valueType: 'string',
                multiline: true,
                onChange: (value) => this._handleConfigValueChange('rulesJson', value),
            }),
        })}
      </section>
    `;
    }
    _renderMissingSensorsSection() {
        const missing = this._computeMissingSensors();
        if (!missing.length) {
            return html `
        <section class="section">
          <h3>Sensor coverage</h3>
          <div class="field-helper">All enabled areas have at least an automatic match.</div>
        </section>
      `;
        }
        return html `
      <section class="section">
        <h3>Sensor coverage</h3>
        <ul class="missing-list">
          ${missing.map(({ area, sensors }) => html `
            <li>
              <span class="missing-area">${area.name}:</span>
              ${sensors.map((type) => SENSOR_DESCRIPTORS[type].label).join(', ')}
            </li>
          `)}
        </ul>
      </section>
    `;
    }
    _renderField(field) {
        return html `
      <div class="field">
        <div class="field-label">${field.label}</div>
        ${field.helper ? html `<div class="field-helper">${field.helper}</div>` : nothing}
        <div class="field-control">${field.control}</div>
      </div>
    `;
    }
    _renderSelectorControl(config) {
        if (this._selectorReady && customElements.get('ha-selector')) {
            return html `
        <ha-selector
          .hass=${this._hass}
          .selector=${config.selector}
          .value=${config.value}
          .disabled=${config.disabled ?? false}
          .label=${config.inlineLabel ?? ''}
          .helper=${config.selectorHelper ?? ''}
          @value-changed=${(event) => {
                const raw = event.detail?.value ?? event.detail;
                config.onChange(this._normalizeSelectorValue(raw, config.valueType));
            }}
        ></ha-selector>
      `;
        }
        if (config.valueType === 'boolean') {
            return html `
        <label class="area-toggle">
          <input
            type="checkbox"
            .checked=${Boolean(config.value)}
            ?disabled=${config.disabled ?? false}
            @change=${(event) => config.onChange(event.target.checked)}
          />
          ${config.inlineLabel ?? ''}
        </label>
      `;
        }
        if (config.valueType === 'number') {
            return html `
        <input
          type="number"
          .value=${config.value ?? ''}
          ?disabled=${config.disabled ?? false}
          min=${config.min ?? ''}
          max=${config.max ?? ''}
          step=${config.step ?? 'any'}
          @change=${(event) => config.onChange(this._normalizeSelectorValue(event.target.value, 'number'))}
        />
      `;
        }
        if (config.multiline) {
            return html `
        <textarea
          .value=${config.value ?? ''}
          ?disabled=${config.disabled ?? false}
          @change=${(event) => config.onChange(event.target.value)}
        ></textarea>
      `;
        }
        return html `
      <input
        type="text"
        .value=${config.value ?? ''}
        placeholder=${config.placeholder ?? ''}
        ?disabled=${config.disabled ?? false}
        @change=${(event) => config.onChange(event.target.value)}
      />
    `;
    }
    _normalizeSelectorValue(value, valueType) {
        if (valueType === 'boolean') {
            return Boolean(value);
        }
        if (valueType === 'number') {
            if (value === '' || value === undefined || value === null) {
                return undefined;
            }
            return Number(value);
        }
        return typeof value === 'string' ? value : value ?? '';
    }
    _handleConfigValueChange(key, value) {
        const patch = { [key]: value };
        this._emitConfig(patch);
    }
    _onAreaToggle(areaId, enabled) {
        this._areas = this._areas.map((area) => (area.area_id === areaId ? { ...area, enabled } : area));
        this._emitConfig();
    }
    _onAreaSensorChange(areaId, type, value) {
        const overrides = { ...(this.config.overrides ?? {}) };
        const current = { ...(overrides[areaId] ?? {}) };
        if (!value) {
            delete current[type];
        }
        else {
            current[type] = value;
        }
        if (Object.keys(current).length) {
            overrides[areaId] = current;
        }
        else {
            delete overrides[areaId];
        }
        this._emitConfig({ overrides });
    }
    _emitConfig(patch = {}) {
        const nextConfig = {
            ...this.config,
            ...patch,
        };
        nextConfig.overrides = { ...(patch.overrides ?? this.config.overrides ?? {}) };
        nextConfig.areas = this._areas.map((area) => ({ area_id: area.area_id, name: area.name, enabled: area.enabled }));
        nextConfig.auto = this._buildAutoMapping(nextConfig.areas);
        if (!nextConfig.weather_entity) {
            delete nextConfig.weather_entity;
        }
        if (!nextConfig.default_target_entity) {
            delete nextConfig.default_target_entity;
        }
        if (!nextConfig.rulesJson) {
            delete nextConfig.rulesJson;
        }
        this.config = nextConfig;
        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: { config: nextConfig },
            bubbles: true,
            composed: true,
        }));
    }
    _buildAutoMapping(areas = []) {
        const auto = {};
        for (const area of areas) {
            auto[area.area_id] = {};
            for (const type of SENSOR_TYPES) {
                const suggestion = this._autodetect(area.area_id, type);
                if (suggestion) {
                    auto[area.area_id][type] = suggestion;
                }
            }
        }
        return auto;
    }
    _autodetect(areaId, type) {
        const matches = this._matchingEntities(areaId, type);
        if (!matches.length) {
            return undefined;
        }
        const descriptor = SENSOR_DESCRIPTORS[type];
        if (descriptor.deviceClasses?.length) {
            const deviceClassHit = matches.find((entity) => {
                const deviceClass = entity.attributes?.device_class;
                return deviceClass ? descriptor.deviceClasses.includes(deviceClass) : false;
            });
            if (deviceClassHit) {
                return deviceClassHit.entity_id;
            }
        }
        const domainHit = matches.find((entity) => this._domainMatches(entity, descriptor.domains));
        if (domainHit) {
            return domainHit.entity_id;
        }
        return matches[0]?.entity_id;
    }
    _matchingEntities(areaId, type) {
        if (!this._hass) {
            return [];
        }
        const descriptor = SENSOR_DESCRIPTORS[type];
        const keywords = this._keywordsForType(type);
        const states = Object.values(this._hass.states ?? {});
        const candidates = states.filter((state) => this._matchesArea(state, areaId));
        const matches = new Map();
        for (const state of candidates) {
            const domainMatch = this._domainMatches(state, descriptor.domains);
            const deviceClass = state.attributes?.device_class;
            const deviceClassMatch = descriptor.deviceClasses?.length
                ? (deviceClass ? descriptor.deviceClasses.includes(deviceClass) : false)
                : false;
            const keywordMatch = keywords.some((keyword) => {
                const lower = keyword.toLowerCase();
                const entityId = state.entity_id.toLowerCase();
                const friendly = (state.attributes?.friendly_name || '').toLowerCase();
                return entityId.includes(lower) || friendly.includes(lower);
            });
            if (domainMatch || deviceClassMatch || keywordMatch) {
                matches.set(state.entity_id, state);
            }
        }
        const sorted = Array.from(matches.values());
        sorted.sort((a, b) => (a.attributes?.friendly_name || a.entity_id).localeCompare(b.attributes?.friendly_name || b.entity_id));
        return sorted;
    }
    _keywordsForType(type) {
        const descriptor = SENSOR_DESCRIPTORS[type];
        const list = [
            ...(SENSOR_KEYWORDS[type] ?? []),
            type,
            ...(descriptor.extraKeywords ?? []),
        ];
        return Array.from(new Set(list.map((keyword) => keyword.toLowerCase())));
    }
    _domainMatches(entity, domains) {
        if (!domains || !domains.length) {
            return true;
        }
        const domain = entity.entity_id.split('.')[0];
        return domains.includes(domain);
    }
    _selectorForSensor(type) {
        const descriptor = SENSOR_DESCRIPTORS[type];
        const selector = { entity: {} };
        if (descriptor.domains.length === 1) {
            selector.entity.domain = descriptor.domains[0];
        }
        else {
            selector.entity.domain = descriptor.domains;
        }
        if (descriptor.deviceClasses?.length === 1) {
            selector.entity.device_class = descriptor.deviceClasses[0];
        }
        else if (descriptor.deviceClasses?.length) {
            selector.entity.device_class = descriptor.deviceClasses;
        }
        return selector;
    }
    _matchesArea(entity, areaId) {
        if (!areaId) {
            return false;
        }
        if (entity.attributes?.area_id === areaId) {
            return true;
        }
        const deviceId = entity.attributes?.device_id;
        if (deviceId && this._hass?.devices?.[deviceId]?.area_id === areaId) {
            return true;
        }
        const areaMeta = this._areas.find((area) => area.area_id === areaId);
        const areaNames = [
            this._hass?.areas?.[areaId]?.name,
            areaMeta?.name,
            areaId,
        ]
            .filter(Boolean)
            .map((name) => name.toLowerCase());
        if (!areaNames.length) {
            return false;
        }
        const entityId = entity.entity_id.toLowerCase();
        const friendly = (entity.attributes?.friendly_name || '').toLowerCase();
        return areaNames.some((name) => entityId.includes(name) || friendly.includes(name));
    }
    _computeMissingSensors() {
        return this._areas
            .filter((area) => area.enabled !== false)
            .map((area) => ({
            area,
            sensors: SENSOR_TYPES.filter((type) => {
                const override = this.config.overrides?.[area.area_id]?.[type];
                if (override) {
                    return false;
                }
                return !this._autodetect(area.area_id, type);
            }),
        }))
            .filter(({ sensors }) => sensors.length > 0);
    }
    _syncAreas() {
        if (!this._hass) {
            if (!this._areas.length && this.config.areas?.length) {
                this._areas = this.config.areas.map((area) => ({ ...area }));
            }
            return;
        }
        const hassAreas = this._collectAreasFromHass();
        const configuredAreas = new Map((this.config.areas ?? []).map((area) => [area.area_id, area]));
        const merged = new Map();
        for (const area of hassAreas) {
            const configArea = configuredAreas.get(area.area_id);
            merged.set(area.area_id, {
                area_id: area.area_id,
                name: configArea?.name ?? area.name,
                enabled: configArea?.enabled ?? true,
            });
        }
        for (const [areaId, configArea] of configuredAreas) {
            if (!merged.has(areaId)) {
                merged.set(areaId, {
                    area_id: areaId,
                    name: configArea.name ?? areaId,
                    enabled: configArea.enabled ?? true,
                });
            }
        }
        this._areas = Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
    }
    _collectAreasFromHass() {
        if (!this._hass) {
            return [];
        }
        if (this._hass.areas) {
            return Object.values(this._hass.areas).map((area) => ({
                area_id: area.area_id,
                name: area.name ?? area.area_id,
                enabled: true,
            }));
        }
        const states = Object.values(this._hass.states || {});
        const areaIds = new Map();
        for (const state of states) {
            const areaId = state.attributes?.area_id;
            if (areaId) {
                areaIds.set(areaId, areaId);
            }
        }
        return Array.from(areaIds.keys()).map((areaId) => ({
            area_id: areaId,
            name: areaId,
            enabled: true,
        }));
    }
    async _ensureSelectorSystem() {
        if (this._selectorReady) {
            return;
        }
        const helpersLoader = window?.loadCardHelpers;
        if (typeof helpersLoader === 'function') {
            try {
                const helpers = await helpersLoader();
                await helpers?.loadHaForm?.();
            }
            catch (error) {
                if (this.config?.debug) {
                    console.warn('Failed to load selector helpers', error);
                }
            }
        }
        if (customElements.get('ha-selector')) {
            this._selectorReady = true;
            return;
        }
        try {
            await customElements.whenDefined('ha-selector');
            if (this.isConnected) {
                this._selectorReady = true;
            }
        }
        catch (error) {
            if (this.config?.debug) {
                console.warn('ha-selector never became available', error);
            }
        }
    }
};
HausgeistCardEditor.styles = css `
    :host {
      display: block;
    }
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem;
      box-sizing: border-box;
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .section h3 {
      margin: 0;
      font-size: 1.1rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .field-label {
      font-weight: 600;
    }
    .field-helper {
      color: var(--secondary-text-color, #666);
      font-size: 0.9rem;
    }
    .field-control {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    details.area {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 0.6rem;
      padding: 0 0.75rem 0.75rem;
      background: var(--card-background-color, #fff);
    }
    details.area > summary {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      cursor: pointer;
      list-style: none;
      padding: 0.75rem 0;
      font-weight: 600;
    }
    details.area > summary::-webkit-details-marker {
      display: none;
    }
    details.area[open] > summary {
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
      margin-bottom: 0.75rem;
    }
    .area-toggle {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: normal;
    }
    .area-body {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .sensor-row {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: minmax(0, 1fr);
    }
    @media (min-width: 680px) {
      .sensor-row {
        grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
        align-items: start;
      }
    }
    .sensor-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .sensor-label {
      font-weight: 600;
    }
    .sensor-helper {
      font-size: 0.9rem;
      color: var(--secondary-text-color, #666);
    }
    .sensor-auto {
      font-size: 0.85rem;
      color: var(--secondary-text-color, #666);
    }
    .sensor-auto.is-missing {
      color: var(--error-color, #c62828);
    }
    .sensor-override {
      font-size: 0.85rem;
      color: var(--primary-color, #3f51b5);
    }
    .sensor-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      font-size: 0.85rem;
      color: var(--secondary-text-color, #666);
    }
    .sensor-suggestions .suggestion {
      border: 1px solid var(--secondary-text-color, #666);
      border-radius: 999px;
      background: transparent;
      padding: 0.15rem 0.6rem;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .sensor-suggestions .suggestion:hover {
      background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
    }
    .sensor-control {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .clear-button {
      align-self: flex-start;
      background: none;
      border: none;
      color: var(--primary-color, #3f51b5);
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0;
    }
    .clear-button:focus {
      outline: 1px dotted var(--primary-color, #3f51b5);
      outline-offset: 2px;
    }
    .missing-list {
      margin: 0;
      padding-left: 1.2rem;
    }
    .missing-list li {
      margin: 0.2rem 0;
    }
    .missing-area {
      font-weight: 600;
    }
    input[type='text'],
    input[type='number'],
    textarea {
      width: 100%;
      box-sizing: border-box;
      font: inherit;
      padding: 0.4rem 0.5rem;
      border-radius: 0.3rem;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.3));
      background: var(--card-background-color, #fff);
    }
    textarea {
      min-height: 120px;
      font-family: var(--code-font-family, monospace);
    }
  `;
__decorate([
    property({ type: Object })
], HausgeistCardEditor.prototype, "config", void 0);
__decorate([
    state()
], HausgeistCardEditor.prototype, "_areas", void 0);
__decorate([
    state()
], HausgeistCardEditor.prototype, "_selectorReady", void 0);
HausgeistCardEditor = __decorate([
    customElement('hausgeist-card-editor')
], HausgeistCardEditor);
export { HausgeistCardEditor };
//# sourceMappingURL=hausgeist-card-editor.js.map