import { i, n, t, a as i$1, x } from './hausgeist-card-editor-DXit3Oyd.js';

class RuleEngine {
    constructor(rules) {
        this.rules = [];
        this.rules = rules;
        console.log('[RuleEngine] Initialized with', rules.length, 'rules');
    }
    evaluate(context) {
        // Debug: log available context
        console.log('[RuleEngine] Evaluating rules with context:', context);
        const results = [];
        for (const rule of this.rules) {
            let hit = false;
            try {
                // eslint-disable-next-line no-new-func
                hit = Function(...Object.keys(context), `return (${rule.condition});`)(...Object.values(context));
                console.log(`[RuleEngine] Rule '${rule.id || rule.message_key}' (${rule.condition}) => ${hit}`);
            }
            catch (e) {
                console.warn(`[RuleEngine] Error evaluating rule '${rule.id || rule.message_key}':`, e);
                continue;
            }
            if (hit) {
                results.push({ message_key: rule.message_key, priority: rule.priority });
            }
        }
        console.log('[RuleEngine] Evaluation complete,', results.length, 'rules matched');
        return results;
    }
}

function filterSensorsByArea(states, areaId) {
    // Vergleiche areaId und st.attributes.area_id getrimmt und in Kleinbuchstaben
    const norm = (v) => (v || '').toLowerCase().trim();
    // Debug logging to check area_id matching
    console.log(`[filterSensorsByArea] Looking for area: '${areaId}'`);
    // First find any matching sensors
    const filtered = states.filter(st => {
        const stArea = norm(st.attributes?.area_id);
        const searchArea = norm(areaId);
        // Log each potential match attempt
        if (st.entity_id && st.attributes?.area_id) {
            console.log(`[filterSensorsByArea] Checking entity ${st.entity_id} with area '${st.attributes.area_id}' (normalized: '${stArea}') against '${searchArea}'`);
        }
        return stArea === searchArea;
    });
    // Log what we found
    console.log(`[filterSensorsByArea] Found ${filtered.length} sensors for area '${areaId}':`);
    filtered.forEach(s => console.log(`- ${s.entity_id}`));
    return filtered;
}

var coreRules = [
	{
		id: "debug",
		condition: "debug === true",
		message_key: "debug_rule_match",
		priority: "info"
	},
	{
		condition: "temp > target + 2",
		message_key: "temp_above_target",
		priority: "warn"
	},
	{
		condition: "temp < target - 2",
		message_key: "temp_below_target",
		priority: "warn"
	},
	{
		condition: "humidity < 35",
		message_key: "humidity_low",
		priority: "info"
	},
	{
		condition: "humidity > 70",
		message_key: "humidity_high",
		priority: "alert"
	},
	{
		condition: "co2 > 1000",
		message_key: "co2_high",
		priority: "warn"
	},
	{
		condition: "window == 'open' && heating == 'on'",
		message_key: "window_open_heating_on",
		priority: "alert"
	},
	{
		condition: "!occupied && temp > 21",
		message_key: "room_empty_warm",
		priority: "info"
	},
	{
		condition: "outside_temp > 15 && temp > 23",
		message_key: "outside_warm_inside_warm",
		priority: "info"
	},
	{
		condition: "forecast_temp > 18 && target > 21",
		message_key: "forecast_warmer_target_high",
		priority: "info"
	},
	{
		condition: "energy > high_threshold",
		message_key: "energy_high",
		priority: "warn"
	},
	{
		condition: "target == 0",
		message_key: "eco_mode",
		priority: "ok"
	},
	{
		condition: "temp_change_rate > 2",
		message_key: "temp_rising_fast",
		priority: "warn"
	},
	{
		condition: "motion == false && heating == 'on'",
		message_key: "no_motion_heating_on",
		priority: "info"
	},
	{
		condition: "outside_temp < temp - 3 && now % 86400000 < 9 * 3600000",
		message_key: "morning_cool_outside",
		priority: "info"
	},
	{
		condition: "outside_temp > temp && now % 86400000 > 11 * 3600000 && window == 'open'",
		message_key: "afternoon_window_open_hot_outside",
		priority: "warn"
	},
	{
		condition: "forecast_temp > 26 && temp < 23 && now % 86400000 < 8 * 3600000",
		message_key: "hot_day_morning_ventilate",
		priority: "info"
	},
	{
		condition: "forecast_temp > 28 && window == 'open' && now % 86400000 > 12 * 3600000",
		message_key: "very_hot_window_open",
		priority: "alert"
	},
	{
		condition: "outside_temp < 18 && temp > 24 && now % 86400000 < 7 * 3600000",
		message_key: "early_cool_outside_ventilate",
		priority: "info"
	},
	{
		condition: "window == 'closed' && outside_temp > temp && temp > 23 && now % 86400000 > 11 * 3600000",
		message_key: "keep_window_closed_cool_inside",
		priority: "info"
	},
	{
		condition: "(curtain == 'open' || blind == 'open') && outside_temp > 26 && now % 86400000 > 11 * 3600000",
		message_key: "close_curtains_to_keep_cool",
		priority: "info"
	},
	{
		condition: "window == 'open' && rain_soon == true",
		message_key: "rain_soon_close_window",
		priority: "alert"
	},
	{
		condition: "door == 'open' && heating == 'on' && adjacent_room_temp > temp + 1",
		message_key: "close_door_to_save_heat",
		priority: "info"
	},
	{
		condition: "air_quality == 'poor' && window == 'closed'",
		message_key: "ventilate_air_quality_poor",
		priority: "warn"
	},
	{
		condition: "humidity > 70 && window == 'closed'",
		message_key: "ventilate_high_humidity",
		priority: "info"
	},
	{
		condition: "forecast_sun == true && now % 86400000 > 7 * 3600000 && blind == 'closed' && temp < 21",
		message_key: "open_blinds_for_sun_warmth",
		priority: "info"
	},
	{
		condition: "window == 'open' && outside_temp < 10 && now % 86400000 > 22 * 3600000",
		message_key: "window_open_night_cold",
		priority: "alert"
	},
	{
		condition: "temp < 17 && window == 'open'",
		message_key: "room_too_cold_window_open",
		priority: "warn"
	},
	{
		condition: "humidity > 70 && temp - (outside_temp + (humidity/100)*(temp-outside_temp)) < 2",
		message_key: "mold_risk_dew_point",
		priority: "alert"
	}
];

