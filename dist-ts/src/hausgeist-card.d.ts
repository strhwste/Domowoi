import { LitElement } from 'lit';
export declare class HausgeistCard extends LitElement {
    hass: any;
    config: {
        area_id: string;
        overrides?: any;
    };
    static styles: import("lit").CSSResult;
    private engine;
    private texts;
    firstUpdated(): Promise<void>;
    setConfig(config: any): void;
    render(): import("lit-html").TemplateResult<1>;
}
