import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class MaterialManager {
  static createMeshes(
    curve1: THREE.Curve<THREE.Vector3>,
    curve2: THREE.Curve<THREE.Vector3>,
    config: CylinderConfig
  ) {
    const { radius, radialSegments, color, emissiveIntensity, shininess, zOffset } = config;

    const mat = new THREE.MeshPhongMaterial({
      color,
      shininess,
      emissive: new THREE.Color(color),
      emissiveIntensity,
    });

    const geo1 = new THREE.TubeGeometry(curve1, 256, radius, radialSegments, false);
    const geo2 = new THREE.TubeGeometry(curve2, 256, radius, radialSegments, false);

    const mesh1 = new THREE.Mesh(geo1, mat);
    const mesh2 = new THREE.Mesh(geo2, mat.clone());
    mesh2.position.z = zOffset;

    return { mesh1, mesh2 };
  }
}