async function loadRules() {
    // Core-Regeln
    return coreRules;
}

var low_humidity$1 = "Humidity below 35% – please ventilate or humidify";
var high_co2$1 = "High CO₂ levels – please air out";
var cold_temp$1 = "Temperature below 18 °C – check heating or windows";
var all_ok$1 = "All good here 🎉";
var temp_above_target$1 = "⚠️ Temperature well above target – check heating curve.";
var temp_below_target$1 = "❄️ Room is undercooled – check heating or windows.";
var humidity_low$1 = "💧 Humidity too low – consider using a humidifier.";
var humidity_high$1 = "🌫️ Humidity too high – ventilation recommended (risk of mold).";
var co2_high$1 = "🌬️ CO₂ level too high – ventilate to improve air quality.";
var window_open_heating_on$1 = "🪟 Heating is on while window is open – avoid energy loss.";
var room_empty_warm$1 = "📉 Room is empty but warm – adjust heating profile?";
var outside_warm_inside_warm$1 = "☀️ It's warm outside – reduce heating demand.";
var forecast_warmer_target_high$1 = "📅 Tomorrow will be warmer – lower target temperature?";
var energy_high$1 = "💸 High energy consumption – check heating strategy.";
var eco_mode$1 = "🛌 Temperature reduction active – Eco mode detected.";
var temp_rising_fast$1 = "🔥 Temperature rising unusually fast – inefficient?";
var no_motion_heating_on$1 = "🚪 No motion detected – room may be heated unnecessarily.";
var morning_cool_outside$1 = "🌄 It's cooler outside in the morning – ventilate to cool down.";
var afternoon_window_open_hot_outside$1 = "🌞 Warmer outside than inside – better close the window.";
var hot_day_morning_ventilate$1 = "📊 Hot day ahead – ventilate well in the morning.";
var very_hot_window_open$1 = "🔥 Very hot outside – close windows to avoid heating up.";
var early_cool_outside_ventilate$1 = "🧊 Early cool outside – natural cooling by ventilation possible.";
var keep_window_closed_cool_inside$1 = "Keep windows closed to keep it cool inside.";
var close_curtains_to_keep_cool$1 = "Close curtains or blinds to keep the room cool.";
var rain_soon_close_window$1 = "Rain is expected soon – please close the windows.";
var close_door_to_save_heat$1 = "Close the door to prevent heat loss to other rooms.";
var ventilate_air_quality_poor$1 = "Air quality is poor – ventilate the room.";
var ventilate_high_humidity$1 = "Humidity is high – ventilate to reduce moisture.";
var open_blinds_for_sun_warmth$1 = "Sunny soon – open blinds to warm up the room.";
var window_open_night_cold$1 = "🌙 Window is open at night and it's cold outside – please close to avoid cooling down.";
var room_too_cold_window_open$1 = "❄️ Room is below 17°C and window is open – please close to avoid undercooling.";
var mold_risk_dew_point$1 = "⚠️ Mold risk: High humidity and dew point reached – please ventilate!";
var debug_rule_match$1 = "Debug rule matched - rule engine is working";
var en = {
	low_humidity: low_humidity$1,
	high_co2: high_co2$1,
	cold_temp: cold_temp$1,
	all_ok: all_ok$1,
	temp_above_target: temp_above_target$1,
	temp_below_target: temp_below_target$1,
	humidity_low: humidity_low$1,
	humidity_high: humidity_high$1,
	co2_high: co2_high$1,
	window_open_heating_on: window_open_heating_on$1,
	room_empty_warm: room_empty_warm$1,
	outside_warm_inside_warm: outside_warm_inside_warm$1,
	forecast_warmer_target_high: forecast_warmer_target_high$1,
	energy_high: energy_high$1,
	eco_mode: eco_mode$1,
	temp_rising_fast: temp_rising_fast$1,
	no_motion_heating_on: no_motion_heating_on$1,
	morning_cool_outside: morning_cool_outside$1,
	afternoon_window_open_hot_outside: afternoon_window_open_hot_outside$1,
	hot_day_morning_ventilate: hot_day_morning_ventilate$1,
	very_hot_window_open: very_hot_window_open$1,
	early_cool_outside_ventilate: early_cool_outside_ventilate$1,
	keep_window_closed_cool_inside: keep_window_closed_cool_inside$1,
	close_curtains_to_keep_cool: close_curtains_to_keep_cool$1,
	rain_soon_close_window: rain_soon_close_window$1,
	close_door_to_save_heat: close_door_to_save_heat$1,
	ventilate_air_quality_poor: ventilate_air_quality_poor$1,
	ventilate_high_humidity: ventilate_high_humidity$1,
	open_blinds_for_sun_warmth: open_blinds_for_sun_warmth$1,
	window_open_night_cold: window_open_night_cold$1,
	room_too_cold_window_open: room_too_cold_window_open$1,
	mold_risk_dew_point: mold_risk_dew_point$1,
	debug_rule_match: debug_rule_match$1
};

