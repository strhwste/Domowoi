import { LitElement, PropertyValues, TemplateResult } from 'lit';
import './hausgeist-card-editor';
declare module 'three/examples/jsm/loaders/GLTFLoader.js';
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
        ghost_model_url?: string;
    };
    debug: boolean;
    notify: boolean;
    highThreshold: number;
    rulesJson: string;
    static styles: import("lit").CSSResult[];
    private engine?;
    private texts;
    private ready;
    private ghost3D?;
    private lastTip;
    private ghostLoadError;
    private _currentPriority;
    private _currentAreaIndex;
    private _lastAreaEvalTimestamp;
    private _areaEvalInterval;
    private _areaResults;
    private _areaEvalTimer;
    private _areaSensorCache;
    private _areaLastEval;
    private _areaMaxEvalInterval;
    setConfig(config: any): void;
    static getConfigElement(): Promise<HTMLElement>;
    static getStubConfig(): {
        debug: boolean;
        notify: boolean;
        highThreshold: number;
        default_target: number;
        default_adjacent_room_temp: number;
        default_outside_temp: number;
    };
    connectedCallback(): Promise<void>;
    updated(changedProps: PropertyValues): void;
    disconnectedCallback(): void;
    private _getCurrentTip;
    render(): TemplateResult<1>;
    private _findSensor;
    private _getTargetTemperature;
    private _buildContext;
    private _calculateTempChangeRate;
    private _evaluateNextArea;
}
