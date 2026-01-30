import * as THREE from 'three';
import type { CylinderConfig, BreakpointConfig } from '../../types/cylinder';
import { PathFactory } from './PathFactory';
import { MaterialManager } from './MaterialManager';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

export class CylinderEngine {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private mesh1!: THREE.Mesh;
  private mesh2!: THREE.Mesh;
  private progress = 0;
  private stopRatio = 0;
  private animationId = 0;
  public animationFinished = false;
  private fixedWidth = 0;
  private fixedHeight = 0;
  private lights: { light: THREE.RectAreaLight; phase: number }[] = [];
  private flickerTimer = 0;
  private isFullyActive = false;

  constructor(
    private container: HTMLDivElement,
    private config: CylinderConfig
  ) {
    RectAreaLightUniformsLib.init();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.setRendererSize();
    container.appendChild(this.renderer.domElement);

    this.init();
  }

  private getBreakpoint(): BreakpointConfig {
    const w = window.innerWidth;
    const { breakpoints } = this.config;

    if (w < 650) return breakpoints.mobile;
    if (w < 1240) return breakpoints.tablet;
    return breakpoints.desktop;
  }

  private setRendererSize() {
    const bp = this.getBreakpoint();
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 650;

    if (isMobile) {
      // Mobile: Volledig scherm (responsief)
      this.fixedWidth = w;
      this.fixedHeight = h;
    } else {
      // Desktop: Vaste breedte en vaste hoogte
      this.fixedWidth = bp.width;
      this.fixedHeight = 600; // Vaste hoogte voor desktop
    }

    this.camera.aspect = this.fixedWidth / this.fixedHeight;
    this.camera.position.z = bp.camera.z;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.fixedWidth, this.fixedHeight);

    const canvas = this.renderer.domElement;
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'block',
    });
  }

  private init() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.05)); // Heel weinig omgevingslicht
    this.setupBreathingAreaLights();
    this.build();
  }

  private setupBreathingAreaLights() {
    const lightConfigs = [
      { color: 0xff0000, phase: 0 },
      { color: 0x00ff00, phase: Math.PI * 0.66 },
      { color: 0x0000ff, phase: Math.PI * 1.33 },
    ];

    lightConfigs.forEach(cfg => {
      // Maak de panelen breder en korter (bijv. 12x12) voor een zachte "vlek" licht
      const rectLight = new THREE.RectAreaLight(cfg.color, 400, 120, 120);
      this.scene.add(rectLight);
      this.lights.push({ light: rectLight, phase: cfg.phase });
    });
  }
  private calculateStopRatio(
    curve: THREE.Curve<THREE.Vector3>,
    turnPoint: number,
    isMobile: boolean
  ) {
    const samples = 200;
    let length = 0;
    let stopLength = 0;
    let prev = curve.getPoint(0);

    for (let i = 1; i <= samples; i++) {
      const p = curve.getPoint(i / samples);
      length += p.distanceTo(prev);

      // Op mobiel kijken we naar Y, op desktop naar X
      const val = isMobile ? p.y : p.x;
      const reached = turnPoint > 0 ? val <= turnPoint : val >= turnPoint;

      if (reached && stopLength === 0) stopLength = length;
      prev = p;
    }
    return stopLength / length;
  }

  private build() {
    // Verwijder oude meshes...
    [this.mesh1, this.mesh2].forEach(m => {
      if (m) {
        this.scene.remove(m);
        m.geometry.dispose();
      }
    });

    const w = window.innerWidth;
    const isMobile = w < 650;

    const vFOV = (this.camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFOV / 2) * this.camera.position.z;
    const visibleWidth = visibleHeight * this.camera.aspect;

    const { curve1, curve2, turnPoint } = PathFactory.getCurves(
      visibleWidth,
      visibleHeight,
      this.config,
      isMobile
    );

    const material = MaterialManager.getMaterial(this.config);
    this.mesh1 = new THREE.Mesh(MaterialManager.createGeometry(curve1, this.config), material);
    this.mesh2 = new THREE.Mesh(MaterialManager.createGeometry(curve2, this.config), material);

    this.scene.add(this.mesh1, this.mesh2);

    // STOP: Verwijder de mesh.rotation.z logica hier!

    this.stopRatio = this.calculateStopRatio(curve1, turnPoint, isMobile);
    this.update();
  }

  private update() {
    const head = Math.min(this.progress, 1);
    const tail = 0;

    const step = this.config.geometry.radialSegments * 6;

    [this.mesh1, this.mesh2].forEach(m => {
      if (!m) return;
      const geo = m.geometry as THREE.BufferGeometry;
      const total = geo.index!.count;

      const start = 0;
      const end = Math.floor((head * total) / step) * step;

      geo.setDrawRange(start, Math.max(0, end - start));
    });
  }

  public animate = () => {
    this.clock.start();
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      const dt = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      if (!this.animationFinished) {
        // 1. Bouwfase
        this.progress += dt * this.config.animation.speed;
        this.update();
        if (this.progress >= 1) {
          this.progress = 1;
          this.animationFinished = true;
        }
        // Lichten uit tijdens bouwen
        this.lights.forEach(l => (l.light.intensity = 0));
      } else if (!this.isFullyActive) {
        // 2. Snellere en fellere opstartfase
        this.flickerTimer += dt;

        const t = this.flickerTimer;
        // SpeedUp verhoogd naar 25 voor een snellere 'ratel' in het licht
        const speedUp = t * t * 25;

        // Sinus voor de puls
        const softFlicker = Math.sin(speedUp) * 0.8 + 1;

        // Iets snellere fade-in (1.2 sec totaal)
        const fadeIn = Math.min(1, t / 1.2);

        this.lights.forEach((item, i) => {
          // Positie tijdens opstarten
          const posTime = time * 0.8 + i * Math.PI * 0.5;
          item.light.position.x = Math.sin(posTime) * 8;
          item.light.position.y = Math.sin(posTime * 2) * 4;
          item.light.position.z = 6;
          item.light.lookAt(0, 0, 0);

          // INTENSITEIT:
          // We gaan hier naar een piek van 180 (veel feller dan de normale 100)
          // De ondergrens is 5 voor een dieper contrast zonder zwart te worden
          const peakIntensity = 0 + softFlicker * 175;
          item.light.intensity = peakIntensity * fadeIn;
        });

        // Na 1.2 seconde knallen we door naar de Infinity loop
        if (this.flickerTimer > 1.2) {
          this.isFullyActive = true;
        }
      } else {
        // 3. Normale Infinity & Breathing fase
        this.lights.forEach((item, i) => {
          const speed = 0.8;
          const t = time * speed + i * Math.PI * 0.5;

          item.light.position.x = Math.sin(t) * 8;
          item.light.position.y = Math.sin(t * 2) * 4;
          item.light.position.z = 6;
          item.light.lookAt(0, 0, 0);

          const breathing = Math.sin(time + item.phase);
          item.light.intensity = 55 + breathing * 45; // 10 tot 100
        });
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  };

  public resize() {
    this.setRendererSize();
    this.build();
  }

  public destroy() {
    cancelAnimationFrame(this.animationId);
    [this.mesh1, this.mesh2].forEach(m => {
      if (m) {
        m.geometry.dispose();
        this.scene.remove(m);
      }
    });
    MaterialManager.dispose();
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
