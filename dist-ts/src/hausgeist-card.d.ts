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
    };
    debug: boolean;
    notify: boolean;
    highThreshold: number;
    rulesJson: string;
    private engine?;
    private texts;
    private ready;
    private _findSensor;
    render(): import("lit-html").TemplateResult<1>;
    private _buildContext;
    static styles: import("lit").CSSResult;
}
