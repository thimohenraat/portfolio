import * as THREE from 'three';
import type { CylinderConfig } from '../../types/cylinder';

export class PathFactory {
  static getCurves(
    visibleWidth: number,
    visibleHeight: number,
    config: CylinderConfig,
    isMobile: boolean,
    hMult: number = 1, // Horizontale groei
    vMult: number = 1 // Verticale groei
  ) {
    const { ovalWidthScale, lineYOffset } = config.geometry;

    // Gebruik een veiligheidsmarge (0.9) zodat de ringen niet de rand raken
    // En deel door de MAXIMALE multiplier die je verwacht (bijv. 1.5)
    // zodat de grootste ring precies binnen de padding past.
    const maxExpectedScale = 1.5;
    const safeAreaW = (visibleWidth * 0.9) / maxExpectedScale;
    const safeAreaH = (visibleHeight * 0.9) / maxExpectedScale;

    const baseDimension = isMobile ? safeAreaH : safeAreaW;

    // Turnpoint (breedte) gebruikt hMult, Offset (hoogte) gebruikt vMult
    const turnPoint = ((baseDimension * ovalWidthScale) / 2) * hMult;
    const currentOffset = lineYOffset * vMult;

    const create = isMobile
      ? (t: number, off: number, side: boolean) => this.createVerticalPath(t, off, side)
      : (t: number, off: number, side: boolean) => this.createPath(t, off, side);

    return {
      curve1: create(turnPoint, currentOffset, true),
      curve2: create(-turnPoint, -currentOffset, false),
    };
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
