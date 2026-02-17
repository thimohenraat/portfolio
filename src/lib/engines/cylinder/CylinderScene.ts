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
      { color: 0x8b0000, phase: 0 }, // Dark Red (Deep Crimson)
      { color: 0x006400, phase: Math.PI * 0.66 }, // Dark Green (Deep Emerald)
      { color: 0x00008b, phase: Math.PI * 1.33 }, // Dark Blue (Deep Navy)
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
        visibleWidth, // Gewoon de basis breedte
        visibleHeight, // Gewoon de basis hoogte
        config,
        isMobile,
        horizontalMultiplier, // Voor de turnPoint
        verticalMultiplier // Voor de offset (hoogte)
      );

      const meshes = [
        MaterialManager.createGeometry(curves.curve1, config),
        MaterialManager.createGeometry(curves.curve2, config),
      ].map(geo => new THREE.Mesh(geo, material));

      meshes.forEach(m => {
        this.meshes.push(m);
        this.scene.add(m);
      });
    }
  }

  updateMeshes(progress: number, radialSegments: number) {
    const step = radialSegments * 6;
    this.meshes.forEach(m => {
      const geo = m.geometry as THREE.BufferGeometry;
      const total = geo.index!.count;
      // Je kunt hier progress eventueel variëren per index voor een "waterval" effect
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

      // Zorg dat de lamp altijd naar het midden van de ringen kijkt
      item.light.lookAt(0, 0, 0);

      if (state.phase === 'FLICKER') {
        const speedUp = state.timer * state.timer * 25;
        const flicker = (Math.sin(speedUp) * 0.8 + 1) * Math.min(1, state.timer / 1.2);
        item.light.intensity = flicker * 250; // Iets feller voor meer bereik
      } else {
        const breathing = Math.sin(time + item.phase);
        // Meer basisintensiteit om alle 10 ringen te bereiken
        item.light.intensity = 80 + breathing * 60;
      }
    });
  }
}
