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


/** 
* Agregando detalles que le den más sabor al radar, no son requerimientos para 
* el correcto funcionamiento de la simulación, pero sirven como eventos divertidos adicionales
*/
export type AnomalyType = "COMET" | "UFO" | "LEVIATHAN";

export interface SpaceAnomaly {
  id: string;
  type: AnomalyType;
  label: string;
  glyph: string;
  color: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  trail: { x: number; y: number }[];
  age: number;
  maxAge: number;
}