import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class PathFactory {
  static getCurves(visibleWidth: number, config: CylinderConfig) {
    const { ovalWidthScale, lineYOffset } = config.geometry;
    const turnPoint = (visibleWidth * ovalWidthScale) / 2;

    // De curve begint nu direct op het turnPoint
    const curve1 = this.createPath(turnPoint, lineYOffset, true);
    const curve2 = this.createPath(-turnPoint, -lineYOffset, false);

    return { curve1, curve2, turnPoint };
  }

  private static createPath(turn: number, y: number, isTop: boolean): THREE.CatmullRomCurve3 {
    // We beginnen direct bij het keerpunt (turn)
    const pts = [
      new THREE.Vector3(turn, y, 0),
      new THREE.Vector3(-turn, y, 0), // Lijn tussen de twee bocht-punten
    ];

    const segments = 64;
    for (let i = 1; i <= segments; i++) {
      const angle = (isTop ? 0.5 : 1.5) * Math.PI + (i / segments) * Math.PI;
      pts.push(
        new THREE.Vector3(-turn + Math.abs(y) * Math.cos(angle), Math.abs(y) * Math.sin(angle), 0)
      );
    }

    // Eindpunt in het midden
    pts.push(new THREE.Vector3(0, -y, 0));

    const curve = new THREE.CatmullRomCurve3(pts);
    curve.closed = false;
    return curve;
  }
}
