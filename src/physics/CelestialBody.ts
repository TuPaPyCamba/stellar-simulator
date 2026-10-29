import { Vector2D } from "./Vector2D";
import { ICelestialBody } from "./types";

/**
 * Entidad orbital (posición, velocidad, masa, historial de estela)
 */
export class CelestialBody implements ICelestialBody {
  public id: string;
  public name: string;
  public mass: number;
  public position: Vector2D;
  public velocity: Vector2D;
  public initialRadius: number;
  public trailHistory: Vector2D[];

  // Configuración de estela y rastreo de período orbital (T_sim)
  public maxTrailLength: number;
  public lastCompletedPeriod: number | null = null;
  public completedOrbits: number = 0;

  private previousAngle: number | null = null;
  private sweptAngle: number = 0;
  private currentOrbitTime: number = 0;

  constructor(
    id: string,
    name: string,
    mass: number,
    position: Vector2D,
    velocity: Vector2D,
    initialRadius: number,
    maxTrailLength: number = 300
  ) {
    this.id = id;
    this.name = name;
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;
    this.initialRadius = initialRadius;
    this.trailHistory = [];
    this.maxTrailLength = maxTrailLength;
  }

  /**
   * Registra la posición actual en el historial de la estela (clonando el vector)
   */
  public recordTrailPoint(): void {
    this.trailHistory.push(this.position.clone());
    if (this.trailHistory.length > this.maxTrailLength) {
      this.trailHistory.shift();
    }
  }

  /**
   * Mide el ángulo barrido respecto a la estrella en cada paso dt.
   * Al completar 2*PI radianes, registra el período orbital simulado (T_sim).
   */
  public updateOrbitalPeriodTracker(starPos: Vector2D, dt: number): void {
    const relX = this.position.x - starPos.x;
    const relY = this.position.y - starPos.y;
    const currentAngle = Math.atan2(relY, relX);

    // Primer fotograma: inicializamos el ángulo de referencia
    if (this.previousAngle === null) {
      this.previousAngle = currentAngle;
      return;
    }

    // Diferencia angular corrigiendo el salto de atan2 entre -PI y +PI
    let deltaAngle = currentAngle - this.previousAngle;
    if (deltaAngle > Math.PI) {
      deltaAngle -= 2 * Math.PI;
    } else if (deltaAngle < -Math.PI) {
      deltaAngle += 2 * Math.PI;
    }

    const absDelta = Math.abs(deltaAngle);
    const prevSwept = this.sweptAngle;

    this.sweptAngle += absDelta;
    this.currentOrbitTime += dt;
    this.previousAngle = currentAngle;

    const FULL_ORBIT = 2 * Math.PI;

    // Si cruzamos los 2*PI radianes en este tick, interpolamos el instante exacto
    if (this.sweptAngle >= FULL_ORBIT && absDelta > 0) {
      const remainingAngle = FULL_ORBIT - prevSwept;
      const fractionOfStep = remainingAngle / absDelta;

      this.lastCompletedPeriod = (this.currentOrbitTime - dt) + fractionOfStep * dt;
      this.completedOrbits += 1;

      // Acumulamos el excedente para la siguiente vuelta sin perder fase
      this.sweptAngle -= FULL_ORBIT;
      this.currentOrbitTime = (1 - fractionOfStep) * dt;
    }
  }

  /**
   * Reinicia el historial de estela y los contadores de órbita
   */
  public resetTracking(): void {
    this.trailHistory = [];
    this.lastCompletedPeriod = null;
    this.completedOrbits = 0;
    this.previousAngle = null;
    this.sweptAngle = 0;
    this.currentOrbitTime = 0;
  }
}
