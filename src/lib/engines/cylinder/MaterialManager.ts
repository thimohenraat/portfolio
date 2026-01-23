import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class MaterialManager {
  private static material: THREE.MeshPhongMaterial | null = null;

  static getMaterial(config: CylinderConfig) {
    if (!this.material) {
      this.material = new THREE.MeshPhongMaterial({
        color: config.color,
        shininess: config.shininess,
        emissive: new THREE.Color(config.color),
        emissiveIntensity: config.emissiveIntensity,
      });
    }
    return this.material;
  }

  static createGeometry(curve: THREE.Curve<THREE.Vector3>, config: CylinderConfig) {
    return new THREE.TubeGeometry(
      curve,
      config.tubeSegments,
      config.radius,
      config.radialSegments,
      false
    );
  }

  static dispose() {
    this.material?.dispose();
    this.material = null;
  }
}
