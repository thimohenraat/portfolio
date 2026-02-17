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
  horizontalScaleStep: number; // Nieuw
  verticalScaleStep: number; // Nieuw
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
    max: BreakpointConfig;
  };
}

export const DEFAULT_CONFIG: CylinderConfig = {
  material: {
    color: 0x1e90ff,
    emissiveIntensity: 0.2,
    shininess: 100,
  },
  geometry: {
    radius: 0.006,
    radialSegments: 12,
    tubeSegments: 300,
    ovalWidthScale: 0.5,
    lineYOffset: 2,
    margin: 5,
    horizontalScaleStep: 0.05, // Hoe snel horizontaal groeien
    verticalScaleStep: 0.5,
  },
  animation: {
    speed: 1,
    initialLengthRatio: 0.5,
  },
  camera: {
    z: 20,
  },
  breakpoints: {
    mobile: { width: 400, camera: { z: 30 } }, // Verhoogd
    tablet: { width: 768, camera: { z: 25 } }, // Verhoogd
    desktop: {
      width: 1000,
      camera: { z: 20 },
    },
    ultrawide: {
      width: 1150,
      camera: { z: 22 },
    },
    max: {
      width: 1150,
      camera: { z: 22 },
    },
  },
};
