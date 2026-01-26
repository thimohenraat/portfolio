import * as THREE from 'three';
import type { CylinderConfig, BreakpointConfig } from '../../types/cylinder';
import { PathFactory } from './PathFactory';
import { MaterialManager } from './MaterialManager';

export class CylinderEngine {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private mesh1!: THREE.Mesh;
  private mesh2!: THREE.Mesh;
  private progress = 0;
  private stopRatio = 0;
  private animationId = 0;
  public animationFinished = false;
  private fixedWidth = 0;
  private fixedHeight = 0;

  constructor(
    private container: HTMLDivElement,
    private config: CylinderConfig
  ) {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.setRendererSize();
    container.appendChild(this.renderer.domElement);

    this.init();
  }

  private getBreakpoint(): BreakpointConfig {
    const w = window.innerWidth;
    const { breakpoints } = this.config;

    if (w < 650) return breakpoints.mobile;
    if (w < 1024) return breakpoints.tablet;
    if (w < 1728) return breakpoints.desktop;
    return breakpoints.ultrawide;
  }

  private setRendererSize() {
    const bp = this.getBreakpoint();
    this.fixedWidth = bp.width;
    this.fixedHeight = window.innerHeight;

    this.camera.aspect = this.fixedWidth / this.fixedHeight;
    this.camera.position.z = bp.camera.z;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.fixedWidth, this.fixedHeight);

    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'block',
    });
  }

  private init() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const direct = new THREE.DirectionalLight(0xffffff, 0.8);
    direct.position.set(5, 10, 7);
    this.scene.add(direct);
    this.build();
  }

  private calculateStopRatio(curve: THREE.Curve<THREE.Vector3>, turnPoint: number) {
    const samples = 200;
    let length = 0;
    let stopLength = 0;
    let prev = curve.getPoint(0);

    for (let i = 1; i <= samples; i++) {
      const p = curve.getPoint(i / samples);
      length += p.distanceTo(prev);
      if (p.x <= turnPoint && stopLength === 0) stopLength = length;
      prev = p;
    }
    return stopLength / length;
  }

  private build() {
    // Verwijder oude meshes...
    [this.mesh1, this.mesh2].forEach(m => {
      if (m) {
        this.scene.remove(m);
        m.geometry.dispose();
      }
    });

    // Nauwkeurige berekening van wat de camera werkelijk ziet op de z-as:
    const vFOV = (this.camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * this.camera.position.z;
    const visibleWidth = visibleHeight * this.camera.aspect;

    // Geef deze visibleWidth door aan de PathFactory
    const { curve1, curve2, turnPoint } = PathFactory.getCurves(visibleWidth, this.config);

    const material = MaterialManager.getMaterial(this.config);
    this.mesh1 = new THREE.Mesh(MaterialManager.createGeometry(curve1, this.config), material);
    this.mesh2 = new THREE.Mesh(MaterialManager.createGeometry(curve2, this.config), material);

    this.scene.add(this.mesh1, this.mesh2);
    this.stopRatio = this.calculateStopRatio(curve1, turnPoint);
    this.update();
  }

  private update() {
    const head = Math.min(this.progress, 1);

    // De tail staat op 0 zodat de cilinder vanuit het beginpunt 'groeit'
    // Als progress 0.5 is, is hij voor de helft getekend vanaf het turnPoint.
    const tail = 0;

    const step = this.config.geometry.radialSegments * 6;

    [this.mesh1, this.mesh2].forEach(m => {
      if (!m) return;
      const geo = m.geometry as THREE.BufferGeometry;
      const total = geo.index!.count;

      const start = 0; // Altijd bij het begin van de nieuwe curve
      const end = Math.floor((head * total) / step) * step;

      geo.setDrawRange(start, Math.max(0, end - start));
    });
  }

  public animate = () => {
    this.clock.start();
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      if (!this.animationFinished) {
        const dt = Math.min(this.clock.getDelta(), 0.05);
        this.progress += dt * this.config.animation.speed;
        this.update();

        if (this.progress >= 1) {
          this.progress = 1;
          this.animationFinished = true;
        }
      }
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  };

  public resize() {
    this.setRendererSize();
    this.build();
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);
    [this.mesh1, this.mesh2].forEach(m => {
      if (m) {
        m.geometry.dispose();
        this.scene.remove(m);
      }
    });
    MaterialManager.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
