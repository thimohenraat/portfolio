import * as THREE from 'three';

export interface Ripple {
  pos: THREE.Vector2;
  start: number;
  force: number;
}

export class PointerRipple {
  private ripples: Ripple[] = [];

  constructor(private camera: THREE.PerspectiveCamera) {}

  addDrop(e: PointerEvent | Touch) {
    const now = performance.now() * 0.001;

    // Haal coördinaten op (werkt voor muis en touch)
    const clientX = 'clientX' in e ? e.clientX : (e as Touch).clientX;
    const clientY = 'clientY' in e ? e.clientY : (e as Touch).clientY;

    // Omzetten naar NDC (Normalized Device Coordinates)
    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;

    // Bereken wereldpositie op het z=0 vlak
    const halfH = Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const worldX = ndcX * halfH * this.camera.aspect;
    const worldY = ndcY * halfH;

    // Voeg een 'druppel' toe met een vaste kracht (force)
    this.ripples.push({
      pos: new THREE.Vector2(worldX, worldY),
      start: now,
      force: 0.12, // De impact van de druppel
    });

    // Beperk het aantal gelijktijdige ripples voor performance
    if (this.ripples.length > 8) this.ripples.shift();
  }

  getRipples(time: number): Ripple[] {
    // Filter ripples die langer dan 2.2 seconden duren
    this.ripples = this.ripples.filter(r => time - r.start < 2.2);
    return this.ripples;
  }
}
