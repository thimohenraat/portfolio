import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class MaterialManager {
  private static material: THREE.MeshPhongMaterial | null = null;

  static getMaterial(config: CylinderConfig) {
    if (!this.material) {
      this.material = new THREE.MeshPhongMaterial({
        color: config.material.color,
        shininess: config.material.shininess,
        emissive: new THREE.Color(config.material.color),
        emissiveIntensity: config.material.emissiveIntensity,
      });
    }
    return this.material;
  }

  static createGeometry(curve: THREE.Curve<THREE.Vector3>, config: CylinderConfig) {
    return new THREE.TubeGeometry(
      curve,
      config.geometry.tubeSegments,
      config.geometry.radius,
      config.geometry.radialSegments,
      false
    );
  }

  static dispose() {
    this.material?.dispose();
    this.material = null;
  }
}
