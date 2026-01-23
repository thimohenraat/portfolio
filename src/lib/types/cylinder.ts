export interface CylinderMaterialConfig {
  color: number;
  emissiveIntensity: number;
  shininess: number;
}

export interface CylinderGeometryConfig {
  radius: number;
  radialSegments: number;
  tubeSegments: number;
  ovalWidthScale: number;
  lineYOffset: number;
  margin: number;
}

export interface CylinderAnimationConfig {
  speed: number; // progress per second
  initialLengthRatio: number; // 0–1 of curve
}

export interface CylinderCameraConfig {
  z: number;
}

export interface CylinderConfig {
  material: CylinderMaterialConfig;
  geometry: CylinderGeometryConfig;
  animation: CylinderAnimationConfig;
  camera: CylinderCameraConfig;
}

export const DEFAULT_CONFIG: CylinderConfig = {
  material: {
    color: 0x1e90ff,
    emissiveIntensity: 0.2,
    shininess: 100,
  },
  geometry: {
    radius: 0.25,
    radialSegments: 12,
    tubeSegments: 300,
    ovalWidthScale: 0.5,
    lineYOffset: 2,
    margin: 5,
  },
  animation: {
    speed: 0.4, // per seconde
    initialLengthRatio: 0.2, // 20% zichtbaar
  },
  camera: {
    z: 12,
  },
};
