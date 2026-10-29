import { SIMULATION_CONSTANTS } from "../config/physics.constants";
import { Vector2D } from "./Vector2D";
import { CelestialBody } from "./CelestialBody";
import { TheoreticalCalc } from "./TheoreticalCalc";
import { TelemetryData } from "./types";

export type { TelemetryData } from "./types";

/**
 * Motor Físico del Simulador Orbital
 * Responsable de la integración numérica (Euler Semi-implícito),
 * cálculo de gravitación, energías y telemetría.
 */
export class PhysicsEngine {
  public static readonly G = SIMULATION_CONSTANTS.G;

  /**
   * Actualiza la física de un cuerpo orbital en un paso de tiempo dt (Euler Semi-Implícito, tick)
   */
  public static step(
    starMass: number,
    starPos: Vector2D,
    body: CelestialBody,
    dt: number = SIMULATION_CONSTANTS.FIXED_DT
  ): void {
    // 1. Vector dirección desde el cuerpo hacia la estrella
    const rVec = Vector2D.sub(starPos, body.position);
    const rSq = rVec.magnitudeSq();

    // Evitar división por cero o singularidad extrema si el cuerpo colisiona con el centro
    if (rSq === 0) return;

    const rHat = rVec.normalize(); // Vector unitario radial

    // 2. Magnitud de la Fuerza de Gravitación Universal: F_g = (G * M * m) / r^2
    /**
     * Fuente: es.wikipedia.org/wiki/Ley_de_gravitación_universal
     */
    const forceMag = (this.G * starMass * body.mass) / rSq;
    const forceVec = Vector2D.scale(rHat, forceMag);

    // 3. Aceleración gravitatoria total: a = F_g / m
    const accelVec = Vector2D.scale(forceVec, 1 / body.mass);

    // 4. Integrador Euler Semi-Implícito (Simpléctico):
    /**
     * Fuente: https://www.tutorialesprogramacionya.com/fisicaparaprogramadores/cinematica/tema26.html
     */
    // Primero actualizamos velocidad con la aceleración actual
    body.velocity = Vector2D.add(body.velocity, Vector2D.scale(accelVec, dt));
    // Luego actualizamos posición usando la NUEVA velocidad
    body.position = Vector2D.add(body.position, Vector2D.scale(body.velocity, dt));

    // 5. Registro de estela y ángulo barrido para medir T_sim
    body.recordTrailPoint();
    body.updateOrbitalPeriodTracker(starPos, dt);
  }

  /**
   * Calcula el vector de fuerza gravitatoria actual (para dibujar la flecha de F_g en el Canvas en Fase 2)
   */
  public static getGravitationalForceVector(
    starMass: number,
    starPos: Vector2D,
    body: CelestialBody
  ): Vector2D {
    const rVec = Vector2D.sub(starPos, body.position);
    const rSq = rVec.magnitudeSq();
    if (rSq === 0) return new Vector2D(0, 0);

    const rHat = rVec.normalize();
    const forceMag = (this.G * starMass * body.mass) / rSq;
    return Vector2D.scale(rHat, forceMag);
  }

  /**
   * Calcula todas las variables físicas instantáneas y la comparación teórica para el HUD
   */
  public static computeTelemetry(
    starMass: number,
    starPos: Vector2D,
    body: CelestialBody
  ): TelemetryData {
    const rVec = Vector2D.sub(starPos, body.position);
    const r = rVec.magnitude();
    const v = body.velocity.magnitude();

    // 1. Fuerzas: Gravitatoria real vs Centrípeta requerida
    const gravitationalForce = r > 0 ? (this.G * starMass * body.mass) / (r * r) : 0;
    const requiredCentripetalForce = TheoreticalCalc.getCentripetalForce(body.mass, v, r);

    // 2. Descomposición de aceleración (Tangencial vs Centrípeta/Normal)
    const rHat = rVec.normalize();
    const vHat = body.velocity.normalize();
    const accelMag = r > 0 ? (this.G * starMass) / (r * r) : 0;
    const accelVec = Vector2D.scale(rHat, accelMag);

    // Proyección del vector aceleración sobre el vector unitario de velocidad: a_t = a · v_hat
    const tangentialAccel = Vector2D.dot(accelVec, vHat);
    const centripetalAccel = r > 0 ? (v * v) / r : 0;

    // 3. Energías del Sistema (Cinética K, Potencial U y Mecánica Total E)
    const kineticEnergy = 0.5 * body.mass * (v * v);
    const potentialEnergy = r > 0 ? -(this.G * starMass * body.mass) / r : 0;
    const totalEnergy = kineticEnergy + potentialEnergy;

    // 4. Cálculos Teóricos (usando el radio inicial r0 del cuerpo) y % de Error
    const r0 = body.initialRadius;
    const theoreticalSpeed = TheoreticalCalc.getCircularVelocity(starMass, r0, this.G);
    const theoreticalPeriod = TheoreticalCalc.getKeplerPeriod(starMass, r0, this.G);
    const simulatedPeriod = body.lastCompletedPeriod;
    const periodErrorPercent = TheoreticalCalc.getPercentageError(theoreticalPeriod, simulatedPeriod);

    return {
      distance: r,
      speed: v,
      gravitationalForce,
      requiredCentripetalForce,
      centripetalAccel,
      tangentialAccel,
      kineticEnergy,
      potentialEnergy,
      totalEnergy,
      theoreticalSpeed,
      theoreticalPeriod,
      simulatedPeriod,
      periodErrorPercent,
      orbitProgress: body.getOrbitProgress(),
      completedOrbits: body.completedOrbits,
    };
  }
}
