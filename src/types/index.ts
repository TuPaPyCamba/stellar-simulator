/**
 * Tipos globales y definiciones de dominio para ORB-SYS // HUD
 * (Estructura base sin implementación de lógica de negocio)
 */

export type StarSpectralClass = 'M' | 'G' | 'O' | 'NEUTRON';

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
  | 'STAR_SELECTION'
  | 'ORBIT_CONFIGURATION'
  | 'SIMULATING'
  | 'PAUSED';

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
}

export interface SimulationParameters {
  starMass: number;
  bodyMass: number;
  initialRadius: number;
  initialTangentialVelocity: number;
  timeScale: number;
}
