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

/**
 * Paquete de telemetría instantánea y comparación teórica para el HUD
 */
export interface TelemetryData {
  distance: number;
  speed: number;
  gravitationalForce: number;
  requiredCentripetalForce: number;
  centripetalAccel: number;
  tangentialAccel: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
  theoreticalSpeed: number;
  theoreticalPeriod: number;
  simulatedPeriod: number | null;
  periodErrorPercent: number | null;
  orbitProgress?: number;
  completedOrbits?: number;
}
