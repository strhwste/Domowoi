import { LitElement } from 'lit';
export declare class HausgeistCardEditor extends LitElement {
    config: {
        debug?: boolean;
        overrides?: Record<string, Record<string, string>>;
        areas?: Array<{
            area_id: string;
            name: string;
            enabled?: boolean;
        }>;
        auto?: Record<string, Record<string, string>>;
        weather_entity?: string;
    };
    private _hass;
    testValues: {
        [key: string]: any;
    };
    rulesJson: string;
    notify: boolean;
    highThreshold: number;
    private _lastAreas;
    private _autodetect;
    setConfig(config: any): void;
    get hass(): any;
    set hass(hass: any);
    _onDebugChange: (e: Event) => void;
    _onAreaSensorChange(areaId: string, type: string, e: Event): void;
    _onUseAutoDetected(areaId: string, type: string): void;
    _configChanged(): void;
    handleTestValueChange(areaId: string, type: string, e: any): void;
    handleRulesChange(e: any): void;
    handleNotifyChange(e: any): void;
    handleThresholdChange(e: any): void;
    private _onAreaEnabledChange;
    render(): import("lit-html").TemplateResult<1>;
}
