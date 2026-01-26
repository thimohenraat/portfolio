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
  speed: number;
  initialLengthRatio: number;
}

export interface CylinderCameraConfig {
  z: number;
}

export interface BreakpointConfig {
  width: number;
  camera: CylinderCameraConfig;
}

export interface CylinderConfig {
  material: CylinderMaterialConfig;
  geometry: CylinderGeometryConfig;
  animation: CylinderAnimationConfig;
  camera: CylinderCameraConfig;
  breakpoints: {
    mobile: BreakpointConfig;
    tablet: BreakpointConfig;
    desktop: BreakpointConfig;
    ultrawide: BreakpointConfig;
  };
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
    speed: 0.4,
    initialLengthRatio: 0.5,
  },
  camera: {
    z: 12,
  },
  breakpoints: {
    mobile: { width: 375, camera: { z: 10 } },
    tablet: { width: 768, camera: { z: 12 } },
    desktop: { width: 1440, camera: { z: 14 } },
    ultrawide: { width: 1920, camera: { z: 16 } },
  },
};
