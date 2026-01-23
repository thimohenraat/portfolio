import * as THREE from 'three';
import type { CylinderConfig } from './types';

export class CylinderEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private trackMesh: THREE.Mesh | null = null;
  private clock = new THREE.Clock();

  private animationId: number = 0;
  private progress: number = 0;
  public animationFinished: boolean = false;
  private config: CylinderConfig;

  constructor(container: HTMLDivElement, config: CylinderConfig) {
    this.config = config;

    // Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a2a);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 4, 12);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Lighting
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
    if (this.trackMesh) {
      this.trackMesh.geometry.dispose();
      (this.trackMesh.material as THREE.Material).dispose();
      this.scene.remove(this.trackMesh);
      this.trackMesh = null;
    }

    const visibleWidth = this.getVisibleWidth();

    /**
     * CENTRERING LOGICA:
     * We verdelen het scherm in 3 gelijke vlakken.
     * De bochten komen op de grenzen van het middelste vlak.
     */
    const oneThird = visibleWidth / 3;
    const turnPointLeft = -oneThird / 2; // Grens tussen linkervlak en middenvlak
    const turnPointRight = oneThird / 2; // Grens tussen middenvlak en rechtervlak

    const lineTop = 2;
    const lineBottom = -2;
    const turnRadius = Math.abs(lineTop - lineBottom) / 2;
    const centerY = (lineTop + lineBottom) / 2;

    const points: THREE.Vector3[] = [];
    const segments = 24; // Iets meer voor een perfecte ronde bocht

    // 1. BOVENSTE RECHTE LIJN (van rechts naar links)
    points.push(new THREE.Vector3(turnPointRight, lineTop, 0));
    points.push(new THREE.Vector3(turnPointLeft, lineTop, 0));

    // 2. LINKER BOCHT (180° draai naar beneden)
    for (let i = 1; i < segments; i++) {
      const angle = Math.PI / 2 + (i / segments) * Math.PI;
      const x = turnPointLeft + turnRadius * Math.cos(angle);
      const y = centerY + turnRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // 3. ONDERSTE RECHTE LIJN (van links naar rechts)
    points.push(new THREE.Vector3(turnPointLeft, lineBottom, 0));
    points.push(new THREE.Vector3(turnPointRight, lineBottom, 0));

    // 4. RECHTER BOCHT (180° draai omhoog)
    for (let i = 1; i < segments; i++) {
      const angle = (3 * Math.PI) / 2 + (i / segments) * Math.PI;
      const x = turnPointRight + turnRadius * Math.cos(angle);
      const y = centerY + turnRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Creëer de gesloten curve
    const curve = new THREE.CatmullRomCurve3(points, true);

    // Tube maken
    const geometry = new THREE.TubeGeometry(curve, 256, 0.25, 12, true);

    const material = new THREE.MeshPhongMaterial({
      color: this.config.color,
      shininess: 100,
      emissive: new THREE.Color(this.config.color).multiplyScalar(0.2),
    });

    this.trackMesh = new THREE.Mesh(geometry, material);

    // Behoud de huidige voortgang bij resize
    const totalIndices = this.trackMesh.geometry.index?.count || 0;
    this.trackMesh.geometry.setDrawRange(0, Math.floor(this.progress * totalIndices));

    this.scene.add(this.trackMesh);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Recreate track with new dimensions but keep progress
    const currentProgress = this.progress;
    this.createTrack();
    this.progress = currentProgress;

    // Apply current progress immediately
    if (this.trackMesh) {
      const totalIndices = this.trackMesh.geometry.index?.count || 0;
      const visibleIndices = Math.floor(this.progress * totalIndices);
      this.trackMesh.geometry.setDrawRange(0, visibleIndices);
    }
  }

  public animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    if (!this.animationFinished && this.trackMesh) {
      this.progress += 0.01; // Snelheid

      if (this.progress >= 1) {
        this.progress = 1;
        this.animationFinished = true;
      }

      // Update alleen de drawRange - GEEN nieuwe geometry!
      const totalIndices = this.trackMesh.geometry.index?.count || 0;
      const visibleIndices = Math.floor(this.progress * totalIndices);
      this.trackMesh.geometry.setDrawRange(0, visibleIndices);
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    if (this.trackMesh) {
      this.trackMesh.geometry.dispose();
      (this.trackMesh.material as THREE.Material).dispose();
    }
    this.renderer.domElement.remove();
  }
}
