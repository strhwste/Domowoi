import { LitElement } from 'lit';
import './hausgeist-card-editor';
export declare class HausgeistCard extends LitElement {
    hass: any;
    config: {
        area_id?: string;
        overrides?: any;
        debug?: boolean;
        notify?: boolean;
        highThreshold?: number;
        rulesJson?: string;
    };
    debug: boolean;
    notify: boolean;
    highThreshold: number;
    rulesJson: string;
    static styles: import("lit").CSSResult;
    private engine?;
    private texts;
    private ready;
    firstUpdated(): Promise<void>;
    setConfig(config: any): void;
    static getConfigElement(): HTMLElement;
    static getStubConfig(): {
        debug: boolean;
        notify: boolean;
        highThreshold: number;
        rulesJson: string;
    };
    render(): import("lit-html").TemplateResult<1>;
}
