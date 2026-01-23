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
    // Remove old track if it exists
    if (this.trackMesh) {
      this.trackMesh.geometry.dispose();
      (this.trackMesh.material as THREE.Material).dispose();
      this.scene.remove(this.trackMesh);
      this.trackMesh = null;
    }

    const visibleWidth = this.getVisibleWidth();
    const edgeRight = visibleWidth / 2;
    const turnPoint = edgeRight - visibleWidth / 1.5;

    const lineTop = 2;
    const lineBottom = -2;
    const turnRadius = Math.abs(lineTop - lineBottom) / 2;
    const margin = 2;

    const points: THREE.Vector3[] = [];

    // Top straight section
    points.push(new THREE.Vector3(edgeRight + margin, lineTop, 0));
    points.push(new THREE.Vector3(turnPoint, lineTop, 0));

    // Turn section - half circle
    const centerX = turnPoint;
    const centerY = lineTop + lineBottom;
    const segments = 20; // Meer segments voor betere aansluiting

    for (let i = 1; i < segments; i++) {
      // i=1 en i<segments om dubbele punten te vermijden
      const angle = Math.PI / 2 + (i / segments) * Math.PI;
      const x = centerX + turnRadius * Math.cos(angle);
      const y = centerY + turnRadius * Math.sin(angle);
      points.push(new THREE.Vector3(x, y, 0));
    }

    // Bottom straight section
    points.push(new THREE.Vector3(turnPoint, lineBottom, 0));
    points.push(new THREE.Vector3(edgeRight + margin, lineBottom, 0));

    // Create curve and tube once
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0);
    const geometry = new THREE.TubeGeometry(curve, 200, 0.25, 8, false);
    const material = new THREE.MeshPhongMaterial({
      color: this.config.color,
      shininess: 100,
      emissive: new THREE.Color(this.config.color).multiplyScalar(0.2),
    });

    this.trackMesh = new THREE.Mesh(geometry, material);

    // Start invisible
    this.trackMesh.geometry.setDrawRange(0, 0);
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
