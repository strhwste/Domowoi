# Domowoi - Copilot Guide
## Project Snapshot
- Custom Home Assistant Lovelace card built with Lit/TypeScript; main entry is `src/hausgeist-card.ts` and rendering lives entirely inside the `HausgeistCard` web component.
- Runtime expects Home Assistant to inject `hass` state objects; keep card logic framework-agnostic beyond Lit helpers.
- Multilingual messaging via `translations/{de,en}.json`; always keep message keys aligned with rule identifiers.
- 3D mascot handled separately in `src/ghost-3d.ts` using Three.js and an external GLB file referenced by `ghost_model_url`.
## Build & Artifacts
- Install deps with `npm install`; produce distributables with `npm run build` (runs `tsc --outDir dist-ts` then Rollup bundling).
- Rollup consumes `dist-ts/src/hausgeist-card.js` (see `rollup.config.mjs`) and emits `dist/hausgeist-card.js` plus sourcemap.
- Post-build copies `dist/hausgeist-card.js` to the repo root as `hausgeist-card.js` for manual/Home Assistant deployment.
- Treat `dist/` and `dist-ts/` outputs as generated; modify only the TypeScript sources under `src/`.
## Architecture Notes
- `HausgeistCard` queues area evaluations to avoid blocking renders (`_enqueueAreasForEvaluation` + `_processEvaluationQueue`).
- Sensor aggregation and context building are centralized in `_buildContext`; re-use or extend that method instead of duplicating lookups.
- `RuleEngine` evaluates `src/rules.json` conditions via `new Function`; validate any new expressions and keep them side-effect free.
- `plugin-loader.ts` currently returns the bundled core rules but is the hook for future dynamic rule sets.
- `Ghost3D` encapsulates Three.js scene management; set tips via `setTip` and status colors through `setPriority` only.
## Sensor & Context Handling
- Areas come from `config.areas` or Home Assistant's `hass.areas`; disabled areas are filtered before evaluation.
- `_findSensor` first honors `config.overrides`, then `config.auto`, then device_class matching, then keyword lookup using `SENSOR_KEYWORDS`.
- `_buildContext` populates keys like `temp`, `humidity`, `co2`, `window`, `heating`, `outside_temp`, `forecast_{temp,high,low}`, `target`, `motion`, `energy`, `high_threshold`, `curtain`, `blind`, `adjacent_room_temp`, `air_quality`, `now`, and `temp_change_rate`.
- Context caching skips re-evaluations until a value changes or `60s` elapse; return value `null` means "no update" so respect this when extending logic.
- Translation text for tips is resolved per area after evaluation; ensure new context signals map to explicit `message_key`s.
## Editor & UI
- `src/hausgeist-card-editor.ts` drives the Lovelace visual editor; emit `config-changed` events whenever config mutations occur.
- The editor builds `config.auto` dynamically using `SENSOR_KEYWORDS`, prioritizing device_class hits before keyword string matches.
- `src/ha-entity-combo-box.ts` is an empty shim; the real element ships with Home Assistant, so do not attempt to reimplement it here.
## Translations & Rules
- Every rule in `src/rules.json` must have localized strings in both `translations/en.json` and `translations/de.json`.
- Keep rule `priority` within `ok|info|warn|alert`; UI styles map directly to those CSS classes in `src/styles.ts`.
- When adding message keys, update the debug banner or tooltip text if the copy should appear in the ghost speech bubble.
## External Integrations
- Three.js accessories rely on a global `window.hausgeistWeatherToday`; populate that before the model loads when integrating with weather services.
- Material Web Components (`@material/mwc-*`) and Lit base classes load via Rollup; ensure new imports stay browser-compatible (no Node-only modules).
## Debug & Testing
- Enable `debug` in config to expose detailed logs, the debug banner, and verbose sensor discovery output (`filterSensorsByArea`).
- There is no automated test suite; validate changes by loading the built card inside a Home Assistant dev instance.
- Check bundler health with `npm run build`; Rollup errors usually point to missing browser-friendly dependencies.
## Contributing Tips
- Extend `SENSOR_KEYWORDS` whenever you introduce new sensor types or localized naming patterns.
- Update `_buildContext` alongside new rules so the data you test in conditions actually exists.
- Preserve the generated file copy step if you tweak build scripts; downstream users expect `hausgeist-card.js` at the repo root.
