import { LitElement } from 'lit';
export declare class HausgeistCardEditor extends LitElement {
    config: {
        debug?: boolean;
    };
    setConfig(config: any): void;
    static getConfigElement(): HTMLElement;
    static getStubConfig(): {
        debug: boolean;
    };
    _onDebugChange: (e: Event) => void;
    _configChanged(): void;
    render(): import("lit-html").TemplateResult<1>;
}
