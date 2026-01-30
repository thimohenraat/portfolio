import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class MaterialManager {
  private static material: THREE.MeshStandardMaterial | null = null;

  static getMaterial(config: CylinderConfig) {
    if (!this.material) {
      this.material = new THREE.MeshStandardMaterial({
        color: 0x000000, // Puur zwart zodat alleen het licht telt
        roughness: 1, // Verhoog dit voor een "glowy" spreiding over de hele cylinder
        metalness: 0.5, // Zet metalness lager om het licht meer als 'diffuse' kleur te vangen
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
