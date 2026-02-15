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

    // Bepaal de as op basis van orientatie
    const baseDimension = isMobile ? visibleHeight : visibleWidth;
    const turnPoint = (baseDimension * ovalWidthScale) / 2;

    // Gebruik een ternaire operator voor de fabriekskeuze
    const create = isMobile
      ? (t: number, off: number, side: boolean) => this.createVerticalPath(t, off, side)
      : (t: number, off: number, side: boolean) => this.createPath(t, off, side);

    return {
      curve1: create(turnPoint, lineYOffset, true),
      curve2: create(-turnPoint, -lineYOffset, false),
      turnPoint,
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
