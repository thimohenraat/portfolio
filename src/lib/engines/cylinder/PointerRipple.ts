// PointerRipple.ts
import * as THREE from 'three';

export interface Ripple {
  pos: THREE.Vector2;
  start: number; // tijd in seconden (synchronised met THREE.Clock)
  force: number;
}

export const RIPPLE_LIFETIME = 2.2; // gedeeld met CylinderScene
const MAX_RIPPLES = 8;
const RIPPLE_FORCE = 0.12;

export class PointerRipple {
  private ripples: Ripple[] = [];

  // Herbruikbare vectoren om allocaties te minimaliseren
  private readonly _ndcVec = new THREE.Vector3();
  private readonly _dir = new THREE.Vector3();
  private readonly _worldPos = new THREE.Vector3();

  constructor(private camera: THREE.PerspectiveCamera) {}

  /**
   * Voegt een rimpel toe op de schermpositie van een pointer/touch event.
   * @param e Pointer- of Touch-object met clientX/clientY
   * @param time Huidige tijd in seconden (synchronised met THREE.Clock)
   */
  addDrop(e: PointerEvent | Touch, time: number): void {
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Normalized Device Coordinates (NDC)
    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;

    // Straal van camera door NDC op een diepte van 0.5
    this._ndcVec.set(ndcX, ndcY, 0.5).unproject(this.camera);
    this._dir.copy(this._ndcVec).sub(this.camera.position).normalize();

    // Afstand tot vlak z=0 (camera staat op positieve z)
    const dist = -this.camera.position.z / this._dir.z;

    // Wereldpositie op z=0: cameraPos + t * richting
    this._worldPos.copy(this.camera.position).addScaledVector(this._dir, dist);

    if (this.ripples.length >= MAX_RIPPLES) {
      // Vervang de oudste rimpel (index 0) en roteer array zodat volgende evictie weer index 0 is
      this.ripples[0] = {
        pos: new THREE.Vector2(this._worldPos.x, this._worldPos.y),
        start: time,
        force: RIPPLE_FORCE,
      };
      this.ripples.push(this.ripples.shift()!);
    } else {
      this.ripples.push({
        pos: new THREE.Vector2(this._worldPos.x, this._worldPos.y),
        start: time,
        force: RIPPLE_FORCE,
      });
    }
  }

  /**
   * Geeft alle rimpels die nog niet vervallen zijn.
   * @param time Huidige tijd in seconden (uit de animation loop)
   */
  getRipples(time: number): Ripple[] {
    // Alleen actieve rimpels bijhouden (filter is voldoende want array is klein)
    this.ripples = this.ripples.filter(r => time - r.start < RIPPLE_LIFETIME);
    return this.ripples;
  }
}
