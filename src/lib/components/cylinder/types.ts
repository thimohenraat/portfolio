export interface CylinderConfig {
  color: number;
  stretchSpeed: number;
  margin: number;
  cameraZ: number;
}

export const DEFAULT_CONFIG: CylinderConfig = {
  color: 0x00ff88,
  stretchSpeed: 0.4,
  margin: 2,
  cameraZ: 10,
};