var low_humidity = "Luftfeuchtigkeit unter 35 % – lüften oder befeuchten empfohlen";
var high_co2 = "CO₂-Wert hoch – bitte Stoßlüften";
var cold_temp = "Temperatur unter 18 °C – Heizung prüfen bzw. Fenster schließen";
var all_ok = "Alles im grünen Bereich 🎉";
var temp_above_target = "⚠️ Temperatur deutlich über dem Sollwert – Heizkurve prüfen.";
var temp_below_target = "❄️ Raum ist unterkühlt – Heizung oder Fenster prüfen.";
var humidity_low = "💧 Luftfeuchtigkeit zu niedrig – ggf. Luftbefeuchter nutzen.";
var humidity_high = "🌫️ Luftfeuchtigkeit zu hoch – Lüften empfohlen (Schimmelgefahr).";
var co2_high = "🌬️ CO₂-Wert zu hoch – Lüften verbessert Luftqualität.";
var window_open_heating_on = "🪟 Heizung läuft bei offenem Fenster – Energieverlust vermeiden.";
var room_empty_warm = "📉 Raum ist leer, aber warm – Heizprofil anpassen?";
var outside_warm_inside_warm = "☀️ Draußen ist es warm – Heizbedarf reduzieren.";
var forecast_warmer_target_high = "📅 Morgen wird’s wärmer – Zieltemperatur senken?";
var energy_high = "💸 Hoher Energieverbrauch – Heizstrategie prüfen.";
var eco_mode = "🛌 Temperaturabsenkung aktiv – Eco-Modus erkannt.";
var temp_rising_fast = "🔥 Temperaturanstieg ungewöhnlich schnell – ineffizient?";
var no_motion_heating_on = "🚪 Keine Bewegung erkannt – Raum evtl. unnötig beheizt.";
var morning_cool_outside = "🌄 Morgens ist es draußen kühler – jetzt lüften zum Abkühlen.";
var afternoon_window_open_hot_outside = "🌞 Draußen wärmer als drinnen – Fenster besser schließen.";
var hot_day_morning_ventilate = "📊 Heute wird’s heiß – jetzt morgens gut durchlüften.";
var very_hot_window_open = "🔥 Hitze draußen – Fenster schließen, um Aufheizen zu vermeiden.";
var early_cool_outside_ventilate = "🧊 Früh kühl draußen – natürliche Kühlung durch Lüften möglich.";
var keep_window_closed_cool_inside = "Fenster geschlossen halten, um es innen kühl zu halten.";
var close_curtains_to_keep_cool = "Vorhänge oder Jalousien schließen, um den Raum kühl zu halten.";
var rain_soon_close_window = "Bald Regen erwartet – Fenster besser schließen.";
var close_door_to_save_heat = "Tür schließen, um Wärmeverlust in andere Räume zu vermeiden.";
var ventilate_air_quality_poor = "Luftqualität schlecht – bitte lüften.";
var ventilate_high_humidity = "Luftfeuchtigkeit hoch – lüften empfohlen.";
var open_blinds_for_sun_warmth = "Bald sonnig – Jalousien öffnen, um Raum zu erwärmen.";
var window_open_night_cold = "🌙 Fenster ist nachts offen und es ist draußen kalt – bitte schließen, um Auskühlung zu vermeiden.";
var room_too_cold_window_open = "❄️ Raum ist unter 17 °C und das Fenster ist offen – bitte schließen, um Unterkühlung zu vermeiden.";
var mold_risk_dew_point = "⚠️ Schimmelgefahr: Hohe Luftfeuchtigkeit und Taupunkt erreicht – bitte lüften!";
var debug_rule_match = "Debug-Regel aktiv - Regelwerk funktioniert";
var de = {
	low_humidity: low_humidity,
	high_co2: high_co2,
	cold_temp: cold_temp,
	all_ok: all_ok,
	temp_above_target: temp_above_target,
	temp_below_target: temp_below_target,
	humidity_low: humidity_low,
	humidity_high: humidity_high,
	co2_high: co2_high,
	window_open_heating_on: window_open_heating_on,
	room_empty_warm: room_empty_warm,
	outside_warm_inside_warm: outside_warm_inside_warm,
	forecast_warmer_target_high: forecast_warmer_target_high,
	energy_high: energy_high,
	eco_mode: eco_mode,
	temp_rising_fast: temp_rising_fast,
	no_motion_heating_on: no_motion_heating_on,
	morning_cool_outside: morning_cool_outside,
	afternoon_window_open_hot_outside: afternoon_window_open_hot_outside,
	hot_day_morning_ventilate: hot_day_morning_ventilate,
	very_hot_window_open: very_hot_window_open,
	early_cool_outside_ventilate: early_cool_outside_ventilate,
	keep_window_closed_cool_inside: keep_window_closed_cool_inside,
	close_curtains_to_keep_cool: close_curtains_to_keep_cool,
	rain_soon_close_window: rain_soon_close_window,
	close_door_to_save_heat: close_door_to_save_heat,
	ventilate_air_quality_poor: ventilate_air_quality_poor,
	ventilate_high_humidity: ventilate_high_humidity,
	open_blinds_for_sun_warmth: open_blinds_for_sun_warmth,
	window_open_night_cold: window_open_night_cold,
	room_too_cold_window_open: room_too_cold_window_open,
	mold_risk_dew_point: mold_risk_dew_point,
	debug_rule_match: debug_rule_match
};

