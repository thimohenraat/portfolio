import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class PathFactory {
  static getCurves(
    visibleWidth: number,
    visibleHeight: number,
    config: CylinderConfig,
    isMobile: boolean
  ) {
    const { ovalWidthScale, lineYOffset } = config.geometry;

    if (isMobile) {
      // 90 GRADEN GEDRAAID (VERTICAAL)
      const turnPoint = (visibleHeight * ovalWidthScale) / 2;
      const xOffset = lineYOffset; // De horizontale afstand tussen de twee lijnen

      const curve1 = this.createVerticalPath(turnPoint, xOffset, true);
      const curve2 = this.createVerticalPath(-turnPoint, -xOffset, false);
      return { curve1, curve2, turnPoint };
    } else {
      // STANDAARD (HORIZONTAAL)
      const turnPoint = (visibleWidth * ovalWidthScale) / 2;
      const curve1 = this.createPath(turnPoint, lineYOffset, true);
      const curve2 = this.createPath(-turnPoint, -lineYOffset, false);
      return { curve1, curve2, turnPoint };
    }
  }

  // Originele horizontale methode
  private static createPath(turn: number, y: number, isTop: boolean): THREE.CatmullRomCurve3 {
    const pts = [new THREE.Vector3(turn, y, 0), new THREE.Vector3(-turn, y, 0)];
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

  // Nieuwe verticale methode (90 graden draai)
  private static createVerticalPath(
    turn: number,
    x: number,
    isRight: boolean
  ): THREE.CatmullRomCurve3 {
    const pts = [
      new THREE.Vector3(x, turn, 0), // Start boven/onder
      new THREE.Vector3(x, -turn, 0), // Naar het keerpunt
    ];
    const segments = 64;
    for (let i = 1; i <= segments; i++) {
      // Draai de bocht 90 graden
      const baseAngle = isRight ? 0 : Math.PI;
      const angle = baseAngle + (i / segments) * -Math.PI;
      pts.push(
        new THREE.Vector3(
          Math.abs(x) * Math.cos(angle) + (isRight ? 0 : 0),
          -turn + Math.abs(x) * Math.sin(angle),
          0
        )
      );
    }
    pts.push(new THREE.Vector3(-x, 0, 0)); // Eindig in het midden
    return new THREE.CatmullRomCurve3(pts);
  }
}
