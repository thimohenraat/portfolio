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

    // 🔥 ripple controller
    this.ripple = new PointerRipple(this.camera);

    window.addEventListener('pointermove', e => {
      this.ripple.addFromEvent(e);
    });

    window.addEventListener('touchmove', e => {
      if (e.touches[0]) this.ripple.addFromEvent(e.touches[0]);
    });

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

    this.ripple.cleanup(time);

    this.cylScene.updateMeshes(
      this.anim.progress,
      this.config.geometry.radialSegments,
      this.ripple.getRipples(),
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

    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      width: '100vw',
      height: '100vh',
      margin: '0',
      padding: '0',
      display: 'block',
    });

    const vFOH = (this.camera.fov * Math.PI) / 180;
    const visH = 2 * Math.tan(vFOH / 2) * this.camera.position.z;
    const visW = visH * this.camera.aspect;

    this.cylScene.build(visW, visH, this.config, isMobile);
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
