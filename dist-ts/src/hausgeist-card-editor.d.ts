import { LitElement } from 'lit';
export declare class HausgeistCardEditor extends LitElement {
    config: {
        debug?: boolean;
        overrides?: Record<string, Record<string, string>>;
    };
    private _hass;
    testValues: {
        [key: string]: any;
    };
    rulesJson: string;
    notify: boolean;
    highThreshold: number;
    setConfig(config: any): void;
    get hass(): any;
    set hass(hass: any);
    _onDebugChange: (e: Event) => void;
    _onAreaSensorChange(areaId: string, type: string, e: Event): void;
    _configChanged(): void;
    handleTestValueChange(areaId: string, type: string, e: any): void;
    handleRulesChange(e: any): void;
    handleNotifyChange(e: any): void;
    handleThresholdChange(e: any): void;
    render(): import("lit-html").TemplateResult<1>;
}