const styles = i `
:host {
  display: block;
  background: var(--ha-card-background, var(--card-background-color, #fff));
  border-radius: var(--ha-card-border-radius, 1em);
  box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.07));
  padding: 1.5em;
  font-family: var(--primary-font-family, inherit);
  color: var(--primary-text-color, #222);
}

h2 {
  margin-top: 0;
  font-size: 1.3em;
  color: var(--primary-text-color, #4a4a4a);
}

p.warning {
  color: var(--warning-color, #b85c00);
  background: var(--warning-bg, #fff7e6);
  border-left: 4px solid var(--warning-border, #ffb300);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

p.info {
  color: var(--info-color, #0288d1);
  background: var(--info-bg, #e6f4ff);
  border-left: 4px solid var(--info-border, #2196f3);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

p.ok {
  color: var(--success-color, #357a38);
  background: var(--success-bg, #e6f9e6);
  border-left: 4px solid var(--success-border, #4caf50);
  padding: 0.5em 1em;
  border-radius: 0.5em;
  margin: 0.5em 0;
}

.debug {
  font-size: 0.9em;
  color: var(--secondary-text-color, #888);
  background: var(--secondary-background-color, #f5f5f5);
  border-radius: 0.5em;
  padding: 0.5em 1em;
  margin: 0.5em 0;
  white-space: pre-wrap;
}`;

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const TRANSLATIONS = { de, en };
let HausgeistCard = class HausgeistCard extends i$1 {
    constructor() {
        super(...arguments);
        this.config = {};
        this.debug = false;
        this.notify = false;
        this.highThreshold = 2000;
        this.rulesJson = '';
        this.texts = TRANSLATIONS['de'];
        this.ready = false;
    }
    async connectedCallback() {
        super.connectedCallback();
        try {
            // Load rules from rulesJson if provided, otherwise from plugin-loader
            const rules = this.rulesJson
                ? JSON.parse(this.rulesJson)
                : await loadRules();
            if (rules) {
                this.engine = new RuleEngine(rules);
                this.ready = true;
                this.requestUpdate();
            }
        }
        catch (error) {
            console.error('Error initializing Hausgeist:', error);
            this.ready = false;
        }
    }
    // Find sensor by type in area, with overrides and auto-detection
    _findSensor(sensors, area, usedSensors, sensorType) {
        if (this.debug) {
            console.log(`[_findSensor] Looking for ${sensorType} in area ${area}`);
            console.log(`[_findSensor] config.overrides[${area}]:`, this.config?.overrides?.[area]);
            console.log(`[_findSensor] config.auto[${area}]:`, this.config?.auto?.[area]);
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
        // 2. Check auto-detected sensor from config
        const autoId = this.config?.auto?.[area]?.[sensorType];
        if (autoId) {
            const sensor = sensors.find((s) => s.entity_id === autoId);
            if (sensor) {
                usedSensors.push({
                    type: `${sensorType} (auto)`,
                    entity_id: sensor.entity_id,
                    value: sensor.state
                });
                return sensor;
            }
            if (this.debug)
                console.log(`[_findSensor] Auto sensor ${autoId} not found`);
        }
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
        if (!this.engine || !this.ready) {
            return x `<div>Loading...</div>`;
        }
        const debugBanner = this.debug ? x `<p class="debug-banner">🛠️ Debug mode active</p>` : '';
        const debugOut = [];
        const { states } = this.hass;
        const areas = (this.config.areas || []).filter(a => a.enabled !== false);
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
            filterSensorsByArea(states, area);
            const usedSensors = [];
            if (this.debug) {
                const sensors = filterSensorsByArea(states, area);
                debugOut.push(`Processing area: ${area}`);
                debugOut.push(`Available sensors: ${sensors.map((s) => s.entity_id).join(', ')}`);
                debugOut.push(`Configured overrides: ${JSON.stringify(this.config?.overrides?.[area])}`);
                debugOut.push(`Auto-detected sensors: ${JSON.stringify(this.config?.auto?.[area])}`);
            }
            // Use imported SENSOR_KEYWORDS from sensor-keywords.ts
            const findSensor = (cls) => {
                return this._findSensor(Object.values(this.hass.states), area, usedSensors, cls);
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
                const found = states.find(fn);
                return found ? found : undefined;
            };
            // Get target temperature, default to config override or 21°C
            const context = {
                target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
                humidity: get('humidity'),
                co2: get('co2'),
                window: findState((e) => e.entity_id.includes('window') && e.attributes.area_id === area)?.state,
                heating: findState((e) => e.entity_id.includes('heating') && e.attributes.area_id === area)?.state,
                motion: findState((e) => e.entity_id.includes('motion') && e.attributes.area_id === area)?.state === 'on',
                occupied: findState((e) => e.entity_id.includes('occupancy') && e.attributes.area_id === area)?.state === 'on',
                outside_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.temperature ?? 15),
                forecast_temp: Number(findState((e) => e.entity_id === 'weather.home')?.attributes?.forecast?.[0]?.temperature ?? 15),
                energy: Number(findState((e) => e.entity_id.includes('energy') && e.attributes.area_id === area)?.state ?? 0),
                high_threshold: this.highThreshold,
                temp_change_rate: 0,
                now: Date.now(),
                curtain: findState((e) => e.entity_id.includes('curtain') && e.attributes.area_id === area)?.state,
                blind: findState((e) => e.entity_id.includes('blind') && e.attributes.area_id === area)?.state,
                // Ergänzungen für Regeln
                rain_soon: findState((e) => e.entity_id.includes('rain') && e.attributes.area_id === area)?.state === 'on' || false,
                adjacent_room_temp: Number(findState((e) => e.entity_id.includes('adjacent') && e.entity_id.includes('temperature') && e.attributes.area_id === area)?.state ?? 0),
                air_quality: findState((e) => e.entity_id.includes('air_quality') && e.attributes.area_id === area)?.state ?? 'unknown',
                forecast_sun: findState((e) => e.entity_id.includes('forecast') && e.entity_id.includes('sun') && e.attributes.area_id === area)?.state === 'on' || false,
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
        return x `
      ${debugBanner}
      <h2>👻 Hausgeist sagt:</h2>
      ${!anySensorsUsed
            ? x `<p class="warning">⚠️ No sensors detected for any area!<br>Check your sensor configuration, area assignment, or use the visual editor to select sensors.</p>`
            : !anyRulesApplied
                ? x `<p class="warning">⚠️ No rules applied (no comparisons made for any area).</p>`
                : topMessages.map(e => x `<p class="${e.priority}"><b>${e.area}:</b> ${this.texts?.[e.message_key] || `Missing translation: ${e.message_key}`}</p>`)}
      ${this.debug ? x `
        <div class="debug">${debugOut.join('\n\n')}</div>
        <div class="sensors-used">
          <b>Sensors used:</b>
          <ul>
            ${areaMessages.map(areaMsg => x `
              <li><b>${areaMsg.area}:</b>
                <ul>
                  ${areaMsg.usedSensors.map(s => x `<li>[${s.type}] ${s.entity_id}: ${s.value}</li>`)}
                </ul>
              </li>
            `)}
          </ul>
        </div>
      ` : ''}
    `;
    }
    // Build evaluation context for rules with weather data and sensor values
    _buildContext(area, usedSensors, states, weatherEntity, defaultTarget) {
        const findSensor = (type) => {
            return this._findSensor(Object.values(this.hass.states), area, usedSensors, type);
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
        return {
            debug: this.debug,
            target: Number(findState((e) => e.entity_id.endsWith('_temperature_target') && e.attributes.area_id === area)?.state ?? defaultTarget),
            temp: get('temperature'),
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
    async setConfig(config) {
        this.config = config;
        this.debug = !!config?.debug;
        this.notify = !!config?.notify;
        this.highThreshold = typeof config?.highThreshold === 'number' ? config.highThreshold : 2000;
        this.rulesJson = config?.rulesJson || '';
        try {
            // Load rules from rulesJson if provided, otherwise from plugin-loader
            const rules = this.rulesJson
                ? JSON.parse(this.rulesJson)
                : await loadRules();
            if (rules) {
                this.engine = new RuleEngine(rules);
                this.ready = true;
            }
        }
        catch (error) {
            console.error('Error initializing Hausgeist:', error);
            this.ready = false;
        }
        this.requestUpdate();
    }
    static async getConfigElement() {
        return document.createElement('hausgeist-card-editor');
    }
};
HausgeistCard.styles = styles;
__decorate([
    n({ type: Object })
], HausgeistCard.prototype, "hass", void 0);
__decorate([
    n({ type: Object })
], HausgeistCard.prototype, "config", void 0);
__decorate([
    n({ type: Boolean })
], HausgeistCard.prototype, "debug", void 0);
__decorate([
    n({ type: Boolean })
], HausgeistCard.prototype, "notify", void 0);
__decorate([
    n({ type: Number })
], HausgeistCard.prototype, "highThreshold", void 0);
__decorate([
    n({ type: String })
], HausgeistCard.prototype, "rulesJson", void 0);
HausgeistCard = __decorate([
    t('hausgeist-card')
], HausgeistCard);

export { HausgeistCard };
//# sourceMappingURL=hausgeist-card.js.map
