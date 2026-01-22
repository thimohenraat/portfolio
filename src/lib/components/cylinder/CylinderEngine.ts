import * as THREE from 'three';
import type { CylinderConfig } from './types';

export class CylinderEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cylinder: THREE.Mesh;
  private clock = new THREE.Clock();

  private animationId: number = 0;
  private currentScale: number = 0.1;
  public animationFinished: boolean = false;
  private config: CylinderConfig;

  constructor(container: HTMLDivElement, config: CylinderConfig) {
    this.config = config;

    // Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = this.config.cameraZ;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Mesh
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshPhongMaterial({ color: this.config.color, shininess: 100 });
    this.cylinder = new THREE.Mesh(geometry, material);
    this.cylinder.rotation.z = Math.PI / 2;
    this.scene.add(this.cylinder);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const directional = new THREE.DirectionalLight(0xffffff, 1);
    directional.position.set(5, 10, 7);
    this.scene.add(ambient, directional);

    this.updateTransform();
  }

  private getVisibleWidth(): number {
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
    return height * this.camera.aspect;
  }

  public updateTransform(): void {
    const visibleWidth = this.getVisibleWidth();
    const targetScale = visibleWidth + this.config.margin;

    this.cylinder.position.x = visibleWidth / 2;
    this.cylinder.scale.y = this.animationFinished ? targetScale : this.currentScale;
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.updateTransform();
  }

  public animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const targetScale = this.getVisibleWidth() + this.config.margin;

    if (!this.animationFinished) {
      if (this.currentScale < targetScale) {
        this.currentScale += this.config.stretchSpeed * delta * 60;
      } else {
        this.animationFinished = true;
        this.currentScale = targetScale;
      }
      this.updateTransform();
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    this.cylinder.geometry.dispose();
    (this.cylinder.material as THREE.Material).dispose();
    this.renderer.domElement.remove();
  }
}
