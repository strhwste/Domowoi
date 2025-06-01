import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type GhostPriority = 'ok' | 'info' | 'warn' | 'alert';

export interface Ghost3DOptions {
  container: HTMLElement;
  modelUrl: string;
  onLoad?: () => void;
}

export class Ghost3D {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private model?: THREE.Object3D;
  private animationId?: number;
  private accessoryMesh?: THREE.Mesh;
  private glowMesh?: THREE.Mesh;
  private speechMesh?: THREE.Mesh;
  private speechTexture?: THREE.Texture;
  private speechCanvas?: HTMLCanvasElement;
  private speechCtx?: CanvasRenderingContext2D | null;
  private currentPriority: GhostPriority = 'ok';
  private lastTip: string = '';
  private container: HTMLElement;
  private modelUrl: string;
  private onLoad?: () => void;

  constructor(options: Ghost3DOptions) {
    this.container = options.container;
    this.modelUrl = options.modelUrl;
    this.onLoad = options.onLoad;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x99ccff, 2.5, 6.5);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(320, 320);
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 1, 3);
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 2, 2);
    this.scene.add(light);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    this.container.appendChild(this.renderer.domElement);
    this._loadModel();
  }

  private _loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      this.modelUrl,
      (gltf: { scene: THREE.Object3D }) => {
        this.model = gltf.scene;
        this.model.position.set(0, 0.5, 0);
        this.model.scale.set(2.0, 2.0, 2.0);
        this.scene.add(this.model);
        this._addAccessory();
        this._createSpeechBubble(this.lastTip);
        this._animate();
        if (this.onLoad) this.onLoad();
      }
    );
  }

  setPriority(priority: GhostPriority) {
    this.currentPriority = priority;
    this._setColorByPriority(priority);
    this._updateGlow(priority);
  }

  setTip(tip: string) {
    this.lastTip = tip;
    this._updateSpeechTexture(tip);
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    if (this.model && this.glowMesh) {
      this.model.remove(this.glowMesh);
    }
    if (this.model && this.accessoryMesh) {
      this.model.remove(this.accessoryMesh);
    }
    if (this.speechMesh) {
      this.scene.remove(this.speechMesh);
    }
    this.container.removeChild(this.renderer.domElement);
  }

  private _setColorByPriority(priority: GhostPriority) {
    if (!this.model) return;
    let color = 0xffffff;
    let emissive = 0x000000;
    switch (priority) {
      case 'alert': color = 0xff4444; emissive = 0xff8888; break;
      case 'warn': color = 0xffc107; emissive = 0xffe082; break;
      case 'info': color = 0x2196f3; emissive = 0x90caf9; break;
      case 'ok': default: color = 0xffffff; break;
    }
    this.model.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        obj.material.color?.set(color);
        if (priority === 'alert') {
          obj.material.emissive?.set(emissive);
        } else {
          obj.material.emissive?.set(0x000000);
        }
      }
    });
  }

  private _addAccessory() {
    if (!this.model) return;
    if (this.accessoryMesh && this.model.children.includes(this.accessoryMesh)) {
      this.model.remove(this.accessoryMesh);
    }
    const geometry = new THREE.CylinderGeometry(0.11, 0.11, 0.07, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const hat = new THREE.Mesh(geometry, material);
    hat.position.set(0, 0.38, 0);
    hat.rotation.x = 0;
    const brimGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.015, 32);
    const brimMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
    const brim = new THREE.Mesh(brimGeo, brimMat);
    brim.position.set(0, -0.045, 0);
    hat.add(brim);
    this.model.add(hat);
    this.accessoryMesh = hat;
  }

  private _updateGlow(priority: GhostPriority) {
    if (!this.model) return;
    if (this.glowMesh && this.model.children.includes(this.glowMesh)) {
      this.model.remove(this.glowMesh);
      this.glowMesh.geometry.dispose();
      (this.glowMesh.material as THREE.Material).dispose();
      this.glowMesh = undefined;
    }
    let glowColor: number | null = null;
    let glowOpacity = 0.35;
    switch (priority) {
      case 'alert': glowColor = 0xff4444; glowOpacity = 0.45; break;
      case 'warn': glowColor = 0xffc107; glowOpacity = 0.32; break;
      case 'info': glowColor = 0x2196f3; glowOpacity = 0.28; break;
      default: return;
    }
    const geometry = new THREE.SphereGeometry(0.62, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: glowColor, 
      transparent: true, 
      opacity: glowOpacity, 
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(geometry, material);
    glow.position.set(0, 0.38, 0);
    this.model.add(glow);
    this.glowMesh = glow;
  }

  private _createSpeechBubble(text: string) {
    this.speechCanvas = document.createElement('canvas');
    this.speechCanvas.width = 256;
    this.speechCanvas.height = 96;
    this.speechCtx = this.speechCanvas.getContext('2d');
    this._updateSpeechTexture(text);
    this.speechTexture = new THREE.Texture(this.speechCanvas);
    this.speechTexture.needsUpdate = true;
    const geometry = new THREE.PlaneGeometry(1.6, 0.6);
    const material = new THREE.MeshBasicMaterial({ map: this.speechTexture, transparent: true });
    this.speechMesh = new THREE.Mesh(geometry, material);
    this.speechMesh.position.set(0, 1.4, 0);
    this.speechMesh.renderOrder = 2;
    this.scene.add(this.speechMesh);
  }

  private _updateSpeechTexture(text: string) {
    if (!this.speechCanvas || !this.speechCtx) return;
    const ctx = this.speechCtx;
    ctx.clearRect(0, 0, this.speechCanvas.width, this.speechCanvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = 'rgba(180,180,180,0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 10);
    ctx.lineTo(236, 10);
    ctx.quadraticCurveTo(246, 10, 246, 26);
    ctx.lineTo(246, 70);
    ctx.quadraticCurveTo(246, 86, 236, 86);
    ctx.lineTo(20, 86);
    ctx.quadraticCurveTo(10, 86, 10, 70);
    ctx.lineTo(10, 26);
    ctx.quadraticCurveTo(10, 10, 20, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(128, 86);
    ctx.lineTo(138, 106);
    ctx.lineTo(118, 86);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 48);
    if (this.speechTexture) {
      this.speechTexture.needsUpdate = true;
    }
  }

  private _isTabVisible(): boolean {
    return !(document.hidden || (document.visibilityState && document.visibilityState !== 'visible'));
  }

  private _animate() {
    if (!this.model) return;
    const animateFn = () => {
      if (!this._isTabVisible()) {
        this.animationId = requestAnimationFrame(animateFn);
        return;
      }
      const t = performance.now() * 0.001;
      if (this.model) {
        this.model.position.y = 0.5 + Math.sin(t * 2) * 0.1;
        this.model.rotation.y = Math.sin(t * 0.5) * 0.3;
        this.model.rotation.z = Math.sin(t * 1.2) * 0.05;
      }
      if (this.accessoryMesh) {
        this.accessoryMesh.position.x = 0;
        this.accessoryMesh.position.z = 0;
      }
      if (this.speechMesh && this.model) {
        this.speechMesh.position.x = this.model.position.x;
        this.speechMesh.position.z = this.model.position.z;
        this.speechMesh.position.y = this.model.position.y + 0.9;
        this.speechMesh.lookAt(this.camera.position);
      }
      if (this.glowMesh) {
        const baseOpacity = (this.glowMesh.material as THREE.MeshBasicMaterial).opacity;
        (this.glowMesh.material as THREE.MeshBasicMaterial).opacity = baseOpacity * (0.85 + 0.15 * Math.sin(t * 2));
        this.glowMesh.scale.set(1.05 + 0.04 * Math.sin(t * 2), 1.05 + 0.04 * Math.sin(t * 2), 1.05 + 0.04 * Math.sin(t * 2));
      }
      this.renderer.render(this.scene, this.camera);
      this.animationId = requestAnimationFrame(animateFn);
    };
    animateFn();
  }
}
