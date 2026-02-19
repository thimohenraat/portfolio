import * as THREE from 'three';
import { PathFactory } from './PathFactory';
import { MaterialManager } from './MaterialManager';
import type { CylinderConfig } from '../../types/cylinder';

export class CylinderScene {
  public meshes: THREE.Mesh[] = [];
  public lights: { light: THREE.RectAreaLight; phase: number }[] = [];

  constructor(private scene: THREE.Scene) {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    this.setupLights();
  }

  private setupLights() {
    const lightConfigs = [
      { color: 0x8b0000, phase: 0 },
      { color: 0x006400, phase: Math.PI * 0.66 },
      { color: 0x00008b, phase: Math.PI * 1.33 },
    ];

    lightConfigs.forEach(cfg => {
      const rectLight = new THREE.RectAreaLight(cfg.color, 0, 120, 120);
      this.scene.add(rectLight);
      this.lights.push({ light: rectLight, phase: cfg.phase });
    });
  }

  build(visibleWidth: number, visibleHeight: number, config: CylinderConfig, isMobile: boolean) {
    this.meshes.forEach(m => {
      m.geometry.dispose();
      this.scene.remove(m);
    });
    this.meshes = [];

    const material = MaterialManager.getMaterial(config);
    const numRings = 20;
    const { horizontalScaleStep, verticalScaleStep } = config.geometry;

    for (let i = 0; i < numRings; i++) {
      const horizontalMultiplier = 1.0 + i * horizontalScaleStep;
      const verticalMultiplier = 1.0 + i * verticalScaleStep;

      const curves = PathFactory.getCurves(
        visibleWidth,
        visibleHeight,
        config,
        isMobile,
        horizontalMultiplier,
        verticalMultiplier
      );

      const meshes = [
        MaterialManager.createGeometry(curves.curve1, config),
        MaterialManager.createGeometry(curves.curve2, config),
      ].map(geo => new THREE.Mesh(geo, material));

      meshes.forEach(m => {
        const geo = m.geometry as THREE.BufferGeometry;

        // 🔥 originele posities opslaan
        geo.userData.basePosition = geo.attributes.position.array.slice();

        this.meshes.push(m);
        this.scene.add(m);
      });
    }
  }

  updateMeshes(progress: number, radialSegments: number, ripples: any[], time: number) {
    const step = radialSegments * 6;

    this.meshes.forEach(m => {
      const geo = m.geometry as THREE.BufferGeometry;
      const pos = geo.attributes.position;
      const base = geo.userData.basePosition as Float32Array;

      // reset geometry eerst
      pos.array.set(base);

      const arr = pos.array as Float32Array;

      for (let i = 0; i < arr.length; i += 3) {
        const x = base[i];
        const y = base[i + 1];
        const z = base[i + 2];

        let offset = 0;

        for (const r of ripples) {
          const age = time - r.start;
          if (age > 2.2) continue;

          const dx = x - r.pos.x;
          const dy = y - r.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const wave = Math.sin(dist * 3 - age * 5) * Math.exp(-dist * 1.2) * Math.exp(-age * 1.8);

          offset += wave * r.force;
        }

        arr[i + 2] = z + offset;
      }

      pos.needsUpdate = true;

      const total = geo.index!.count;
      geo.setDrawRange(0, Math.floor((progress * total) / step) * step);
    });
  }

  updateLights(time: number, state: any) {
    this.lights.forEach((item, i) => {
      if (state.phase === 'BUILD') {
        item.light.intensity = 0;
        return;
      }

      const t = time * 0.8 + i * Math.PI * 0.5;
      const radiusX = 12;
      const radiusY = 6;
      const posZ = 12;

      item.light.position.set(Math.sin(t) * radiusX, Math.sin(t * 2) * radiusY, posZ);
      item.light.lookAt(0, 0, 0);

      if (state.phase === 'FLICKER') {
        const speedUp = state.timer * state.timer * 25;
        const flicker = (Math.sin(speedUp) * 0.8 + 1) * Math.min(1, state.timer / 1.2);
        item.light.intensity = flicker * 250;
      } else {
        const breathing = Math.sin(time + item.phase);
        item.light.intensity = 80 + breathing * 60;
      }
    });
  }
}
