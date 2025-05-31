import { LitElement } from 'lit';
import './hausgeist-card-editor';
export declare class HausgeistCard extends LitElement {
    hass: any;
    config: {
        area_id?: string;
        overrides?: any;
        auto?: any;
        debug?: boolean;
        notify?: boolean;
        highThreshold?: number;
        rulesJson?: string;
        areas?: Array<{
            area_id: string;
            name: string;
            enabled?: boolean;
        }>;
        weather_entity?: string;
        default_target?: number;
        default_adjacent_room_temp?: number;
        default_outside_temp?: number;
    };
    debug: boolean;
    notify: boolean;
    highThreshold: number;
    rulesJson: string;
    static styles: import("lit").CSSResult;
    static getConfigElement(): Promise<HTMLElement>;
    static getStubConfig(): {
        debug: boolean;
        notify: boolean;
        highThreshold: number;
        default_target: number;
        default_adjacent_room_temp: number;
        default_outside_temp: number;
    };
    setConfig(config: any): void;
    private engine?;
    private texts;
    private ready;
    connectedCallback(): Promise<void>;
    private _findSensor;
    render(): import("lit-html").TemplateResult<1>;
    private _buildContext;
    private _calculateTempChangeRate;
    private _getTargetTemperature;
}
