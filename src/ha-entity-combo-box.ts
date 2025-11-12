/**
 * Placeholder module so Rollup keeps the import in place. The real
 * `ha-entity-combo-box` web component is provided by Home Assistant's
 * frontend. When running the card editor outside of Home Assistant we render
 * our own fallback in `hausgeist-card-editor.ts` instead of defining a fake
 * global element to avoid blocking the native implementation.
 */
export {};
