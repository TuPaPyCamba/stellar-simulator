/**
 * Tipos específicos del módulo de física
 */

export interface IVector2D {
  x: number;
  y: number;
}

export interface ICelestialBody {
  id: string;
  name: string;
  mass: number;
  position: IVector2D;
  velocity: IVector2D;
  initialRadius: number;
  trailHistory: IVector2D[];
}
