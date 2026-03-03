import * as THREE from 'three';
import { PathFactory } from './PathFactory';
import { MaterialManager } from './MaterialManager';
import type { CylinderConfig } from '../../types/cylinder';

const RIPPLE_LIFETIME = 2.2;

export class CylinderScene {
  public meshes: THREE.Mesh[] = [];
  public lights: { light: THREE.RectAreaLight; phase: number }[] = [];

  constructor(private scene: THREE.Scene) {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    this.setupLights();
  }

  private setupLights() {
    const configs = [
      { color: 0x8b0000, phase: 0 },
      { color: 0x006400, phase: Math.PI * 0.66 },
      { color: 0x00008b, phase: Math.PI * 1.33 },
    ];
    for (const cfg of configs) {
      const light = new THREE.RectAreaLight(cfg.color, 0, 120, 120);
      this.scene.add(light);
      this.lights.push({ light, phase: cfg.phase });
    }
  }

  build(visibleWidth: number, visibleHeight: number, config: CylinderConfig, isMobile: boolean) {
    for (const m of this.meshes) {
      m.geometry.dispose();
      this.scene.remove(m);
    }
    this.meshes = [];

    const material = MaterialManager.getMaterial(config);
    const numRings = 20;
    const { horizontalScaleStep, verticalScaleStep } = config.geometry;

    for (let i = 0; i < numRings; i++) {
      const hMult = 1.0 + i * horizontalScaleStep;
      const vMult = 1.0 + i * verticalScaleStep;
      const curves = PathFactory.getCurves(
        visibleWidth,
        visibleHeight,
        config,
        isMobile,
        hMult,
        vMult
      );

      for (const curve of [curves.curve1, curves.curve2]) {
        const geo = MaterialManager.createGeometry(curve, config);
        const mesh = new THREE.Mesh(geo, material);

        // Store original positions for ripple reset
        (geo as any).userData.basePosition = (
          geo.attributes.position.array as Float32Array
        ).slice();

        this.meshes.push(mesh);
        this.scene.add(mesh);
      }
    }
  }

  updateMeshes(progress: number, radialSegments: number, ripples: any[], time: number) {
    const step = radialSegments * 6;
    const hasRipples = ripples.length > 0;

    for (const m of this.meshes) {
      const geo = m.geometry as THREE.BufferGeometry;
      const pos = geo.attributes.position;
      const base = geo.userData.basePosition as Float32Array;
      const arr = pos.array as Float32Array;

      if (hasRipples) {
        for (let i = 0; i < arr.length; i += 3) {
          const x = base[i];
          const y = base[i + 1];
          const z = base[i + 2];

          let offset = 0;
          for (const r of ripples) {
            const age = time - r.start;
            if (age > RIPPLE_LIFETIME) continue;

            const dx = x - r.pos.x;
            const dy = y - r.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const wave =
              Math.sin(dist * 3 - age * 5) * Math.exp(-dist * 1.2) * Math.exp(-age * 1.8);

            offset += wave * r.force;
          }

          arr[i] = x;
          arr[i + 1] = y;
          arr[i + 2] = z + offset;
        }
      } else {
        // No ripples — bulk reset is faster than per-vertex loop
        pos.array.set(base);
      }

      pos.needsUpdate = true;

      const total = geo.index!.count;
      geo.setDrawRange(0, Math.floor((progress * total) / step) * step);
    }
  }

  updateLights(time: number, state: any) {
    for (const item of this.lights) {
      if (state.phase === 'BUILD') {
        item.light.intensity = 0;
        continue;
      }

      const t = time * 0.8 + item.phase * 0.5;
      item.light.position.set(Math.sin(t) * 12, Math.sin(t * 2) * 6, 12);
      item.light.lookAt(0, 0, 0);

      if (state.phase === 'FLICKER') {
        const speedUp = state.timer * state.timer * 25;
        const envelope = Math.min(1, state.timer / 1.2);
        item.light.intensity = (Math.sin(speedUp) * 0.8 + 1) * envelope * 250;
      } else {
        item.light.intensity = 80 + Math.sin(time + item.phase) * 60;
      }
    }
  }
}
