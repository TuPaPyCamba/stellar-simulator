/**
 * Tipos globales y definiciones de dominio para ORB-SYS // HUD
 */

export type StarSpectralClass = "M" | "G" | "O" | "NEUTRON";

export interface StarConfig {
  id: string;
  name: string;
  spectralClass: StarSpectralClass;
  mass: number;
  radius: number;
  color: string;
  description: string;
}

export type SimulationPhase =
  | "STAR_SELECTION"
  | "ORBIT_CONFIGURATION"
  | "SIMULATING"
  | "PAUSED";

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

export interface SimulationParameters {
  starId: string;
  starMass: number;
  bodyName: string;
  bodyMass: number;
  initialRadius: number;
  initialTangentialVelocity: number;
  timeScale: number;
}
