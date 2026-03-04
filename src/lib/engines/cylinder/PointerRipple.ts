import * as THREE from 'three';

export interface Ripple {
  pos: THREE.Vector2;
  start: number;
  force: number;
}

const MAX_RIPPLES = 8;
const RIPPLE_LIFETIME = 2.2;
const RIPPLE_FORCE = 0.12;

export class PointerRipple {
  private ripples: Ripple[] = [];

  // Reusable vector to avoid allocations during world-space conversion
  private readonly _ndcVec = new THREE.Vector3();

  constructor(private camera: THREE.PerspectiveCamera) {}

  /**
   * Adds a ripple drop at the screen position of a pointer or touch event.
   * World-space conversion is done via an unproject, which respects camera transforms.
   */
  addDrop(e: PointerEvent | Touch): void {
    const clientX = e.clientX;
    const clientY = e.clientY;

    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;

    // Unproject NDC at z=0 plane using the actual camera matrix
    // This is more robust than manual FOV math if the camera ever changes
    this._ndcVec.set(ndcX, ndcY, 0.5).unproject(this.camera);
    const dir = this._ndcVec.sub(this.camera.position).normalize();
    const dist = -this.camera.position.z / dir.z;
    const worldPos = this.camera.position.clone().addScaledVector(dir, dist);

    const now = performance.now() * 0.001;

    if (this.ripples.length >= MAX_RIPPLES) {
      // Reuse the oldest slot instead of shifting (avoids array reallocation)
      this.ripples[0] = {
        pos: new THREE.Vector2(worldPos.x, worldPos.y),
        start: now,
        force: RIPPLE_FORCE,
      };
      // Rotate the array so the next eviction hits index 0 again
      this.ripples.push(this.ripples.shift()!);
    } else {
      this.ripples.push({
        pos: new THREE.Vector2(worldPos.x, worldPos.y),
        start: now,
        force: RIPPLE_FORCE,
      });
    }
  }

  /**
   * Returns only ripples still within their lifetime.
   * Cleanup is deferred: we filter lazily rather than on every add.
   */
  getRipples(time: number): Ripple[] {
    // Only rebuild the array when there's actually something to remove
    const before = this.ripples.length;
    this.ripples = this.ripples.filter(r => time - r.start < RIPPLE_LIFETIME);

    // Surface the filtered list; CylinderScene will pre-filter again per frame
    // which is fine — it's a tiny array (≤8 entries)
    return this.ripples;
  }
}
