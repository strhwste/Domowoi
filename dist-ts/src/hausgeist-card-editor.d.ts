import { LitElement, TemplateResult, nothing } from 'lit';
interface HassEntity {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name?: string;
        area_id?: string;
        device_class?: string;
        device_id?: string;
        [key: string]: any;
    };
}
interface HassArea {
    area_id: string;
    name?: string;
}
interface HassDevice {
    area_id?: string;
}
interface HomeAssistant {
    states: Record<string, HassEntity>;
    areas?: Record<string, HassArea>;
    devices?: Record<string, HassDevice>;
}
interface AreaConfig {
    area_id: string;
    name: string;
    enabled?: boolean;
}
interface HausgeistCardConfig {
    debug?: boolean;
    notify?: boolean;
    highThreshold?: number;
    overrides?: Record<string, Record<string, string>>;
    areas?: AreaConfig[];
    auto?: Record<string, Record<string, string>>;
    weather_entity?: string;
    default_target?: number;
    default_target_entity?: string;
    rulesJson?: string;
}
export declare class HausgeistCardEditor extends LitElement {
    config: HausgeistCardConfig;
    private _areas;
    private _selectorReady;
    private _hass?;
    static styles: import("lit").CSSResult;
    set hass(value: HomeAssistant | undefined);
    get hass(): HomeAssistant | undefined;
    setConfig(config: HausgeistCardConfig): void;
    connectedCallback(): void;
    render(): typeof nothing | TemplateResult<1>;
    private _renderGeneralSection;
    private _renderAreasSection;
    private _renderArea;
    private _renderSensorRow;
    private _renderAdvancedSection;
    private _renderMissingSensorsSection;
    private _renderField;
    private _renderSelectorControl;
    private _normalizeSelectorValue;
    private _handleConfigValueChange;
    private _onAreaToggle;
    private _onAreaSensorChange;
    private _emitConfig;
    private _buildAutoMapping;
    private _autodetect;
    private _matchingEntities;
    private _keywordsForType;
    private _domainMatches;
    private _selectorForSensor;
    private _matchesArea;
    private _computeMissingSensors;
    private _syncAreas;
    private _collectAreasFromHass;
    private _ensureSelectorSystem;
}
export {};
