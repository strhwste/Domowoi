import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { loadRules } from './plugin-loader';
import { SENSOR_KEYWORDS } from './sensor-keywords';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';
import { styles } from './styles';
import { Ghost3D, GhostPriority } from './ghost-3d';

declare module 'three/examples/jsm/loaders/GLTFLoader.js';

const TRANSLATIONS = { de, en };


@customElement('hausgeist-card')
export class HausgeistCard extends LitElement {
  @property({ type: Object }) public hass: any;
  @property({ type: Object }) public config: { 
    area_id?: string; 
    overrides?: any; 
    auto?: any; 
    debug?: boolean; 
    notify?: boolean; 
    highThreshold?: number; 
    rulesJson?: string; 
    areas?: Array<{ area_id: string; name: string; enabled?: boolean }>;
    weather_entity?: string;
    default_target?: number;
    default_adjacent_room_temp?: number;
    default_outside_temp?: number;
    ghost_model_url?: string;
  } = {};
  @property({ type: Boolean }) public debug = false;
  @property({ type: Boolean }) public notify = false;
  @property({ type: Number }) public highThreshold = 2000;
  @property({ type: String }) public rulesJson = '';

  static styles = styles;

  private engine?: RuleEngine;
  private texts: Record<string, string> = TRANSLATIONS['de'];
  private ready = false;
  private ghost3D?: Ghost3D;
  private lastTip: string = '';
  private ghostLoadError: boolean = false;
  private _currentPriority: string = 'ok';
  private _currentAreaIndex: number = 0;
  private _lastAreaEvalTimestamp: number = 0;
  private _areaEvalInterval: number = 2000; // ms delay between queued evaluations
  private _areaResults: Record<string, {
    area: string;
    evals: Array<{ message_key: string; priority: string }>;
    usedSensors: { type: string; entity_id: string; value: any }[];
    context: Record<string, any>;
  }> = {};
  private _resolvedAreas: Array<{ area_id: string; name: string; enabled?: boolean }> = [];
  private _pendingAreaQueue: string[] = [];
  private _evaluationTimer: number | null = null;
  private _areaSensorCache: Record<string, { [key: string]: any }> = {};
  private _areaLastEval: Record<string, number> = {};
  private _areaMaxEvalInterval: number = 60000; // 60s
  private _tempHistory: Record<string, { timestamp: number; value: number } | undefined> = {};
  private _targetHistory: Record<string, { timestamp: number; value: number } | undefined> = {};
  private _humidityHighSince: Record<string, number | undefined> = {};
  private _windowOpenSince: Record<string, number | undefined> = {};
  private _doorOpenSince: Record<string, number | undefined> = {};
  private _currentLocale: string = 'en';

  // Add required setConfig method for custom cards
  setConfig(config: any) {
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
  public static async getConfigElement() {
    return document.createElement('hausgeist-card-editor');
  }

  // Provide default configuration
  public static getStubConfig() {
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
      } else {
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
    } catch (error) {
      console.error('[Hausgeist] Error initializing card:', error);
      this.ready = false;
    }
  }

  protected willUpdate(changedProps: PropertyValues) {
    super.willUpdate(changedProps);
    if (changedProps.has('config') || changedProps.has('hass')) {
      this._refreshAreasCache();
    }
  }

  updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    const container = this.renderRoot?.querySelector('.ghost-3d-container') as HTMLElement;
    if (container && !this.ghost3D) {
      this.ghost3D = new Ghost3D({
        container,
        modelUrl: this.config.ghost_model_url || '/local/ghost.glb',
        onLoad: () => {
          this.ghost3D!.setPriority(this._currentPriority as GhostPriority);
          this.ghost3D!.setTip(this.lastTip);
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

  private _getCurrentTip(): string {
    if (this.ghostLoadError) {
      return 'Geist-Modell nicht gefunden! Bitte ghost_model_url prüfen.';
    }
    return this.lastTip || '';
  }

  render() {
    if (!this.config) {
      return html`<ha-card>
        <div class="card-content">
          <p>Invalid configuration</p>
        </div>
      </ha-card>`;
    }

    if (!this.hass) {
      return html`<ha-card>
        <div class="card-content">
          <p>Home Assistant not available</p>
        </div>
      </ha-card>`;
    }

    if (!this.engine || !this.ready) {
      return html`<ha-card>
        <div class="card-content">
          <p>Loading...</p>
        </div>
      </ha-card>`;
    }

    const debugBanner = this.debug ? html`<p class="debug-banner">🛠️ Debug mode active</p>` : '';
    const debugOut: string[] = [];

    const areas = this._resolvedAreas;
    if (areas.length === 0) {
      return html`<ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <p>No areas enabled. Please enable at least one area in the card configuration.</p>
        </div>
      </ha-card>`;
    }

    const areaIds: string[] = areas.map(a => a.area_id);
    const weatherEntity = this.config.weather_entity || 'weather.home';

    if (this.debug) {
      debugOut.push(`DEBUG: Enabled areas: ${JSON.stringify(areas.map(a => a.name || a.area_id))}`);
      debugOut.push(`DEBUG: Weather entity: ${weatherEntity}`);
      debugOut.push(`DEBUG: Pending evaluations: ${this._pendingAreaQueue.join(', ') || 'none'}`);
    }

    const lang = this.hass.selectedLanguage || 'de';
    const langKey = lang as keyof typeof TRANSLATIONS;
    this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
    if (!this.texts || Object.keys(this.texts).length === 0) {
      this.texts = TRANSLATIONS['de'];
    }
    this._currentLocale = lang;

    // Mapping areaId -> Klartextname (aus config.areas)
    const areaIdToName: Record<string, string> = {};
    areas.forEach(a => { areaIdToName[a.area_id] = a.name || a.area_id; });

    // Bereichsrotation: Pro Render nur einen Bereich auswerten und Ergebnis zwischenspeichern
    const now = Date.now();
    if (!this._lastAreaEvalTimestamp || now - this._lastAreaEvalTimestamp > this._areaEvalInterval) {
      this._currentAreaIndex = (this._currentAreaIndex + 1) % areaIds.length;
      this._lastAreaEvalTimestamp = now;
    }
    const activeAreaId = areaIds[this._currentAreaIndex];

    // Sammle alle evals aus allen Bereichen
    let allEvals: Array<{msg: string, prio: string, area: string}> = [];
    Object.entries(this._areaResults).forEach(([_areaId, result]) => {
      result.evals.forEach(ev => {
        if (typeof ev === 'object' && ev.message_key) {
          const template = (ev.message_key && this.texts[ev.message_key]) ? this.texts[ev.message_key] : ev.message_key;
          const formatted = this._formatTemplate(template, result.context || {});
          const suffix = Object.keys(this._areaResults).length > 1 ? ` (${result.area})` : '';
          allEvals.push({
            msg: formatted + suffix,
            prio: ev.priority,
            area: result.area
          });
        }
      });
    });
    // Nach Prio sortieren
    const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
    allEvals = allEvals.sort((a, b) =>
      prioOrder[b.prio as keyof typeof prioOrder] - prioOrder[a.prio as keyof typeof prioOrder]
    );

    // Anzeige-Logik: Nur 1 Alert, sonst max. 3
    let shownEvals: typeof allEvals = [];
    const firstAlert = allEvals.find(ev => ev.prio === 'alert');
    if (firstAlert) {
      shownEvals = [firstAlert];
    } else {
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
        this.ghost3D.setPriority(nextPriority as GhostPriority);
      }
    }
    this.lastTip = tipText;
    if (this.ghost3D) {
      this.ghost3D.setTip(tipText);
    }

    const emptyStateTemplate = shownEvals.length === 0
      ? (hasEvaluations
          ? html`<div class="warnbox ok">${this.texts['all_ok'] || 'Alles ok!'}</div>`
          : html`<div class="warnbox info">${this.texts['loading'] || 'Collecting sensor data...'}</div>`)
      : null;

    return html`
      <ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <div class="ghost-3d-container" style="width:220px;height:220px;margin:auto;"></div>
          ${debugBanner}
          ${emptyStateTemplate ?? ''}
          ${shownEvals.map(ev => html`
            <div class="warnbox ${ev.prio}">${ev.msg}</div>
          `)}
          ${debugOut.length > 0 ? html`<pre class="debug">${debugOut.join('\n')}</pre>` : ''}
        </div>
      </ha-card>
    `;
  }

  private _findSensor(states: any[], area: string, usedSensors: Array<{ type: string; entity_id: string; value: any }>, sensorType: string): any {
    const findState = (fn: (e: any) => boolean) => states.find(fn);
    let sensor;

    // 1. Try override from config
    const override = this.config?.overrides?.[area]?.[sensorType];
    if (override) {
      sensor = findState((e: any) => e.entity_id === override);
      if (sensor) {
        usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
        return sensor;
      }
    }

    // 2. Try auto-detected
    const autoDetected = this.config?.auto?.[area]?.[sensorType];
    if (autoDetected) {
      sensor = findState((e: any) => e.entity_id === autoDetected);
      if (sensor) {
        usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
        return sensor;
      }
    }

    // 3. Try device_class
    sensor = findState((e: any) => 
      e.attributes?.area_id === area && 
      (e.attributes?.device_class === sensorType ||
       (sensorType === 'occupancy' && e.attributes?.device_class === 'motion') ||
       (sensorType === 'heating' && e.attributes?.device_class === 'climate'))
    );
    if (sensor) {
      usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
      return sensor;
    }

    // 4. Try keywords
    const keywords = SENSOR_KEYWORDS[sensorType] || [sensorType];
    sensor = findState((e: any) => 
      e.attributes?.area_id === area && 
      keywords.some(k => 
        e.entity_id.toLowerCase().includes(k.toLowerCase()) || 
        (e.attributes?.friendly_name || '').toLowerCase().includes(k.toLowerCase())
      )
    );
    if (sensor) {
      usedSensors.push({ type: sensorType, entity_id: sensor.entity_id, value: sensor.state });
      return sensor;
    }

    if (this.debug) {
      console.log(`[Hausgeist] No sensor found for type '${sensorType}' in area '${area}'`);
    }
    return undefined;
  }

  private _getTargetTemperature(area: string, states: any[], defaultTarget: number): number {
    const target = states.find((e: any) => 
      e.entity_id.endsWith('_temperature_target') && 
      e.attributes?.area_id === area
    );
    return Number(target?.state ?? defaultTarget);
  }

  private _buildContext(
    area: string, 
    usedSensors: Array<{ type: string; entity_id: string; value: any }>, 
    states: any[],
    weatherEntity: string,
    defaultTarget: number
  ): Record<string, any> | null {
    const findSensor = (type: keyof typeof SENSOR_KEYWORDS) => {
      return this._findSensor(states, area, usedSensors, type);
    };

    const get = (type: keyof typeof SENSOR_KEYWORDS): number | undefined => {
      const sensor = findSensor(type);
      if (!sensor) {
        return undefined;
      }
      const value = Number(sensor.state);
      return Number.isFinite(value) ? value : undefined;
    };

    const findState = (fn: (e: any) => boolean) => {
      const found = states.find(fn);
      return found || undefined;
    };

    const weather = findState((e: any) => e.entity_id === weatherEntity);
    const weatherAttributes = weather?.attributes || {};
    const forecast = weatherAttributes.forecast?.[0] || {};
    const target = this._getTargetTemperature(area, states, defaultTarget);
    const nowTime = Date.now();
    const tempSensor = findSensor('temperature');
    const rawTemp = tempSensor ? Number(tempSensor.state) : undefined;
    const temp = typeof rawTemp === 'number' && Number.isFinite(rawTemp) ? rawTemp : undefined;
    const heatingSensor = findSensor('heating');
    const heatingLevelSensor = findSensor('heating_level');
    const windowSensor = findSensor('window');
    const doorSensor = findSensor('door');
    const curtainSensor = findSensor('curtain');
    const blindSensor = findSensor('blind');
    const occupancySensor = findSensor('occupancy');
    const motionSensor = findSensor('motion');
    const energySensor = findSensor('energy');
    const airQualitySensor = findSensor('air_quality');

    const toContactState = (value: any): 'open' | 'closed' | 'unknown' => {
      if (typeof value !== 'string') {
        return 'unknown';
      }
      const normalized = value.toLowerCase();
      if (['open', 'on', 'opened', 'active', 'detected', 'true', 'raising', 'opening', 'up'].includes(normalized)) {
        return 'open';
      }
      if (['closed', 'off', 'inactive', 'false', 'shut', 'down', 'lowered'].includes(normalized)) {
        return 'closed';
      }
      return 'unknown';
    };

    const toBool = (value: any): boolean => {
      if (typeof value === 'boolean') {
        return value;
      }
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        return ['on', 'true', 'home', 'occupied', 'present', 'detected', 'motion', 'active'].includes(normalized);
      }
      return Boolean(value);
    };

    const isFiniteNumber = (value: unknown): value is number =>
      typeof value === 'number' && Number.isFinite(value);

    const heatingLevelRaw = heatingLevelSensor ? Number(heatingLevelSensor.state) : NaN;
    const heatingLevel = Number.isFinite(heatingLevelRaw) ? heatingLevelRaw : undefined;
    const hvacAction = typeof heatingSensor?.attributes?.hvac_action === 'string'
      ? heatingSensor.attributes.hvac_action.toLowerCase()
      : undefined;
    const hvacActionAlt = typeof heatingSensor?.attributes?.action === 'string'
      ? heatingSensor.attributes.action.toLowerCase()
      : undefined;
    const hvacMode = typeof heatingSensor?.attributes?.hvac_mode === 'string'
      ? heatingSensor.attributes.hvac_mode.toLowerCase()
      : undefined;
    const heatingStateRaw = typeof heatingSensor?.state === 'string'
      ? heatingSensor.state.toLowerCase()
      : undefined;
    const heatingCall = (() => {
      const action = hvacAction || hvacActionAlt;
      if (action) {
        return ['heating', 'heat', 'preheating', 'boost', 'aux_heat', 'supplemental heat'].includes(action);
      }
      if (typeof heatingLevel === 'number' && heatingLevel > 5) {
        return true;
      }
      if (heatingStateRaw) {
        return ['on', 'heating', 'heat', 'boost'].includes(heatingStateRaw);
      }
      return false;
    })();
    const heatingEffort = heatingCall || (typeof heatingLevel === 'number' && heatingLevel > 10);
    const heatingState = hvacAction || heatingStateRaw || hvacMode || 'unknown';

    const baselineTarget = this._resolveDefaultTarget();
    const hasValidTarget = Number.isFinite(target) && target > 0;
    const effectiveTarget = hasValidTarget ? target : baselineTarget;
    const comfortHigh = Math.max(effectiveTarget, baselineTarget);
    const comfortLow = effectiveTarget;
    const targetChange = this._trackTargetChange(area, target, nowTime);

    const humidity = get('humidity');
    const co2 = get('co2');
    const humidityHighMinutes = this._updateActiveDuration(
      this._humidityHighSince,
      area,
      isFiniteNumber(humidity) && humidity >= 65,
      nowTime
    );

    const windowState = toContactState(windowSensor?.state);
    const windowOpenMinutes = this._updateActiveDuration(
      this._windowOpenSince,
      area,
      windowState === 'open',
      nowTime
    );

    const doorState = toContactState(doorSensor?.state);
    const doorOpenMinutes = this._updateActiveDuration(
      this._doorOpenSince,
      area,
      doorState === 'open',
      nowTime
    );

    const outsideTempRaw = Number(weatherAttributes.temperature);
    const outsideTemp = Number.isFinite(outsideTempRaw)
      ? outsideTempRaw
      : Number(this.config.default_outside_temp ?? 15);

  const forecastTempRaw = Number(forecast.temperature ?? forecast.temp);
  const forecastTemp = Number.isFinite(forecastTempRaw) ? forecastTempRaw : outsideTemp;

    const energyRaw = energySensor ? Number(energySensor.state) : NaN;
    const energy = Number.isFinite(energyRaw) ? energyRaw : 0;

    const motion = toBool(motionSensor?.state);
    const occupied = toBool(occupancySensor?.state);

    const curtainState = toContactState(curtainSensor?.state);
    const blindState = toContactState(blindSensor?.state);

    const airQualityState = typeof airQualitySensor?.state === 'string'
      ? airQualitySensor.state
      : 'unknown';

    const forecastEntries = Array.isArray(weatherAttributes.forecast)
      ? weatherAttributes.forecast
      : [];
    const todayStr = new Date(nowTime).toISOString().slice(0, 10);
    const todayTemps = forecastEntries
      .filter((f: any) => {
        const raw = f.datetime || f.datetime_iso || f.time;
        return typeof raw === 'string' && raw.slice(0, 10) === todayStr;
      })
      .map((f: any) => Number(f.temperature ?? f.temp))
      .filter((value: number) => Number.isFinite(value));
  const forecastHigh = todayTemps.length > 0 ? Math.max(...todayTemps) : undefined;
  const forecastLow = todayTemps.length > 0 ? Math.min(...todayTemps) : undefined;
  const forecastCondition = typeof forecast.condition === 'string' ? forecast.condition.toLowerCase() : '';

    const adjacentSensor = findSensor('adjacent');
    let adjacentRoomTemp: number | undefined;
    if (adjacentSensor) {
      const raw = Number(adjacentSensor.state);
      adjacentRoomTemp = Number.isFinite(raw) ? raw : undefined;
    }
    if (typeof adjacentRoomTemp === 'undefined') {
      const fallbackAdjacent = findState((e: any) =>
        e.entity_id.includes('adjacent') &&
        e.entity_id.includes('temperature') &&
        e.attributes.area_id === area
      );
      const rawFallback = fallbackAdjacent ? Number(fallbackAdjacent.state) : NaN;
      adjacentRoomTemp = Number.isFinite(rawFallback) ? rawFallback : undefined;
    }

    const rainSoon = (() => {
      if (!Array.isArray(weatherAttributes.forecast) || weatherAttributes.forecast.length === 0) {
        return false;
      }
      const horizon = nowTime + 2 * 3600000; // ~2 hours lookahead
      return weatherAttributes.forecast.some((entry: any) => {
        const rawTime = entry.datetime || entry.datetime_iso || entry.time;
        const timestamp = rawTime ? Date.parse(rawTime) : NaN;
        if (!Number.isFinite(timestamp)) {
          return false;
        }
        if (timestamp < nowTime || timestamp > horizon) {
          return false;
        }
        const precipitation = Number(entry.precipitation ?? entry.rain ?? 0);
        const probability = Number(entry.precipitation_probability ?? entry.probability ?? entry.chance_of_rain ?? 0);
        const hasPrecip = Number.isFinite(precipitation) && precipitation > 0;
        const hasProbability = Number.isFinite(probability) && probability >= 50;
        return hasPrecip || hasProbability;
      });
    })();

    const cacheObj = {
      temp,
      target,
      effective_target: effectiveTarget,
      comfort_high: comfortHigh,
      comfort_low: comfortLow,
      target_recently_changed: targetChange.recentlyChanged,
      target_change_minutes: targetChange.minutesSinceChange,
      humidity,
      humidity_high_minutes: humidityHighMinutes,
      co2,
      window: windowState,
      window_open_minutes: windowOpenMinutes,
      heating: heatingState,
      heating_call: heatingCall,
      heating_effort: Boolean(heatingEffort),
      heating_level: heatingLevel,
      outside_temp: outsideTemp,
      occupied,
      forecast_temp: forecastTemp,
      forecast_high: forecastHigh,
      forecast_low: forecastLow,
      forecast_sun: ['sunny', 'clear', 'partlycloudy', 'partly-cloudy-day', 'partly cloudy'].includes(forecastCondition),
      debug: this.debug,
      motion,
      door: doorState,
      door_open_minutes: doorOpenMinutes,
      energy,
      high_threshold: this.highThreshold,
      rain_soon: rainSoon,
      temp_change_rate: this._calculateTempChangeRate(area, tempSensor),
      now: nowTime,
      curtain: curtainState,
      blind: blindState,
      adjacent_room_temp: adjacentRoomTemp,
      air_quality: airQualityState
    };

    // Update cache and check for changes
    const lastCache = this._areaSensorCache[area] || {};
    const lastEval = this._areaLastEval[area] || 0;
    const maxIntervalReached = nowTime - lastEval > this._areaMaxEvalInterval;
    const changed = !lastCache || Object.keys(cacheObj).some(k => lastCache[k] !== cacheObj[k as keyof typeof cacheObj]);

    if (!changed && !maxIntervalReached) {
      return null;
    }

    this._areaSensorCache[area] = cacheObj;
    this._areaLastEval[area] = nowTime;

    return cacheObj;
  }

  private _formatTemplate(template: string, context: Record<string, any>): string {
    if (!template || template.indexOf('{{') === -1) {
      return template;
    }

    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key: string) => {
      const value = this._getContextValue(context, key);
      return this._formatContextValue(key, value);
    });
  }

