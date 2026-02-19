import * as THREE from 'three';

export interface Ripple {
  pos: THREE.Vector2;
  dir: THREE.Vector2;
  start: number;
  force: number;
}

export class PointerRipple {
  private ripples: Ripple[] = [];
  private plane = new THREE.Plane();
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

    // plane altijd voor camera gericht naar cylinder center
    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    this.plane.setFromNormalAndCoplanarPoint(camDir, new THREE.Vector3(0, 0, 0));

    const hit = new THREE.Vector3();
    const ok = this.raycaster.ray.intersectPlane(this.plane, hit);
    if (!ok) return;

    const current = new THREE.Vector2(hit.x, hit.y);

    if (this.lastTime === 0) {
      this.lastPos.copy(current);
      this.lastTime = now;
      return;
    }

    const dt = now - this.lastTime;
    const delta = current.clone().sub(this.lastPos);
    const speed = delta.length() / Math.max(dt, 0.001);

    this.lastPos.copy(current);
    this.lastTime = now;

    if (speed < 0.01) return;

    const dir = delta.normalize();
    const force = THREE.MathUtils.clamp(speed * 0.05, 0.01, 0.08);

    this.ripples.push({
      pos: current,
      dir,
      start: now,
      force,
    });

    if (this.ripples.length > 10) this.ripples.shift();
  }

  getRipples() {
    return this.ripples;
  }

  cleanup(time: number) {
    this.ripples = this.ripples.filter(r => time - r.start < 2.2);
  }
}
