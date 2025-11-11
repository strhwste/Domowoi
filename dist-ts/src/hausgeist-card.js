var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { loadRules } from './plugin-loader';
import { SENSOR_KEYWORDS } from './sensor-keywords';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';
import { styles } from './styles';
import { Ghost3D } from './ghost-3d';
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
        this.lastTip = '';
        this.ghostLoadError = false;
        this._currentPriority = 'ok';
        this._currentAreaIndex = 0;
        this._lastAreaEvalTimestamp = 0;
        this._areaEvalInterval = 2000; // ms delay between queued evaluations
        this._areaResults = {};
        this._resolvedAreas = [];
        this._pendingAreaQueue = [];
        this._evaluationTimer = null;
        this._areaSensorCache = {};
        this._areaLastEval = {};
        this._areaMaxEvalInterval = 60000; // 60s
    }
    // Add required setConfig method for custom cards
    setConfig(config) {
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
        this._refreshAreasCache();
        this._enqueueAreasForEvaluation(this._resolvedAreas.map(a => a.area_id));
    }
    // Support the editor UI
    static async getConfigElement() {
        return document.createElement('hausgeist-card-editor');
    }
    // Provide default configuration
    static getStubConfig() {
        return {
            debug: false,
            notify: false,
            highThreshold: 2000,
            default_target: 21,
            default_adjacent_room_temp: 0,
            default_outside_temp: 15
        };
    }
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
            }
            else {
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
            this._refreshAreasCache();
            this._enqueueAreasForEvaluation(this._resolvedAreas.map(a => a.area_id), true);
        }
        catch (error) {
            console.error('[Hausgeist] Error initializing card:', error);
            this.ready = false;
        }
    }
    willUpdate(changedProps) {
        super.willUpdate(changedProps);
        if (changedProps.has('config') || changedProps.has('hass')) {
            this._refreshAreasCache();
        }
    }
    updated(changedProps) {
        super.updated(changedProps);
        const container = this.renderRoot?.querySelector('.ghost-3d-container');
        if (container && !this.ghost3D) {
            this.ghost3D = new Ghost3D({
                container,
                modelUrl: this.config.ghost_model_url || '/local/ghost.glb',
                onLoad: () => {
                    this.ghost3D.setPriority(this._currentPriority);
                    this.ghost3D.setTip(this.lastTip);
                },
                modelScale: 1.05,
                modelYOffset: 0.35,
                speechBubbleYOffset: 1.1
            });
        }
        if (container && this.ghost3D) {
            const width = container.offsetWidth || 220;
            const height = container.offsetHeight || 220;
            this.ghost3D.resize(width, height);
            container.style.width = width + 'px';
            container.style.height = height + 'px';
        }
        if (changedProps.has('config') || changedProps.has('hass')) {
            this._enqueueAreasForEvaluation(this._resolvedAreas.map(a => a.area_id));
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.ghost3D) {
            this.ghost3D.dispose();
            this.ghost3D = undefined;
        }
        if (this._evaluationTimer !== null) {
            clearTimeout(this._evaluationTimer);
            this._evaluationTimer = null;
        }
        this._pendingAreaQueue = [];
    }
    _getCurrentTip() {
        if (this.ghostLoadError) {
            return 'Geist-Modell nicht gefunden! Bitte ghost_model_url prüfen.';
        }
        return this.lastTip || '';
    }
    render() {
        if (!this.config) {
            return html `<ha-card>
        <div class="card-content">
          <p>Invalid configuration</p>
        </div>
      </ha-card>`;
        }
        if (!this.hass) {
            return html `<ha-card>
        <div class="card-content">
          <p>Home Assistant not available</p>
        </div>
      </ha-card>`;
        }
        if (!this.engine || !this.ready) {
            return html `<ha-card>
        <div class="card-content">
          <p>Loading...</p>
        </div>
      </ha-card>`;
        }
        const debugBanner = this.debug ? html `<p class="debug-banner">🛠️ Debug mode active</p>` : '';
        const debugOut = [];
        const areas = this._resolvedAreas;
        if (areas.length === 0) {
            return html `<ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <p>No areas enabled. Please enable at least one area in the card configuration.</p>
        </div>
      </ha-card>`;
        }
        const areaIds = areas.map(a => a.area_id);
        const weatherEntity = this.config.weather_entity || 'weather.home';
        if (this.debug) {
            debugOut.push(`DEBUG: Enabled areas: ${JSON.stringify(areas.map(a => a.name || a.area_id))}`);
            debugOut.push(`DEBUG: Weather entity: ${weatherEntity}`);
            debugOut.push(`DEBUG: Pending evaluations: ${this._pendingAreaQueue.join(', ') || 'none'}`);
        }
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS['de'];
        }
        // Mapping areaId -> Klartextname (aus config.areas)
        const areaIdToName = {};
        areas.forEach(a => { areaIdToName[a.area_id] = a.name || a.area_id; });
        // Bereichsrotation: Pro Render nur einen Bereich auswerten und Ergebnis zwischenspeichern
        const now = Date.now();
        if (!this._lastAreaEvalTimestamp || now - this._lastAreaEvalTimestamp > this._areaEvalInterval) {
            this._currentAreaIndex = (this._currentAreaIndex + 1) % areaIds.length;
            this._lastAreaEvalTimestamp = now;
        }
        const activeAreaId = areaIds[this._currentAreaIndex];
        // Sammle alle evals aus allen Bereichen
        let allEvals = [];
        Object.entries(this._areaResults).forEach(([area, result]) => {
            result.evals.forEach(ev => {
                if (typeof ev === 'object' && ev.message_key) {
                    const msg = (ev.message_key && this.texts[ev.message_key]) ? this.texts[ev.message_key] : ev.message_key;
                    allEvals.push({
                        msg: msg + (Object.keys(this._areaResults).length > 1 ? ` (${result.area})` : ''),
                        prio: ev.priority,
                        area: result.area
                    });
                }
            });
        });
        // Nach Prio sortieren
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        allEvals = allEvals.sort((a, b) => prioOrder[b.prio] - prioOrder[a.prio]);
        // Anzeige-Logik: Nur 1 Alert, sonst max. 3
        let shownEvals = [];
        const firstAlert = allEvals.find(ev => ev.prio === 'alert');
        if (firstAlert) {
            shownEvals = [firstAlert];
        }
        else {
            shownEvals = allEvals.slice(0, 3);
        }
        // Wichtigste Meldung als Sprechblasen-Text setzen
        const hasEvaluations = Object.keys(this._areaResults).length > 0;
        const tipText = shownEvals.length > 0
            ? shownEvals[0].msg
            : hasEvaluations
                ? (this.texts['all_ok'] || 'Alles ok!')
                : (this.texts['loading'] || 'Collecting sensor data...');
        const nextPriority = shownEvals[0]?.prio ?? 'ok';
        if (this._currentPriority !== nextPriority) {
            this._currentPriority = nextPriority;
            if (this.ghost3D) {
                this.ghost3D.setPriority(nextPriority);
            }
        }
        this.lastTip = tipText;
        if (this.ghost3D) {
            this.ghost3D.setTip(tipText);
        }
        const emptyStateTemplate = shownEvals.length === 0
            ? (hasEvaluations
                ? html `<div class="warnbox ok">${this.texts['all_ok'] || 'Alles ok!'}</div>`
                : html `<div class="warnbox info">${this.texts['loading'] || 'Collecting sensor data...'}</div>`)
            : null;
        return html `
      <ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <div class="ghost-3d-container" style="width:220px;height:220px;margin:auto;"></div>
          ${debugBanner}
          ${emptyStateTemplate ?? ''}
          ${shownEvals.map(ev => html `
            <div class="warnbox ${ev.prio}">${ev.msg}</div>
          `)}
          ${debugOut.length > 0 ? html `<pre class="debug">${debugOut.join('\n')}</pre>` : ''}
        </div>
      </ha-card>
    `;
    }
    _findSensor(states, area, usedSensors, sensorType) {
        const findState = (fn) => states.find(fn);
        let sensor;
        // 1. Try override from config
        const override = this.config?.overrides?.[area]?.[sensorType];
        if (override) {
            sensor = findState((e) => e.entity_id === override);
            if (sensor) {
                usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
                return sensor;
            }
        }
        // 2. Try auto-detected
        const autoDetected = this.config?.auto?.[area]?.[sensorType];
        if (autoDetected) {
            sensor = findState((e) => e.entity_id === autoDetected);
            if (sensor) {
                usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
                return sensor;
            }
        }
        // 3. Try device_class
        sensor = findState((e) => e.attributes?.area_id === area &&
            (e.attributes?.device_class === sensorType ||
                (sensorType === 'occupancy' && e.attributes?.device_class === 'motion') ||
                (sensorType === 'heating' && e.attributes?.device_class === 'climate')));
        if (sensor) {
            usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
            return sensor;
        }
        // 4. Try keywords
        const keywords = SENSOR_KEYWORDS[sensorType] || [sensorType];
        sensor = findState((e) => e.attributes?.area_id === area &&
            keywords.some(k => e.entity_id.toLowerCase().includes(k.toLowerCase()) ||
                (e.attributes?.friendly_name || '').toLowerCase().includes(k.toLowerCase())));
        if (sensor) {
            usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
            return sensor;
        }
        if (this.debug) {
            console.log(`[Hausgeist] No sensor found for type '${sensorType}' in area '${area}'`);
        }
        return undefined;
    }
    _getTargetTemperature(area, states, defaultTarget) {
        const target = states.find((e) => e.entity_id.endsWith('_temperature_target') &&
            e.attributes?.area_id === area);
        return Number(target?.state ?? defaultTarget);
    }
    _buildContext(area, usedSensors, states, weatherEntity, defaultTarget) {
        const findSensor = (type) => {
            return this._findSensor(states, area, usedSensors, type);
        };
        const get = (type) => {
            const s = findSensor(type);
            return s ? Number(s.state) : undefined;
        };
        const findState = (fn) => {
            const found = states.find(fn);
            return found || undefined;
        };
        const weather = findState((e) => e.entity_id === weatherEntity);
        const weatherAttributes = weather?.attributes || {};
        const forecast = weatherAttributes.forecast?.[0] || {};
        const target = this._getTargetTemperature(area, states, defaultTarget);
        const cacheObj = {
            temp: get('temperature'),
            humidity: get('humidity'),
            co2: get('co2'),
            window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
            heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
            outside_temp: Number(weatherAttributes.temperature ?? this.config.default_outside_temp ?? 15),
            occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
            forecast_temp: Number(forecast.temperature ?? 15),
            forecast_high: (() => {
                if (Array.isArray(weatherAttributes.forecast)) {
                    const today = new Date();
                    const todayStr = today.toISOString().slice(0, 10);
                    const todayForecasts = weatherAttributes.forecast.filter((f) => (f.datetime || f.datetime_iso || f.time || '').slice(0, 10) === todayStr);
                    if (todayForecasts.length > 0) {
                        return Math.max(...todayForecasts.map((f) => Number(f.temperature ?? f.temp ?? -99)));
                    }
                }
                return undefined;
            })(),
            forecast_low: (() => {
                if (Array.isArray(weatherAttributes.forecast)) {
                    const today = new Date();
                    const todayStr = today.toISOString().slice(0, 10);
                    const todayForecasts = weatherAttributes.forecast.filter((f) => (f.datetime || f.datetime_iso || f.time || '').slice(0, 10) === todayStr);
                    if (todayForecasts.length > 0) {
                        return Math.min(...todayForecasts.map((f) => Number(f.temperature ?? f.temp ?? 99)));
                    }
                }
                return undefined;
            })(),
            forecast_sun: forecast.condition === 'sunny',
            target,
            debug: this.debug,
            motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
            door: findState((e) => e.entity_id.includes('door') && e.attributes.area_id === area)?.state,
            energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
            high_threshold: this.highThreshold,
            temp_change_rate: this._calculateTempChangeRate(area, states),
            now: Date.now(),
            curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
            blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
            adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
            air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown'
        };
        // Update cache and check for changes
        const lastCache = this._areaSensorCache[area] || {};
        const lastEval = this._areaLastEval[area] || 0;
        const nowTime = Date.now();
        const maxIntervalReached = nowTime - lastEval > this._areaMaxEvalInterval;
        const changed = !lastCache || Object.keys(cacheObj).some(k => lastCache[k] !== cacheObj[k]);
        if (!changed && !maxIntervalReached) {
            return null;
        }
        this._areaSensorCache[area] = cacheObj;
        this._areaLastEval[area] = nowTime;
        return {
            ...cacheObj,
            target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
            debug: this.debug
        };
    }
    _calculateTempChangeRate(area, states) {
        try {
            const tempSensor = states.find(s => s.attributes?.area_id === area && s.entity_id.includes('temperature'));
            if (tempSensor) {
                const history = Array.isArray(tempSensor.attributes?.history) ? tempSensor.attributes.history : [];
                if (history.length >= 2) {
                    const [latest, previous] = history.slice(-2);
                    const timeDiff = (latest.timestamp - previous.timestamp) / 3600000; // Convert ms to hours
                    if (timeDiff > 0) {
                        return (latest.value - previous.value) / timeDiff;
                    }
                }
            }
        }
        catch (error) {
            console.error('Error calculating temperature change rate:', error);
        }
        return 0;
    }
    _getStatesArray() {
        if (!this.hass?.states) {
            return [];
        }
        return Array.isArray(this.hass.states) ? this.hass.states : Object.values(this.hass.states);
    }
    _resolveDefaultTarget() {
        return this.config?.overrides?.default_target ?? this.config?.default_target ?? 21;
    }
    _refreshAreasCache() {
        const configuredAreas = Array.isArray(this.config?.areas) ? this.config.areas : [];
        let resolved = configuredAreas.map(area => ({
            area_id: area.area_id,
            name: area.name || area.area_id,
            enabled: area.enabled !== false
        }));
        if (resolved.length === 0 && this.hass?.areas) {
            resolved = Object.entries(this.hass.areas).map(([id, area]) => ({
                area_id: id,
                name: area?.name || id,
                enabled: true
            }));
        }
        resolved = resolved.filter(area => area.enabled !== false && !!area.area_id);
        const oldSignature = JSON.stringify(this._resolvedAreas.map(a => `${a.area_id}:${a.name}`));
        const newSignature = JSON.stringify(resolved.map(a => `${a.area_id}:${a.name}`));
        if (oldSignature === newSignature) {
            return;
        }
        this._resolvedAreas = resolved;
        const validIds = new Set(resolved.map(a => a.area_id));
        Object.keys(this._areaResults).forEach(areaId => {
            if (!validIds.has(areaId)) {
                delete this._areaResults[areaId];
                delete this._areaSensorCache[areaId];
                delete this._areaLastEval[areaId];
            }
        });
        this._pendingAreaQueue = this._pendingAreaQueue.filter(id => validIds.has(id));
        if (this._currentAreaIndex >= this._resolvedAreas.length) {
            this._currentAreaIndex = 0;
        }
        if (this._resolvedAreas.length > 0) {
            this._enqueueAreasForEvaluation(this._resolvedAreas.map(a => a.area_id));
        }
    }
    _enqueueAreasForEvaluation(areaIds, immediate = false) {
        if (!areaIds || areaIds.length === 0) {
            return;
        }
        const pendingSet = new Set(this._pendingAreaQueue);
        let added = false;
        for (const id of areaIds) {
            if (!id || pendingSet.has(id)) {
                continue;
            }
            this._pendingAreaQueue.push(id);
            pendingSet.add(id);
            added = true;
        }
        if (!added && !immediate) {
            return;
        }
        if (this._evaluationTimer !== null) {
            if (!immediate) {
                return;
            }
            clearTimeout(this._evaluationTimer);
            this._evaluationTimer = null;
        }
        if (immediate) {
            this._processEvaluationQueue(true);
        }
        else {
            this._evaluationTimer = window.setTimeout(() => this._processEvaluationQueue(), 0);
        }
    }
    _processEvaluationQueue(processAll = false) {
        this._evaluationTimer = null;
        if (!this.engine || !this.hass?.states) {
            return;
        }
        const states = this._getStatesArray();
        const weatherEntity = this.config.weather_entity || 'weather.home';
        const defaultTarget = this._resolveDefaultTarget();
        const batchSize = processAll ? this._pendingAreaQueue.length : 1;
        let processed = 0;
        let updated = false;
        while (this._pendingAreaQueue.length > 0 && processed < batchSize) {
            const areaId = this._pendingAreaQueue.shift();
            if (!areaId) {
                continue;
            }
            const area = this._resolvedAreas.find(a => a.area_id === areaId);
            if (!area) {
                continue;
            }
            const usedSensors = [];
            const context = this._buildContext(area.area_id, usedSensors, states, weatherEntity, defaultTarget);
            if (!context) {
                processed++;
                continue;
            }
            const evals = this.engine.evaluate(context);
            this._areaResults[area.area_id] = {
                area: area.name || area.area_id,
                evals,
                usedSensors
            };
            updated = true;
            processed++;
        }
        if (this._pendingAreaQueue.length > 0) {
            this._evaluationTimer = window.setTimeout(() => this._processEvaluationQueue(), this._areaEvalInterval);
        }
        if (updated) {
            this.requestUpdate();
        }
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
// Die Klasse ist jetzt komplett frei von jeglicher Darstellungs-/Farb-/Three.js-Logik für den Geist.
// Die gesamte Visualisierung und Farblogik ist in Ghost3D ausgelagert.
//# sourceMappingURL=hausgeist-card.js.map