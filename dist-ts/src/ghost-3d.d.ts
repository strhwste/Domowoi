export type GhostPriority = 'ok' | 'info' | 'warn' | 'alert';
export interface Ghost3DOptions {
    container: HTMLElement;
    modelUrl: string;
    onLoad?: () => void;
    modelScale?: number;
    modelYOffset?: number;
    speechBubbleYOffset?: number;
}
export declare class Ghost3D {
    private scene;
    private renderer;
    private camera;
    private model?;
    private animationId?;
    private accessoryMesh?;
    private lastAccessoryUpdate;
    private accessoryUpdateInterval;
    private speechMesh?;
    private speechTexture?;
    private speechCanvas?;
    private speechCtx?;
    private currentPriority;
    private lastTip;
    private container;
    private modelUrl;
    private onLoad?;
    private modelScale;
    private modelYOffset;
    private speechBubbleYOffset;
    constructor(options: Ghost3DOptions);
    private _loadModel;
    setPriority(priority: GhostPriority): void;
    setTip(tip: string): void;
    resize(width: number, height: number): void;
    dispose(): void;
    private _setColorByPriority;
    private _addAccessory;
    private _createSpeechBubble;
    private _updateSpeechTexture;
    private _wrapText;
    private _isTabVisible;
    private _animate;
}
