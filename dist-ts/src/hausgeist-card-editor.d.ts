import { LitElement } from 'lit';
import '@material/mwc-select';
import '@material/mwc-list/mwc-list-item';
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
        default_target?: number;
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
    private _renderWeatherInfo;
    setConfig(config: any): void;
    get hass(): any;
    set hass(hass: any);
    _onDebugChange: (e: Event) => void;
    private _onAreaSensorChange;
    _configChanged(): void;
    handleTestValueChange(areaId: string, type: string, e: any): void;
    handleRulesChange(e: any): void;
    handleNotifyChange(e: any): void;
    handleThresholdChange(e: any): void;
    private _onAreaEnabledChange;
    render(): import("lit-html").TemplateResult<1>;
}