  private _getContextValue(context: Record<string, any>, key: string): any {
    if (!context) {
      return undefined;
    }

    if (key.includes('.')) {
      return key.split('.').reduce((acc: any, part: string) => (acc != null ? acc[part] : undefined), context);
    }

    return context[key];
  }

  private _formatContextValue(key: string, value: any): string {
    if (value === undefined || value === null) {
      return '–';
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        return '–';
      }
      const options = this._getNumberFormatOptionsForKey(key);
      try {
        return new Intl.NumberFormat(this._currentLocale || 'de', options).format(value);
      } catch (error) {
        console.warn('[Hausgeist] Number formatting failed for key', key, error);
        return String(value);
      }
    }

    if (typeof value === 'boolean') {
      return value ? (this.texts['yes'] || 'yes') : (this.texts['no'] || 'no');
    }

    return String(value);
  }

  private _getNumberFormatOptionsForKey(key: string): Intl.NumberFormatOptions {
    if (key.endsWith('_minutes')) {
      return { maximumFractionDigits: 0 };
    }
    if (key.endsWith('_rate')) {
      return { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    }
    if (key.includes('humidity') || key.includes('co2') || key.includes('energy')) {
      return { maximumFractionDigits: 0 };
    }
    if (key.includes('temp') || key.includes('target')) {
      return { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    }
    return { minimumFractionDigits: 0, maximumFractionDigits: 1 };
  }

  private _calculateTempChangeRate(area: string, tempSensor?: any): number {
    if (!tempSensor) {
      return 0;
    }

    const rawValue = Number(tempSensor.state);
    if (!Number.isFinite(rawValue)) {
      return 0;
    }

    const timeSource = tempSensor.last_updated || tempSensor.last_changed || tempSensor.attributes?.last_updated;
    let timestamp = typeof timeSource === 'number' ? timeSource : undefined;
    if (!timestamp && typeof timeSource === 'string') {
      const parsed = Date.parse(timeSource);
      if (Number.isFinite(parsed)) {
        timestamp = parsed;
      }
    }
    if (!timestamp && timeSource instanceof Date) {
      timestamp = timeSource.getTime();
    }
    if (!timestamp) {
      timestamp = Date.now();
    }

    const previous = this._tempHistory[area];
    this._tempHistory[area] = { timestamp, value: rawValue };

    if (!previous || timestamp <= previous.timestamp) {
      return 0;
    }

    const timeDiffHours = (timestamp - previous.timestamp) / 3600000;
    if (timeDiffHours <= 0) {
      return 0;
    }

    const rate = (rawValue - previous.value) / timeDiffHours;
    return Number.isFinite(rate) ? rate : 0;
  }

  private _trackTargetChange(area: string, target: number, timestamp: number): { recentlyChanged: boolean; minutesSinceChange: number } {
    if (!Number.isFinite(target)) {
      this._targetHistory[area] = undefined;
      return { recentlyChanged: false, minutesSinceChange: Number.POSITIVE_INFINITY };
    }

    const previous = this._targetHistory[area];
    if (!previous) {
      this._targetHistory[area] = { timestamp, value: target };
      return { recentlyChanged: false, minutesSinceChange: Number.POSITIVE_INFINITY };
    }

    const changed = previous.value !== target;
    if (changed) {
      this._targetHistory[area] = { timestamp, value: target };
      return { recentlyChanged: true, minutesSinceChange: 0 };
    }

    const minutesSinceChange = Math.max(0, (timestamp - previous.timestamp) / 60000);
    return {
      recentlyChanged: minutesSinceChange < 30,
      minutesSinceChange
    };
  }

  private _updateActiveDuration(store: Record<string, number | undefined>, area: string, active: boolean, now: number): number {
    if (active) {
      if (!store[area]) {
        store[area] = now;
        return 0;
      }
      const minutes = (now - store[area]!) / 60000;
      return minutes > 0 ? minutes : 0;
    }
    store[area] = undefined;
    return 0;
  }

  private _getStatesArray(): any[] {
    if (!this.hass?.states) {
      return [];
    }
    return Array.isArray(this.hass.states) ? this.hass.states : Object.values(this.hass.states);
  }

  private _resolveDefaultTarget(): number {
    return this.config?.overrides?.default_target ?? this.config?.default_target ?? 21;
  }

  private _refreshAreasCache(): void {
    const configuredAreas = Array.isArray(this.config?.areas) ? this.config!.areas : [];
    let resolved = configuredAreas.map(area => ({
      area_id: area.area_id,
      name: area.name || area.area_id,
      enabled: area.enabled !== false
    }));

    if (resolved.length === 0 && this.hass?.areas) {
      resolved = Object.entries(this.hass.areas).map(([id, area]: [string, any]) => ({
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

  private _enqueueAreasForEvaluation(areaIds: string[], immediate = false): void {
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
    } else {
      this._evaluationTimer = window.setTimeout(() => this._processEvaluationQueue(), 0);
    }
  }

  private _processEvaluationQueue(processAll = false): void {
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

      const usedSensors: Array<{ type: string; entity_id: string; value: any }> = [];
      const context = this._buildContext(
        area.area_id,
        usedSensors,
        states,
        weatherEntity,
        defaultTarget
      );

      if (!context) {
        processed++;
        continue;
      }

      const evals = this.engine.evaluate(context);
      const contextForResult = {
        ...context,
        area_id: area.area_id,
        area_name: area.name || area.area_id
      };
      this._areaResults[area.area_id] = {
        area: area.name || area.area_id,
        evals,
        usedSensors,
        context: contextForResult
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
}

// Die Klasse ist jetzt komplett frei von jeglicher Darstellungs-/Farb-/Three.js-Logik für den Geist.
// Die gesamte Visualisierung und Farblogik ist in Ghost3D ausgelagert.
