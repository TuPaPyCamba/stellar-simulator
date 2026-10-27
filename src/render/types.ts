/**
 * Tipos para el renderizador 2D en Canvas
 */

export interface RenderViewport {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  zoom: number;
}

export interface RenderOptions {
  showVectors: boolean;
  showGrid: boolean;
  showTrails: boolean;
  phosphorPersistenceAlpha: number;
}
