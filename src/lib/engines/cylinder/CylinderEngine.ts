import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';
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
    this.camera.position.z = config.cameraZ;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.init();
  }

  private init() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const direct = new THREE.DirectionalLight(0xffffff, 0.8);
    direct.position.set(5, 10, 7);
    this.scene.add(direct);
    this.build();
  }

  private calculateStopRatio(curve: THREE.Curve<THREE.Vector3>, turnPoint: number) {
    const samples = 200; // licht, maar nauwkeurig
    let length = 0;
    let stopLength = 0;

    let prev = curve.getPoint(0);

    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const p = curve.getPoint(t);
      const seg = p.distanceTo(prev);
      length += seg;

      if (p.x <= turnPoint && stopLength === 0) {
        stopLength = length;
      }

      prev = p;
    }

    return stopLength / length;
  }

  private build() {
    const visibleWidth =
      2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z * this.camera.aspect;

    const { curve1, curve2, turnPoint } = PathFactory.getCurves(visibleWidth, this.config);

    // 🔥 Oude meshes netjes opruimen
    [this.mesh1, this.mesh2].forEach(m => {
      if (!m) return;
      this.scene.remove(m);
      m.geometry.dispose();
    });

    const material = MaterialManager.getMaterial(this.config);

    const geo1 = MaterialManager.createGeometry(curve1, this.config);
    const geo2 = MaterialManager.createGeometry(curve2, this.config);

    this.mesh1 = new THREE.Mesh(geo1, material);
    this.mesh2 = new THREE.Mesh(geo2, material);

    this.scene.add(this.mesh1, this.mesh2);

    // ✅ SNELLE stopRatio (geen getSpacedPoints!)
    this.stopRatio = this.calculateStopRatio(curve1, turnPoint);

    this.update();
  }

  private update() {
    const head = Math.min(this.progress, 1);
    const tail = Math.min(Math.max(0, head - this.config.initialCylinderLength), this.stopRatio);

    const step = this.config.radialSegments * 6;

    [this.mesh1, this.mesh2].forEach(m => {
      if (!m) return;

      const geo = m.geometry as THREE.BufferGeometry;
      const total = geo.index!.count;

      const start = (((tail * total) / step) | 0) * step;
      const end = (((head * total) / step) | 0) * step;

      const count = Math.min(total - start, Math.max(0, end - start));

      geo.setDrawRange(start, count);
    });
  }

  public animate = () => {
    this.clock.start();

    const loop = () => {
      this.animationId = requestAnimationFrame(loop);

      if (!this.animationFinished) {
        const dt = Math.min(this.clock.getDelta(), 0.05);
        this.progress += dt * this.config.animationSpeed;
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
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.build();
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);

    [this.mesh1, this.mesh2].forEach(m => {
      if (!m) return;
      m.geometry.dispose();
      this.scene.remove(m);
    });

    MaterialManager.dispose();

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
