var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { RuleEngine } from './rule-engine';
import { filterSensorsByArea } from './utils';
import { loadRules } from './plugin-loader';
import en from '../translations/en.json';
import de from '../translations/de.json';
import './hausgeist-card-editor';
import { styles } from './styles';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
        }
        catch (error) {
            console.error('[Hausgeist] Error initializing card:', error);
            this.ready = false;
        }
    }
    // Canvas-Initialisierung nach jedem Render sicherstellen
    updated(changedProps) {
        super.updated(changedProps);
        // Versuche, die Größe des Containers an die Kartengröße anzupassen
        const container = this.renderRoot?.querySelector('.ghost-3d-container');
        if (container) {
            const card = container.closest('ha-card');
            if (card) {
                const width = card.offsetWidth || 320;
                const height = Math.max(240, Math.round(width * 0.8));
                if (this.ghostRenderer) {
                    this.ghostRenderer.setSize(width, height);
                }
                container.style.width = width + 'px';
                container.style.height = height + 'px';
            }
        }
        this._initGhost3D();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.ghostAnimationId) {
            cancelAnimationFrame(this.ghostAnimationId);
        }
        if (this.ghostRenderer) {
            this.ghostRenderer.dispose();
        }
    }
    async _initGhost3D() {
        // Avoid double init
        if (this.ghostRenderer)
            return;
        const container = this.renderRoot?.querySelector('.ghost-3d-container');
        if (!container)
            return;
        // Canvas
        this.ghostRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.ghostRenderer.setClearColor(0x000000, 0);
        this.ghostRenderer.setSize(320, 320);
        this.ghostRenderer.shadowMap.enabled = true;
        this.ghostRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.ghostCanvas = this.ghostRenderer.domElement;
        if (this.ghostCanvas) {
            this.ghostCanvas.style.display = 'block';
            this.ghostCanvas.style.margin = '0 auto';
            this.ghostCanvas.style.pointerEvents = 'none';
            container.appendChild(this.ghostCanvas);
        }
        // Scene
        this.ghostScene = new THREE.Scene();
        // Camera
        this.ghostCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.ghostCamera.position.set(0, 1, 3);
        // Weiche, helle Beleuchtung
        this.ghostScene.add(new THREE.AmbientLight(0xffffff, 0.8));
        this.ghostScene.add(new THREE.HemisphereLight(0xffffff, 0x8888ff, 0.7));
        // SpotLight für Bodenschatten
        const groundLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI / 3, 0.5, 1);
        groundLight.position.set(0, 3, 0);
        groundLight.target.position.set(0, 0, 0);
        groundLight.castShadow = true;
        groundLight.shadow.mapSize.width = 2048;
        groundLight.shadow.mapSize.height = 2048;
        groundLight.shadow.camera.near = 0.1;
        groundLight.shadow.camera.far = 10;
        groundLight.shadow.camera.fov = 45;
        groundLight.shadow.bias = -0.01; // Leichtes Bias, um Schattenartefakte zu vermeiden
        groundLight.shadow.radius = 2; // Weicher Schatten
        groundLight.shadow.normalBias = 0.05; // Normal Bias für weichere Schatten
        groundLight.shadow.penumbra = 0.7; // Leichte Penumbra für weichere Kanten
        this.ghostScene.add(groundLight);
        this.ghostScene.add(groundLight.target);
        // Boden für Schatten
        const groundGeo = new THREE.PlaneGeometry(4, 4);
        const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
        const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        groundMesh.position.y = 0;
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.ghostScene.add(groundMesh);
        // Load GLB
        const loader = new GLTFLoader();
        const modelUrl = this.config.ghost_model_url || '/local/ghost.glb';
        loader.load(modelUrl, (gltf) => {
            this.ghostModel = gltf.scene;
            this.ghostModel.position.set(0, 1.8, 0);
            this.ghostModel.scale.set(1.2, 1.2, 1.2);
            // Schatten aktivieren und Material aufhellen
            this.ghostModel.traverse((obj) => {
                if (obj.isMesh) {
                    obj.castShadow = true;
                    obj.receiveShadow = false;
                    if (obj.material && obj.material.color) {
                        obj.material.color.multiplyScalar(1.8); // Helle das Material auf
                        obj.material.emissive.set(0x222222); // Leichtes Emissive für sanftes Leuchten
                        obj.material.emissiveIntensity = 0.8; // Sanftes Leuchten
                    }
                }
            });
            this.ghostScene.add(this.ghostModel);
            this.ghostLoadError = false;
            // Add 3D speech bubble
            this._createGhostSpeechBubble(this.lastTip);
            this._animateGhost();
        }, undefined, (err) => {
            this.ghostLoadError = true;
            this.requestUpdate();
        });
    }
    _createGhostSpeechBubble(text) {
        // Hochauflösende Canvas für scharfen Text
        const scale = 3; // 3x Auflösung für Schärfe
        const baseWidth = 380, baseHeight = 100;
        this.ghostSpeechCanvas = document.createElement('canvas');
        this.ghostSpeechCanvas.width = baseWidth * scale;
        this.ghostSpeechCanvas.height = baseHeight * scale;
        this.ghostSpeechCtx = this.ghostSpeechCanvas.getContext('2d');
        // Initiales Zeichnen
        this._updateGhostSpeechTexture(text, scale);
        this.ghostSpeechTexture = new THREE.Texture(this.ghostSpeechCanvas);
        this.ghostSpeechTexture.needsUpdate = true;
        // Plane-Geometrie bleibt wie gehabt
        const geometry = new THREE.PlaneGeometry(2.2, 0.6);
        const material = new THREE.MeshBasicMaterial({ map: this.ghostSpeechTexture, transparent: true });
        this.ghostSpeechMesh = new THREE.Mesh(geometry, material);
        this.ghostSpeechMesh.position.set(0, 2.0, 0);
        this.ghostSpeechMesh.renderOrder = 2;
        this.ghostScene.add(this.ghostSpeechMesh);
    }
    _updateGhostSpeechTexture(text, scale = 1) {
        if (!this.ghostSpeechCanvas || !this.ghostSpeechCtx)
            return;
        const ctx = this.ghostSpeechCtx;
        ctx.clearRect(0, 0, this.ghostSpeechCanvas.width, this.ghostSpeechCanvas.height);
        ctx.save();
        ctx.scale(scale, scale);
        // Sprechblasen-Hintergrund
        ctx.fillStyle = 'rgba(255,255,255,0.97)';
        ctx.strokeStyle = 'rgba(180,180,180,0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(25, 10);
        ctx.lineTo(355, 10);
        ctx.quadraticCurveTo(370, 10, 370, 30);
        ctx.lineTo(370, 80);
        ctx.quadraticCurveTo(370, 95, 355, 95);
        ctx.lineTo(25, 95);
        ctx.quadraticCurveTo(10, 95, 10, 80);
        ctx.lineTo(10, 30);
        ctx.quadraticCurveTo(10, 10, 25, 10);
        // Sprechblasen-Zipfel
        ctx.moveTo(190, 95);
        ctx.lineTo(205, 120);
        ctx.lineTo(175, 95);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Text
        ctx.font = `bold ${20 * scale}px sans-serif`;
        ctx.fillStyle = '#222';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this._wrapText(ctx, text, 190, 52, 320, 24, scale);
        ctx.restore();
        if (this.ghostSpeechTexture) {
            this.ghostSpeechTexture.needsUpdate = true;
        }
    }
    _wrapText(ctx, text, x, y, maxWidth, lineHeight, scale = 1) {
        x *= scale;
        y *= scale;
        maxWidth *= scale;
        lineHeight *= scale;
        const words = text.split(' ');
        let line = '';
        let lines = [];
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + ' ';
            }
            else {
                line = testLine;
            }
        }
        lines.push(line);
        const totalHeight = lines.length * lineHeight;
        let offsetY = y - totalHeight / 2 + lineHeight / 2;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i].trim(), x, offsetY);
            offsetY += lineHeight;
        }
    }
    _getCurrentTip() {
        // Finde den aktuellen Tipp (wie bisher in render())
        if (this.ghostLoadError) {
            return 'Geist-Modell nicht gefunden! Bitte ghost_model_url prüfen.';
        }
        // Versuche, den aktuellen Tipp aus dem letzten Render zu holen
        if (this.lastTip)
            return this.lastTip;
        return '';
    }
    _animateGhost() {
        if (!this.ghostScene || !this.ghostCamera || !this.ghostRenderer || !this.ghostModel)
            return;
        const t = performance.now() * 0.001;
        // Schwebende Animation
        this.ghostModel.position.y = 0.5 + Math.sin(t * 2) * 0.1;
        this.ghostModel.rotation.y = Math.sin(t * 0.5) * 0.3;
        // Speech bubble folgt dem Geist
        if (this.ghostSpeechMesh) {
            this.ghostSpeechMesh.position.x = this.ghostModel.position.x;
            this.ghostSpeechMesh.position.z = this.ghostModel.position.z;
            this.ghostSpeechMesh.position.y = this.ghostModel.position.y + 1.1;
            this.ghostSpeechMesh.lookAt(this.ghostCamera.position);
        }
        this.ghostRenderer.render(this.ghostScene, this.ghostCamera);
        this.ghostAnimationId = requestAnimationFrame(() => this._animateGhost());
    }
    // Find sensor by type in area, with overrides and auto-detection
    _findSensor(sensors, area, usedSensors, sensorType) {
        if (this.debug) {
            console.log(`[_findSensor] Looking for ${sensorType} in area ${area}`);
            console.log(`[_findSensor] config.overrides[${area}]:`, this.config?.overrides?.[area]);
            // console.log(`[_findSensor] config.auto[${area}]:`, this.config?.auto?.[area]);
        }
        // 1. Check for manual override in config
        const overrideId = this.config?.overrides?.[area]?.[sensorType];
        if (overrideId) {
            const sensor = sensors.find((s) => s.entity_id === overrideId);
            if (sensor) {
                usedSensors.push({
                    type: `${sensorType} (override)`,
                    entity_id: sensor.entity_id,
                    value: sensor.state
                });
                return sensor;
            }
            if (this.debug)
                console.log(`[_findSensor] Override sensor ${overrideId} not found`);
        }
        // 2. Check auto-detected sensor from config (auskommentiert)
        // const autoId = this.config?.auto?.[area]?.[sensorType];
        // if (autoId) {
        //   const sensor = sensors.find((s) => s.entity_id === autoId);
        //   if (sensor) {
        //     usedSensors.push({
        //       type: `${sensorType} (auto)`,
        //       entity_id: sensor.entity_id,
        //       value: sensor.state
        //     });
        //     return sensor;
        //   }
        //   if (this.debug) console.log(`[_findSensor] Auto sensor ${autoId} not found`);
        // }
        // 3. Not found
        if (this.debug) {
            usedSensors.push({
                type: sensorType,
                entity_id: '[NOT FOUND]',
                value: 'No matching sensor found'
            });
        }
        return undefined;
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
        const { states } = this.hass;
        // Ensure states is always an array for downstream logic
        const statesArray = Array.isArray(states) ? states : Object.values(states || {});
        // If no areas are configured, use all areas from Home Assistant
        let areas = this.config.areas || [];
        if (areas.length === 0 && this.hass.areas) {
            areas = Object.entries(this.hass.areas).map(([id, area]) => ({
                area_id: id,
                name: area.name || id,
                enabled: true
            }));
        }
        // Filter enabled areas
        areas = areas.filter(a => a.enabled !== false);
        // If no areas are enabled, show a message
        if (areas.length === 0) {
            return html `<ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist</h2>
          <p>No areas enabled. Please enable at least one area in the card configuration.</p>
        </div>
      </ha-card>`;
        }
        const areaIds = areas.map(a => a.area_id);
        const prioOrder = { alert: 3, warn: 2, info: 1, ok: 0 };
        const defaultTarget = this.config?.overrides?.default_target || 21;
        const weatherEntity = this.config.weather_entity || 'weather.home';
        if (this.debug) {
            debugOut.push(`DEBUG: Enabled areas: ${JSON.stringify(areas.map(a => a.name || a.area_id))}`);
            debugOut.push(`DEBUG: Weather entity: ${weatherEntity}`);
        }
        const lang = this.hass.selectedLanguage || 'de';
        const langKey = lang;
        this.texts = TRANSLATIONS[langKey] || TRANSLATIONS['de'];
        if (!this.texts || Object.keys(this.texts).length === 0) {
            this.texts = TRANSLATIONS['de'];
        }
        // Mapping areaId -> Klartextname (aus config.areas)
        const areaIdToName = {};
        areas.forEach(a => { areaIdToName[a.area_id] = a.name; });
        const areaMessages = areaIds.map((area) => {
            const sensors = filterSensorsByArea(statesArray, area);
            const usedSensors = [];
            if (this.debug) {
                debugOut.push(`Processing area: ${area}`);
                debugOut.push(`Available sensors: ${sensors.map((s) => s.entity_id).join(', ')}`);
                debugOut.push(`Configured overrides: ${JSON.stringify(this.config?.overrides?.[area])}`);
                debugOut.push(`Auto-detected sensors: ${JSON.stringify(this.config?.auto?.[area])}`);
            }
            // Use imported SENSOR_KEYWORDS from sensor-keywords.ts
            const findSensor = (cls) => {
                return this._findSensor(statesArray, area, usedSensors, cls);
            };
            // Ensure all required sensor types are checked for sensor presence (for usedSensors and warning logic)
            const requiredSensorTypes = [
                'temperature', 'humidity', 'co2', 'window', 'door', 'curtain', 'blind', 'heating', 'energy', 'motion', 'occupancy', 'air_quality', 'rain', 'sun', 'adjacent', 'forecast'
            ];
            // Call findSensor for all required types to populate usedSensors, even if not used in context
            requiredSensorTypes.forEach(type => { findSensor(type); });
            const get = (cls) => {
                const s = findSensor(cls);
                return s ? Number(s.state) : undefined;
            };
            // Helper to always cast to 'any' for state lookups
            const findState = (fn) => {
                const found = statesArray.find(fn);
                return found ? found : undefined;
            };
            // Get target temperature, default to config override or 21°C
            // Wetterdaten holen
            // Nutze die weather_entity aus der aktuellen config (Editor-Auswahl), fallback auf Standard
            const weatherEntityId = this.config.weather_entity || weatherEntity || 'weather.home';
            const weather = findState((e) => e.entity_id === weatherEntityId);
            const weatherAttributes = weather?.attributes || {};
            const forecast = weatherAttributes.forecast?.[0] || {};
            const context = {
                target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
                temp: get('temperature'),
                humidity: get('humidity'),
                co2: get('co2'),
                window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
                heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
                outside_temp: Number(weatherAttributes.temperature ?? this.config.default_outside_temp ?? 15),
                occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
                forecast_temp: Number(forecast.temperature ?? 15),
                energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
                high_threshold: this.highThreshold,
                temp_change_rate: this._calculateTempChangeRate(area, states),
                now: Date.now(),
                curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
                blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
                adjacent_room_temp: Number((findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? this.config.default_adjacent_room_temp) || 0),
                rain_soon: typeof forecast.precipitation === 'number' && forecast.precipitation > 0,
                air_quality: (() => {
                    const airQualityState = findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state;
                    return airQualityState !== undefined ? airQualityState : 'unknown';
                })(),
                forecast_sun: forecast.condition === 'sunny',
                debug: this.debug,
                motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
                door: findState((e) => e.entity_id.includes('door') && e.attributes.area_id === area)?.state,
            };
            const evals = this.engine ? this.engine.evaluate(context) : [];
            if (this.debug) {
                debugOut.push(`--- ${area} ---\n` +
                    'Sensors used:\n' +
                    usedSensors.map((s) => `  [${s.type}] ${s.entity_id}: ${s.value}`).join('\n') +
                    `\nRules checked: ${this.engine ? this.engine['rules'].length : 0}\n` +
                    `Rules matched: ${evals.length}\n` +
                    evals.map((ev) => `${ev.priority}: ${ev.message_key}`).join("\n"));
            }
            return { area: areaIdToName[area] || area, evals, usedSensors };
        });
        // Only show areas with rule matches
        const topMessages = areaMessages
            .filter((a) => a.evals.length > 0)
            .map((a) => {
            // Pick highest priority message for each area
            const top = a.evals.sort((a, b) => (prioOrder[b.priority] || 0) - (prioOrder[a.priority] || 0))[0];
            if (!top || !top.message_key) {
                return undefined; // Skip if no valid message
            }
            if (this.debug) {
                debugOut.push(`Top message for ${a.area}: ${top.priority} - ${top.message_key}`);
            }
            return { area: a.area, ...top, usedSensors: a.usedSensors };
        })
            .filter((e) => !!e);
        const anySensorsUsed = areaMessages.some((areaMsg) => areaMsg.usedSensors?.some((s) => s.entity_id !== '[NOT FOUND]'));
        const anyRulesApplied = areaMessages.some((a) => a.evals.length > 0);
        // Finde den aktuellen Tipp (höchste Priorität)
        let currentTip = '';
        if (this.ghostLoadError) {
            currentTip = 'Geist-Modell nicht gefunden! Bitte ghost_model_url prüfen.';
        }
        else if (topMessages.length > 0) {
            currentTip = this.texts?.[topMessages[0].message_key] || topMessages[0].message_key;
        }
        // Merke den aktuellen Tipp für die Sprechblase
        this.lastTip = currentTip;
        // Wenn die Sprechblase existiert, Text aktualisieren
        if (this.ghostSpeechMesh && this.ghostSpeechCtx) {
            this._updateGhostSpeechTexture(currentTip);
        }
        return html `
      <style>
        .ghost-3d-container {
          width: 100%;
          height: 100%;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
      </style>
      <div class="ghost-3d-container">
        <!-- Three.js Canvas wird dynamisch eingefügt -->
      </div>
      ${debugBanner}
      <ha-card>
        <div class="card-content">
          <h2>👻 Hausgeist sagt:</h2>
          ${!anySensorsUsed
            ? html `<p class="warning">⚠️ Keine Sensoren in den aktivierten Bereichen gefunden!<br>Bitte überprüfen Sie die Sensor-Konfiguration oder weisen Sie den Sensoren die entsprechenden Bereiche zu.</p>`
            : !anyRulesApplied
                ? html `<p class="info">ℹ️ Alle Bereiche in Ordnung - keine Handlungsempfehlungen.</p>`
                : html `
                ${topMessages.map(e => html `
                  <p class="${e.priority}">
                    <b>${e.area}:</b> ${this.texts?.[e.message_key] || `Fehlende Übersetzung: ${e.message_key}`}
                  </p>
                `)}
              `}
          ${this.debug ? html `
            <div class="debug">${debugOut.join('\n\n')}</div>
            <div class="sensors-used">
              <b>Verwendete Sensoren:</b>
              <ul>
                ${areaMessages.map(areaMsg => html `
                  <li><b>${areaMsg.area}:</b>
                    <ul>
                      ${areaMsg.usedSensors.map(s => html `<li>[${s.type}] ${s.entity_id}: ${s.value}</li>`)}
                    </ul>
                  </li>
                `)}
              </ul>
            </div>
          ` : ''}
        </div>
      </ha-card>
    `;
    }
    // Build evaluation context for rules with weather data and sensor values
    _buildContext(area, usedSensors, states, weatherEntity, defaultTarget) {
        // Use the passed-in states array everywhere
        const findSensor = (type) => {
            return this._findSensor(states, area, usedSensors, type);
        };
        const get = (type) => {
            const s = findSensor(type);
            return s ? Number(s.state) : undefined;
        };
        const findState = (fn) => {
            const found = states.find(fn);
            return found ? found : undefined;
        };
        // Get weather data
        const weather = findState((e) => e.entity_id === weatherEntity);
        const weatherAttributes = weather?.attributes || {};
        const forecast = weatherAttributes.forecast?.[0] || {};
        const target = this._getTargetTemperature(area, states, defaultTarget);
        return {
            debug: this.debug,
            target,
            temp: get('temperature'),
            heating_level: get('heating_level'),
            humidity: get('humidity'),
            co2: get('co2'),
            window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
            heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
            motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
            occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
            energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
            high_threshold: this.highThreshold,
            temp_change_rate: 0,
            now: Date.now(),
            curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
            blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
            // Weather data directly from weather entity
            outside_temp: Number(weatherAttributes.temperature ?? 15),
            forecast_temp: Number(forecast.temperature ?? 15),
            rain_soon: (forecast.precipitation ?? 0) > 0,
            forecast_sun: forecast.condition === 'sunny',
            // Additional sensor data
            adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
            air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
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
        return 0; // Default to 0 if calculation fails
    }
    _getTargetTemperature(area, states, defaultTarget) {
        try {
            // 1. Prüfe auf Override in den Einstellungen
            const override = this.config?.overrides?.[area]?.target;
            if (override) {
                const overrideSensor = states.find(s => s.entity_id === override);
                if (overrideSensor) {
                    const value = Number(overrideSensor.state);
                    if (!isNaN(value)) {
                        return value;
                    }
                }
            }
            // 2. Suche nach einem Zieltemperatur-Sensor im Raum
            const targetSensor = states.find(s => s.attributes?.area_id === area && (
            // Prüfe auf climate.* Entities
            (s.entity_id.startsWith('climate.') && s.attributes?.temperature !== undefined) ||
                // Prüfe auf dedizierte Zieltemperatur-Sensoren
                s.entity_id.includes('target_temp') ||
                s.entity_id.includes('temperature_target') ||
                s.entity_id.includes('setpoint')));
            if (targetSensor) {
                // Bei climate Entities nehmen wir temperature aus den Attributen
                if (targetSensor.entity_id.startsWith('climate.')) {
                    return Number(targetSensor.attributes.temperature);
                }
                return Number(targetSensor.state);
            }
            // 3. Als letzten Ausweg den Standardwert verwenden
            return defaultTarget;
        }
        catch (error) {
            console.error('Error getting target temperature:', error);
        }
        return defaultTarget; // Default to config value on error
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
//# sourceMappingURL=hausgeist-card.js.map