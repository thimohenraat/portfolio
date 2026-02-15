import * as THREE from 'three';
import { PathFactory } from './PathFactory';
import { MaterialManager } from './MaterialManager';
import type { CylinderConfig } from '../../types/cylinder';

export class CylinderScene {
  public mesh1!: THREE.Mesh;
  public mesh2!: THREE.Mesh;
  public lights: { light: THREE.RectAreaLight; phase: number }[] = [];

  constructor(private scene: THREE.Scene) {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.05));
    this.setupLights();
  }

  private setupLights() {
    const lightConfigs = [
      { color: 0xff0000, phase: 0 },
      { color: 0x00ff00, phase: Math.PI * 0.66 },
      { color: 0x0000ff, phase: Math.PI * 1.33 },
    ];

    lightConfigs.forEach(cfg => {
      const rectLight = new THREE.RectAreaLight(cfg.color, 0, 120, 120);
      this.scene.add(rectLight);
      this.lights.push({ light: rectLight, phase: cfg.phase });
    });
  }

  build(visibleWidth: number, visibleHeight: number, config: CylinderConfig, isMobile: boolean) {
    // Cleanup oude meshes
    [this.mesh1, this.mesh2].forEach(m => {
      if (m) {
        m.geometry.dispose();
        this.scene.remove(m);
      }
    });

    const { curve1, curve2 } = PathFactory.getCurves(visibleWidth, visibleHeight, config, isMobile);
    const material = MaterialManager.getMaterial(config);

    this.mesh1 = new THREE.Mesh(MaterialManager.createGeometry(curve1, config), material);
    this.mesh2 = new THREE.Mesh(MaterialManager.createGeometry(curve2, config), material);

    this.scene.add(this.mesh1, this.mesh2);
  }

  updateMeshes(progress: number, radialSegments: number) {
    const step = radialSegments * 6;
    [this.mesh1, this.mesh2].forEach(m => {
      if (!m) return;
      const geo = m.geometry as THREE.BufferGeometry;
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
      item.light.position.set(Math.sin(t) * 8, Math.sin(t * 2) * 4, 6);
      item.light.lookAt(0, 0, 0);

      if (state.phase === 'FLICKER') {
        const speedUp = state.timer * state.timer * 25;
        const flicker = (Math.sin(speedUp) * 0.8 + 1) * Math.min(1, state.timer / 1.2);
        item.light.intensity = flicker * 175;
      } else {
        const breathing = Math.sin(time + item.phase);
        item.light.intensity = 55 + breathing * 45;
      }
    });
  }
}
