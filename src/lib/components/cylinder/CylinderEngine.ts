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
    const visibleWidth = this.getVisibleWidth();
    const rightEdge = visibleWidth / 2;
    const turnPointX = rightEdge - visibleWidth / 1.5;

    const topY = 2;
    const bottomY = -2;
    const curveRadius = Math.abs(topY - bottomY) / 2;
    const margin = 2;

    const points: THREE.Vector3[] = [];

    // Heenweg
    points.push(new THREE.Vector3(rightEdge + margin, topY, 0));
    points.push(new THREE.Vector3(turnPointX, topY, 0));

    // U-bocht
    const centerX = turnPointX;
    const centerY = (topY + bottomY) / 2;
    const segments = 16;

    for (let i = 0; i <= segments; i++) {
      const angle = Math.PI / 2 + (i / segments) * Math.PI;
      const x = centerX + curveRadius * Math.cos(angle);
      const y = centerY + curveRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Terugweg
    points.push(new THREE.Vector3(turnPointX, bottomY, 0));
    points.push(new THREE.Vector3(rightEdge + margin, bottomY, 0));

    // Maak curve en tube EENMALIG
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 200, 0.25, 8, false);
    const material = new THREE.MeshPhongMaterial({
      color: this.config.color,
      shininess: 100,
      emissive: new THREE.Color(this.config.color).multiplyScalar(0.2),
    });

    this.trackMesh = new THREE.Mesh(geometry, material);

    // Start met geometry onzichtbaar
    this.trackMesh.geometry.setDrawRange(0, 0);
    this.scene.add(this.trackMesh);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
