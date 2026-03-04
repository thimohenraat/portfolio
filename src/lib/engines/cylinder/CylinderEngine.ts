// CylinderEngine.ts
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { CylinderScene } from './CylinderScene';
import { AnimationController } from './AnimationController';
import { PointerRipple } from './PointerRipple';
import type { CylinderConfig, BreakpointConfig } from '../../types/cylinder';

export class CylinderEngine {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock = new THREE.Clock();
  private readonly anim: AnimationController;
  private readonly cylScene: CylinderScene;
  private readonly ripple: PointerRipple;
  private animationId = 0;

  // Tijdsynchronisatie: performance.now() startpunt om gelijk te lopen met THREE.Clock
  private readonly startPerformance = performance.now();

  // Gebonden event handlers
  private readonly handlePointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    const now = (performance.now() - this.startPerformance) / 1000; // seconden sinds start
    this.ripple.addDrop(e, now);
  };

  private readonly handleTouchStart = (e: TouchEvent): void => {
    if (e.touches[0]) {
      const now = (performance.now() - this.startPerformance) / 1000;
      this.ripple.addDrop(e.touches[0], now);
    }
  };

  private readonly handleResize = (): void => {
    this.resize();
  };

  constructor(
    private readonly container: HTMLDivElement,
    private readonly config: CylinderConfig
  ) {
    RectAreaLightUniformsLib.init();

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    Object.assign(this.renderer.domElement.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      margin: '0',
      padding: '0',
      display: 'block',
      pointerEvents: 'none', // canvas vangt geen muis events, die gaan naar window
    });

    container.appendChild(this.renderer.domElement);

    this.anim = new AnimationController();
    this.cylScene = new CylinderScene(this.scene);
    this.ripple = new PointerRipple(this.camera);

    window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('resize', this.handleResize, { passive: true });

    this.resize();
    this.animate();
  }

  private getBreakpoint(): BreakpointConfig {
    const w = window.innerWidth;
    if (w < 650) return this.config.breakpoints.mobile;
    if (w < 1240) return this.config.breakpoints.tablet;
    return this.config.breakpoints.desktop;
  }

  // Arrow function zodat 'this' correct blijft in requestAnimationFrame
  public readonly animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const dt = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    const state = this.anim.update(dt, this.config.animation.speed);
    const ripples = this.ripple.getRipples(time); // tijd meegeven voor filtering

    this.cylScene.updateMeshes(
      this.anim.progress,
      this.config.geometry.radialSegments,
      ripples,
      time
    );

    this.cylScene.updateLights(time, state);
    this.renderer.render(this.scene, this.camera);
  };

  public resize(): void {
    const bp = this.getBreakpoint();
    const isMobile = window.innerWidth < 650;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.position.z = bp.camera.z;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    // Zichtbare wereldafmetingen op z=0
    const halfFovRad = (this.camera.fov * Math.PI) / 360;
    const visH = 2 * Math.tan(halfFovRad) * this.camera.position.z;
    const visW = visH * this.camera.aspect;

    this.cylScene.build(visW, visH, this.config, isMobile);
  }

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    window.removeEventListener('resize', this.handleResize);
    this.cylScene.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
