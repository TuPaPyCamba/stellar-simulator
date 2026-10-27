import { IVector2D } from "./types";

/**
 * Clase para operaciones vectoriales 2D (Suma, magnitud, producto punto, normalización)
 * Estructura montada para Fase 1.
 */
export class Vector2D implements IVector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  // Métodos estáticos e instancias a implementar en Fase 1
}
