import * as THREE from 'three';

export interface Ripple {
  pos: THREE.Vector2;
  start: number;
  force: number;
}

export class PointerRipple {
  private ripples: Ripple[] = [];
  private lastPos = new THREE.Vector2(Infinity, Infinity);
  private lastTime = 0;

  constructor(private camera: THREE.PerspectiveCamera) {}

  addFromEvent(e: PointerEvent | Touch) {
    const now = performance.now() * 0.001;
    const dt = now - this.lastTime;
    if (dt < 0.016) return; // throttle to ~60 events/sec

    // Direct NDC → world on z=0 plane — no Raycaster/Plane needed
    const ndcX = (('clientX' in e ? e.clientX : 0) / window.innerWidth) * 2 - 1;
    const ndcY = -(('clientY' in e ? e.clientY : 0) / window.innerHeight) * 2 + 1;

    const halfH = Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.position.z;
    const worldX = ndcX * halfH * this.camera.aspect;
    const worldY = ndcY * halfH;

    const dx = worldX - this.lastPos.x;
    const dy = worldY - this.lastPos.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 0.001);

    this.lastPos.set(worldX, worldY);
    this.lastTime = now;

    if (speed < 0.5) return;

    const force = Math.min(speed * 0.05, 0.08);
    this.ripples.push({ pos: new THREE.Vector2(worldX, worldY), start: now, force });
    if (this.ripples.length > 10) this.ripples.shift();
  }

  /** Cleanup + get in one call — no separate cleanup() needed */
  getRipples(time: number): Ripple[] {
    this.ripples = this.ripples.filter(r => time - r.start < 2.2);
    return this.ripples;
  }
}
