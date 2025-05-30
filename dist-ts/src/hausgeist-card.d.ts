import { LitElement } from 'lit';
import './hausgeist-card-editor';
export declare class HausgeistCard extends LitElement {
    hass: any;
    config: {
        area_id: string;
        overrides?: any;
    } | undefined;
    static styles: import("lit").CSSResult;
    debug: boolean;
    private engine?;
    private texts;
    private ready;
    firstUpdated(): Promise<void>;
    setConfig(config: any): void;
    static getConfigElement(): HTMLElement;
    static getStubConfig(): {
        debug: boolean;
    };
    render(): import("lit-html").TemplateResult<1>;
}
