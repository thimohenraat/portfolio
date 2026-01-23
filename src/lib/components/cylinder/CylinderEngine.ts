import * as THREE from 'three';

export interface CylinderConfig {
  color: string | number;
}

export class CylinderEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private mesh1: THREE.Mesh | null = null;
  private mesh2: THREE.Mesh | null = null;
  private clock = new THREE.Clock();

  private animationId: number = 0;
  private progress: number = 0;
  public animationFinished: boolean = false;
  private config: CylinderConfig;

  private stopRatio: number = 0;

  constructor(container: HTMLDivElement, config: CylinderConfig) {
    this.config = config;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a2a);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 12);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 7);
    this.scene.add(ambient, directional);

    this.createTrack();
  }

  private getVisibleWidth(): number {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fovRad / 2) * Math.abs(this.camera.position.z);
    return height * this.camera.aspect;
  }

  private createTrack(): void {
    if (this.mesh1) {
      this.scene.remove(this.mesh1);
      this.mesh1.geometry.dispose();
    }
    if (this.mesh2) {
      this.scene.remove(this.mesh2);
      this.mesh2.geometry.dispose();
    }

    const visibleWidth = this.getVisibleWidth();
    const ovalWidth = visibleWidth * 0.5;
    const turnPointLeft = -ovalWidth / 2;
    const turnPointRight = ovalWidth / 2;
    const lineTop = 2;
    const lineBottom = -2;
    const turnRadius = Math.abs(lineTop - lineBottom) / 2;
    const centerY = (lineTop + lineBottom) / 2;
    const offScreen = visibleWidth / 2 + 5;

    const segments = 64;

    const points1: THREE.Vector3[] = [];
    points1.push(new THREE.Vector3(offScreen, lineTop, 0));
    points1.push(new THREE.Vector3(turnPointRight, lineTop, 0));
    points1.push(new THREE.Vector3(turnPointLeft, lineTop, 0));
    for (let i = 1; i <= segments; i++) {
      const angle = Math.PI / 2 + (i / segments) * Math.PI;
      points1.push(
        new THREE.Vector3(
          turnPointLeft + turnRadius * Math.cos(angle),
          centerY + turnRadius * Math.sin(angle),
          0
        )
      );
    }
    points1.push(new THREE.Vector3(0, lineBottom, 0));

    const points2: THREE.Vector3[] = [];
    points2.push(new THREE.Vector3(-offScreen, lineBottom, 0));
    points2.push(new THREE.Vector3(turnPointLeft, lineBottom, 0));
    points2.push(new THREE.Vector3(turnPointRight, lineBottom, 0));
    for (let i = 1; i <= segments; i++) {
      const angle = (3 * Math.PI) / 2 + (i / segments) * Math.PI;
      points2.push(
        new THREE.Vector3(
          turnPointRight + turnRadius * Math.cos(angle),
          centerY + turnRadius * Math.sin(angle),
          0
        )
      );
    }
    points2.push(new THREE.Vector3(0, lineTop, 0));

    const curve1 = new THREE.CatmullRomCurve3(points1).getSpacedPoints(600);
    const curve2 = new THREE.CatmullRomCurve3(points2).getSpacedPoints(600);

    let minDist = Infinity;
    curve1.forEach((p, i) => {
      const d = p.distanceTo(new THREE.Vector3(turnPointRight, lineTop, 0));
      if (d < minDist && i < 200) {
        minDist = d;
        this.stopRatio = i / 600;
      }
    });

    const geo1 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve1), 300, 0.25, 12, false);
    const geo2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curve2), 300, 0.25, 12, false);
    const mat = new THREE.MeshPhongMaterial({ color: this.config.color, shininess: 100 });

    this.mesh1 = new THREE.Mesh(geo1, mat);
    this.mesh2 = new THREE.Mesh(geo2, mat);
    this.mesh2.position.z = 0.01;

    this.scene.add(this.mesh1, this.mesh2);

    // Na creatie direct de juiste positie instellen op basis van huidige progressie
    this.updateVisuals();
  }

  private updateVisuals(): void {
    if (!this.mesh1 || !this.mesh2) return;

    const head = Math.min(this.progress, 1);
    const cylinderLength = 0.2;
    let tail = Math.max(0, head - cylinderLength);

    if (tail > this.stopRatio) {
      tail = this.stopRatio;
    }

    const updateMesh = (mesh: THREE.Mesh, h: number, t: number) => {
      const total = mesh.geometry.index?.count || 0;
      const step = 72;
      const s = Math.floor((t * total) / step) * step;
      const e = Math.floor((h * total) / step) * step;
      mesh.geometry.setDrawRange(s, Math.max(0, e - s));
    };

    updateMesh(this.mesh1, head, tail);
    updateMesh(this.mesh2, head, tail);
  }

  public animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.animationFinished && this.mesh1 && this.mesh2) {
      const delta = this.clock.getDelta();
      this.progress += delta * 0.4;

      this.updateVisuals();

      if (this.progress >= 1) {
        this.animationFinished = true;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // We roepen createTrack aan, die intern updateVisuals() aanroept.
    // Omdat we this.progress NIET op 0 zetten, blijft de animatie waar hij was.
    this.createTrack();
  }

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    [this.mesh1, this.mesh2].forEach(m => {
      if (m) {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      }
    });
    this.renderer.domElement.remove();
  }
}
