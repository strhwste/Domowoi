import { LitElement } from 'lit';
export declare class HausgeistCardEditor extends LitElement {
    config: {
        debug?: boolean;
        overrides?: Record<string, Record<string, string>>;
    };
    hass: any;
    setConfig(config: any): void;
    set hassInstance(hass: any);
    _onDebugChange: (e: Event) => void;
    _onAreaSensorChange(areaId: string, type: string, e: Event): void;
    _configChanged(): void;
    render(): import("lit-html").TemplateResult<1>;
}
