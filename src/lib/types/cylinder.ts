export interface CylinderConfig {
  color: number;
  emissiveIntensity: number;
  shininess: number;
  zOffset: number;
  radius: number;
  radialSegments: number;
  tubeSegments: number;
  margin: number;
  cameraZ: number;
  ovalWidthScale: number;
  lineYOffset: number;
  animationSpeed: number;
  initialCylinderLength: number;
}

export const DEFAULT_CONFIG: CylinderConfig = {
  color: 0x00ff88,
  emissiveIntensity: 0.2,
  shininess: 100,
  zOffset: 0.01,
  radius: 0.25,
  radialSegments: 12,
  tubeSegments: 300,
  margin: 5,
  cameraZ: 12,
  ovalWidthScale: 0.5,
  lineYOffset: 2,
  animationSpeed: 0.4,
  initialCylinderLength: 0.2,
};
