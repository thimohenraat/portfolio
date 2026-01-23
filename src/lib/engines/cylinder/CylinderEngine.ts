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

  private build() {
    const visibleWidth =
      2 * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z * this.camera.aspect;
    const { curve1, curve2, turnPoint } = PathFactory.getCurves(visibleWidth, this.config);

    if (this.mesh1)
      [this.mesh1, this.mesh2].forEach(m => {
        this.scene.remove(m);
        m.geometry.dispose();
      });

    const meshes = MaterialManager.createMeshes(curve1, curve2, this.config);
    this.mesh1 = meshes.mesh1;
    this.mesh2 = meshes.mesh2;
    this.scene.add(this.mesh1, this.mesh2);

    const points = curve1.getSpacedPoints(this.config.tubeSegments);
    const target = new THREE.Vector3(turnPoint, this.config.lineYOffset, 0);
    this.stopRatio = points.findIndex(p => p.distanceTo(target) < 0.1) / this.config.tubeSegments;

    this.update();
  }

  private update() {
    const head = Math.min(this.progress, 1);
    const tail = Math.min(Math.max(0, head - this.config.initialCylinderLength), this.stopRatio);
    const step = this.config.radialSegments * 6;

    [this.mesh1, this.mesh2].forEach(m => {
      const total = m.geometry.index?.count || 0;
      const s = Math.floor((tail * total) / step) * step;
      const e = Math.floor((head * total) / step) * step;
      m.geometry.setDrawRange(s, Math.max(0, e - s));
    });
  }

  public animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    if (!this.animationFinished) {
      this.progress += this.clock.getDelta() * this.config.animationSpeed;
      this.update();
      if (this.progress >= 1) this.animationFinished = true;
    }
    this.renderer.render(this.scene, this.camera);
  };

  public resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.build();
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
