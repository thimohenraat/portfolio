import * as THREE from 'three';

export interface Ripple {
  pos: THREE.Vector2;
  dir: THREE.Vector2;
  start: number;
  force: number;
}

export class PointerRipple {
  private ripples: Ripple[] = [];
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  private lastPos = new THREE.Vector2();
  private lastTime = 0;

  constructor(private camera: THREE.Camera) {}

  addFromEvent(e: PointerEvent | Touch) {
    const x = 'clientX' in e ? e.clientX : 0;
    const y = 'clientY' in e ? e.clientY : 0;
    const now = performance.now() * 0.001;

    this.pointer.x = (x / window.innerWidth) * 2 - 1;
    this.pointer.y = -(y / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hit = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.plane, hit);

    const current = new THREE.Vector2(hit.x, hit.y);

    let force = 0.08;
    let dir = new THREE.Vector2(1, 0);

    if (this.lastTime !== 0) {
      const dt = now - this.lastTime;
      const delta = current.clone().sub(this.lastPos);
      const speed = delta.length() / Math.max(dt, 0.001);

      dir = delta.normalize();

      // zachte premium curve
      force = THREE.MathUtils.clamp(speed * 0.14, 0.02, 0.28);
    }

    this.lastPos.copy(current);
    this.lastTime = now;

    this.ripples.push({
      pos: current,
      dir,
      start: now,
      force,
    });

    if (this.ripples.length > 12) this.ripples.shift();
  }

  getRipples() {
    return this.ripples;
  }

  cleanup(time: number) {
    this.ripples = this.ripples.filter(r => time - r.start < 2.6);
  }
}
