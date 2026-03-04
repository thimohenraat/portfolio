import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { CylinderScene } from './CylinderScene';
import { AnimationController } from './AnimationController';
import { PointerRipple } from './PointerRipple';
import type { CylinderConfig, BreakpointConfig } from '../../types/cylinder';

export class CylinderEngine {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private anim: AnimationController;
  private cylScene: CylinderScene;
  private ripple: PointerRipple;
  private animationId = 0;

  private handlePointerDown = (e: PointerEvent) => this.ripple.addDrop(e);
  private handleTouchStart = (e: TouchEvent) => {
    if (e.touches[0]) this.ripple.addDrop(e.touches[0]);
  };

  constructor(
    private container: HTMLDivElement,
    private config: CylinderConfig
  ) {
    RectAreaLightUniformsLib.init();

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.anim = new AnimationController();
    this.cylScene = new CylinderScene(this.scene);
    this.ripple = new PointerRipple(this.camera);

    window.addEventListener('pointerdown', this.handlePointerDown, { passive: true });
    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });

    this.resize();
    this.animate();
  }

  private getBreakpoint(): BreakpointConfig {
    const w = window.innerWidth;
    return w < 650
      ? this.config.breakpoints.mobile
      : w < 1240
        ? this.config.breakpoints.tablet
        : this.config.breakpoints.desktop;
  }

  public animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    const dt = this.clock.getDelta();
    const time = this.clock.getElapsedTime();
    const state = this.anim.update(dt, this.config.animation.speed);

    // getRipples now handles cleanup internally
    const ripples = this.ripple.getRipples(time);

    this.cylScene.updateMeshes(
      this.anim.progress,
      this.config.geometry.radialSegments,
      ripples,
      time
    );

    this.cylScene.updateLights(time, state);
    this.renderer.render(this.scene, this.camera);
  };

  public resize() {
    const bp = this.getBreakpoint();
    const isMobile = window.innerWidth < 650;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;
    this.camera.position.z = bp.camera.z;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    Object.assign(this.renderer.domElement.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      margin: '0',
      padding: '0',
      display: 'block',
      pointerEvents: 'none',
    });

    const vFOH = (this.camera.fov * Math.PI) / 180;
    const visH = 2 * Math.tan(vFOH / 2) * this.camera.position.z;
    const visW = visH * this.camera.aspect;

    this.cylScene.build(visW, visH, this.config, isMobile);
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);
    // Zorg dat de juiste listeners worden verwijderd
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('touchstart', this.handleTouchStart);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
