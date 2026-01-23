import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class PathFactory {
  static getCurves(visibleWidth: number, config: CylinderConfig) {
    const { ovalWidthScale, lineYOffset, margin } = config.geometry;
    const turnPoint = (visibleWidth * ovalWidthScale) / 2;
    const offScreen = visibleWidth / 2 + margin;

    const curve1 = this.createPath(offScreen, turnPoint, lineYOffset, true);
    const curve2 = this.createPath(-offScreen, -turnPoint, -lineYOffset, false);

    return { curve1, curve2, turnPoint };
  }

  private static createPath(
    start: number,
    turn: number,
    y: number,
    isTop: boolean
  ): THREE.CatmullRomCurve3 {
    const pts = [
      new THREE.Vector3(start, y, 0),
      new THREE.Vector3(turn, y, 0),
      new THREE.Vector3(-turn, y, 0),
    ];

    const segments = 64;
    for (let i = 1; i <= segments; i++) {
      const angle = (isTop ? 0.5 : 1.5) * Math.PI + (i / segments) * Math.PI;
      pts.push(
        new THREE.Vector3(-turn + Math.abs(y) * Math.cos(angle), Math.abs(y) * Math.sin(angle), 0)
      );
    }
    pts.push(new THREE.Vector3(0, -y, 0));
    return new THREE.CatmullRomCurve3(pts);
  }
}
