import { Vector2D } from "./Vector2D";
import { ICelestialBody } from "./types";

/**
 * Entidad orbital (posición, velocidad, masa, historial de estela)
 * Estructura montada para Fase 1.
 */
export class CelestialBody implements ICelestialBody {
  public id: string;
  public name: string;
  public mass: number;
  public position: Vector2D;
  public velocity: Vector2D;
  public initialRadius: number;
  public trailHistory: Vector2D[];

  constructor(
    id: string,
    name: string,
    mass: number,
    position: Vector2D,
    velocity: Vector2D,
    initialRadius: number
  ) {
    this.id = id;
    this.name = name;
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
    this.initialRadius = initialRadius;
    this.trailHistory = [];
  }

  // Métodos de actualización de trayectoria y rastreo a implementar en Fase 1
}
