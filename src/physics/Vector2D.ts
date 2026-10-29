import { IVector2D } from "./types";

/**
 * Clase para operaciones vectoriales 2D (Suma, magnitud, producto punto, normalización)
 * Estructura montada para Fase 1.
 *
 * FUENTE: https://natureofcode.com/vectors/
 *
 */
export class Vector2D implements IVector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
  * Métodos estáticos
  */


  /**
   * Convierte cualquier objeto que cumpla IVector2D en una instancia de Vector2D
   */
  public static from(v: IVector2D): Vector2D {
    return new Vector2D(v.x, v.y);
  }

  /**
   * Suma dos vectores: a + b
   */
  public static add(a: IVector2D, b: IVector2D): Vector2D {
    return new Vector2D(a.x + b.x, a.y + b.y);
  }

  /**
   * Resta dos vectores: a - b
   */
  public static sub(a: IVector2D, b: IVector2D): Vector2D {
    return new Vector2D(a.x - b.x, a.y - b.y);
  }

  /**
   * Escala un vector por un escalar: v * scalar
   */
  public static scale(v: IVector2D, scalar: number): Vector2D {
    return new Vector2D(v.x * scalar, v.y * scalar);
  }

  /**
   * Producto punto (escalar) entre dos vectores: a · b
   */
  public static dot(a: IVector2D, b: IVector2D): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Magnitud (longitud) del vector: ||v|| = sqrt(x^2 + y^2)
   */
  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Magnitud al cuadrado: x^2 + y^2
   */
  public magnitudeSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Devuelve un nuevo vector unitario (dirección con magnitud 1)
   */
  public normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) {
      return new Vector2D(0, 0);
    }
    return new Vector2D(this.x / mag, this.y / mag);
  }

  /**
   * Crea una copia independiente del vector
   */
  public clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}
