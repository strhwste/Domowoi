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
        // 1. Animationen & Emotionen: Ghost-Farbe je nach Priorität
        this._currentPriority = 'ok';
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
        const container = this.renderRoot?.querySelector('.ghost-3d-container');
        if (container && this.ghostRenderer) {
            const card = container.closest('ha-card');
            if (card) {
                const width = card.offsetWidth || 200;
                const height = Math.max(160, Math.round(width * 1));
                this.ghostRenderer.setSize(width, height);
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
        // Größere Canvas für größeren Geist
        this.ghostRenderer.setSize(320, 320);
        this.ghostCanvas = this.ghostRenderer.domElement;
        if (this.ghostCanvas) {
            this.ghostCanvas.style.display = 'block';
            this.ghostCanvas.style.margin = '0 auto';
            this.ghostCanvas.style.pointerEvents = 'none';
            container.appendChild(this.ghostCanvas);
        }
        // Scene
        this.ghostScene = new THREE.Scene();
        // Blauer Nebel für die Umgebung (Fog)
        this.ghostScene.fog = new THREE.Fog(0x99ccff, 2.5, 6.5);
        // Camera
        this.ghostCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        this.ghostCamera.position.set(0, 1, 3);
        // Light
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 2, 2);
        this.ghostScene.add(light);
        this.ghostScene.add(new THREE.AmbientLight(0xffffff, 0.7));
        // Load GLB
        const loader = new GLTFLoader();
        const modelUrl = this.config.ghost_model_url || '/local/ghost.glb';
        loader.load(modelUrl, (gltf) => {
            this.ghostModel = gltf.scene;
            // Größer skalieren
            this.ghostModel.position.set(0, 0.5, 0);
            this.ghostModel.scale.set(2.0, 2.0, 2.0);
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
        // Create canvas for speech bubble
        this.ghostSpeechCanvas = document.createElement('canvas');
        this.ghostSpeechCanvas.width = 256;
        this.ghostSpeechCanvas.height = 96;
        this.ghostSpeechCtx = this.ghostSpeechCanvas.getContext('2d');
        // Initial draw
        this._updateGhostSpeechTexture(text);
        this.ghostSpeechTexture = new THREE.Texture(this.ghostSpeechCanvas);
        this.ghostSpeechTexture.needsUpdate = true;
        // Plane geometry for speech bubble
        const geometry = new THREE.PlaneGeometry(1.6, 0.6);
        const material = new THREE.MeshBasicMaterial({ map: this.ghostSpeechTexture, transparent: true });
        this.ghostSpeechMesh = new THREE.Mesh(geometry, material);
        this.ghostSpeechMesh.position.set(0, 1.4, 0);
        this.ghostSpeechMesh.renderOrder = 2;
        this.ghostScene.add(this.ghostSpeechMesh);
    }
    _updateGhostSpeechTexture(text) {
        if (!this.ghostSpeechCanvas || !this.ghostSpeechCtx)
            return;
        const ctx = this.ghostSpeechCtx;
        ctx.clearRect(0, 0, this.ghostSpeechCanvas.width, this.ghostSpeechCanvas.height);
        // Farben je nach Priority
        const colors = this._getSpeechBubbleColors(this._currentPriority);
        ctx.fillStyle = colors.fill;
        ctx.strokeStyle = colors.stroke;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(236, 10);
        ctx.quadraticCurveTo(246, 10, 246, 26);
        ctx.lineTo(246, 70);
        ctx.quadraticCurveTo(246, 86, 236, 86);
        ctx.lineTo(20, 86);
        ctx.quadraticCurveTo(10, 86, 10, 70);
        ctx.lineTo(10, 26);
        ctx.quadraticCurveTo(10, 10, 20, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Bubble tail
        ctx.beginPath();
        ctx.moveTo(128, 86);
        ctx.lineTo(138, 106);
        ctx.lineTo(118, 86);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Text
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this._wrapText(ctx, text, 128, 48, 220, 28);
        if (this.ghostSpeechTexture) {
            this.ghostSpeechTexture.needsUpdate = true;
        }
    }
    _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
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
    // 1. Ghost-Farbe je nach Priorität
    _setGhostColorByPriority(priority) {
        if (!this.ghostModel)
            return;
        let color = 0xffffff;
        let useOriginalEmissive = false;
        let emissive = 0x000000;
        switch (priority) {
            case 'alert':
                color = 0xff4444;
                emissive = 0xff8888;
                break;
            case 'warn':
                color = 0xffc107;
                emissive = 0xffe082;
                break;
            case 'info':
                color = 0x2196f3;
                emissive = 0x90caf9;
                break;
            case 'ok':
            default:
                color = 0xffffff;
                useOriginalEmissive = true;
                break;
        }
        this.ghostModel.traverse((obj) => {
            if (obj.isMesh && obj.material) {
                obj.material.color?.set(color);
                // Kein Leuchten für ok/info/warn, nur für alert
                if (priority === 'alert') {
                    obj.material.emissive?.set(emissive);
                }
                else {
                    obj.material.emissive?.set(0x000000);
                }
            }
        });
    }
    // 5. Accessoire hinzufügen (z.B. Hut)
    _addGhostAccessory() {
        if (!this.ghostModel)
            return;
        // Entferne altes Accessoire
        if (this._ghostAccessoryMesh && this.ghostModel.children.includes(this._ghostAccessoryMesh)) {
            this.ghostModel.remove(this._ghostAccessoryMesh);
        }
        // Kleiner, flacher Zylinder-Hut
        const geometry = new THREE.CylinderGeometry(0.11, 0.11, 0.07, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const hat = new THREE.Mesh(geometry, material);
        hat.position.set(0, 0.38, 0); // etwas tiefer und kleiner
        hat.rotation.x = 0;
        // Dünne, größere Krempe
        const brimGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.015, 32);
        const brimMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const brim = new THREE.Mesh(brimGeo, brimMat);
        brim.position.set(0, -0.045, 0); // direkt unter dem Hut
        hat.add(brim);
        this.ghostModel.add(hat);
        this._ghostAccessoryMesh = hat;
    }
    _updateGhostGlow(priority) {
        if (!this.ghostModel)
            return;
        // Remove old glow mesh if present
        if (this._ghostGlowMesh && this.ghostModel.children.includes(this._ghostGlowMesh)) {
            this.ghostModel.remove(this._ghostGlowMesh);
            this._ghostGlowMesh.geometry.dispose();
            this._ghostGlowMesh.material.dispose();
            this._ghostGlowMesh = undefined;
        }
        // Only show glow for warn/info/alert
        let glowColor = null;
        let glowOpacity = 0.35;
        switch (priority) {
            case 'alert':
                glowColor = 0xff4444;
                glowOpacity = 0.45;
                break;
            case 'warn':
                glowColor = 0xffc107;
                glowOpacity = 0.32;
                break;
            case 'info':
                glowColor = 0x2196f3;
                glowOpacity = 0.28;
                break;
            default: return;
        }
        // Create a slightly larger, transparent sphere as glow
        const geometry = new THREE.SphereGeometry(0.62, 32, 32); // slightly larger than ghost
        const material = new THREE.MeshBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: glowOpacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(geometry, material);
        glow.position.set(0, 0.38, 0); // match ghost position
        this.ghostModel.add(glow);
        this._ghostGlowMesh = glow;
    }
    _animateGhost() {
        if (!this.ghostScene || !this.ghostCamera || !this.ghostRenderer || !this.ghostModel)
            return;
        if (!this._isTabVisible()) {
            this.ghostAnimationId = requestAnimationFrame(() => this._animateGhost());
            return;
        }
        const t = performance.now() * 0.001;
        // Schwebende Animation + sanftes Wackeln
        this.ghostModel.position.y = 0.5 + Math.sin(t * 2) * 0.1;
        this.ghostModel.rotation.y = Math.sin(t * 0.5) * 0.3;
        this.ghostModel.rotation.z = Math.sin(t * 1.2) * 0.05;
        // Accessoire folgt Kopf
        if (this._ghostAccessoryMesh) {
            this._ghostAccessoryMesh.position.x = 0;
            this._ghostAccessoryMesh.position.z = 0;
        }
        // Speech bubble folgt dem Geist
        if (this.ghostSpeechMesh) {
            this.ghostSpeechMesh.position.x = this.ghostModel.position.x;
            this.ghostSpeechMesh.position.z = this.ghostModel.position.z;
            this.ghostSpeechMesh.position.y = this.ghostModel.position.y + 0.9;
            this.ghostSpeechMesh.lookAt(this.ghostCamera.position);
        }
        // Optional: Pulsate the glow
        if (this._ghostGlowMesh) {
            const t = performance.now() * 0.001;
            const baseOpacity = this._ghostGlowMesh.material.opacity;
            this._ghostGlowMesh.material.opacity = baseOpacity * (0.85 + 0.15 * Math.sin(t * 2));
            this._ghostGlowMesh.scale.set(1.05 + 0.04 * Math.sin(t * 2), 1.05 + 0.04 * Math.sin(t * 2), 1.05 + 0.04 * Math.sin(t * 2));
        }
        this.ghostRenderer.render(this.ghostScene, this.ghostCamera);
        this.ghostAnimationId = requestAnimationFrame(() => this._animateGhost());
    }
    // 7. Performance: Animation nur wenn sichtbar
    _isTabVisible() {
        return !(document.hidden || (document.visibilityState && document.visibilityState !== 'visible'));
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
        let currentPriority = 'ok';
        if (this.ghostLoadError) {
            currentTip = 'Geist-Modell nicht gefunden! Bitte ghost_model_url prüfen.';
            currentPriority = 'alert';
        }
        else if (topMessages.length > 0) {
            currentTip = this.texts?.[topMessages[0].message_key] || topMessages[0].message_key;
            currentPriority = topMessages[0].priority || 'ok';
        }
        // Merke den aktuellen Tipp für die Sprechblase
        this.lastTip = currentTip;
        this._currentPriority = currentPriority;
        // Setze Ghost-Farbe und Accessoire
        if (this.ghostModel) {
            this._setGhostColorByPriority(currentPriority);
            this._addGhostAccessory();
            this._updateGhostGlow(currentPriority);
        }
        // Wenn die Sprechblase existiert, Text aktualisieren
        if (this.ghostSpeechMesh && this.ghostSpeechCtx) {
            this._updateGhostSpeechTexture(currentTip);
        }
        return html `
      <style>
        .ghost-3d-container {
          width: 200px;
          height: 200px;
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
    // 1. Sprechblasenfarbe je nach Priorität
    _getSpeechBubbleColors(priority) {
        switch (priority) {
            case 'alert': return { fill: 'rgba(255,68,68,0.97)', stroke: 'rgba(200,0,0,0.7)', text: '#fff' };
            case 'warn': return { fill: 'rgba(255,241,118,0.97)', stroke: 'rgba(255,193,7,0.7)', text: '#222' };
            case 'info': return { fill: 'rgba(230,244,255,0.97)', stroke: 'rgba(33,150,243,0.7)', text: '#222' };
            case 'ok':
            default: return { fill: 'rgba(255,255,255,0.95)', stroke: 'rgba(180,180,180,0.7)', text: '#222' };
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
//# sourceMappingURL=hausgeist-card.js.map