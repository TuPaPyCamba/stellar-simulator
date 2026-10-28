/**
 * Fórmulas analíticas cerradas (Kepler, velocidad orbital circular ideal,
 * cálculo de error y desviación teórica vs. simulación)
 */

 import { SIMULATION_CONSTANTS } from '../config/physics.constants';

export class TheoreticalCalc {
  /**
   * Velocidad circular teórica ideal: v_teo = sqrt((G * M) / r0)
   * Fuente: Serway, R. A., & Jewett, J. W. (2018). Física para ciencias e ingeniería (Vol. 1, 10.ª ed., Cap. 13: "Gravitación universal", 
   * Sección 13.4). Cengage Learning.
   */
  public static getCircularVelocity(
    starMass: number,
    initialRadius: number,
    gravityConst: number = SIMULATION_CONSTANTS.G
  ): number {
    if (initialRadius <= 0 || starMass <= 0) return 0;
    return Math.sqrt((gravityConst * starMass) / initialRadius);
  }

  /**
   * Velocidad de escape hiperbólico: v_esc = sqrt((2 * G * M) / r)
   * Fuente: Serway, R. A., & Jewett, J. W. (2018). Física para ciencias e ingeniería (Vol. 1, 10.ª ed., Cap. 13: "Gravitación universal", 
   * Sección 13.6: "Consideraciones energéticas en el movimiento planetario y de satélites"). Cengage Learning.
   */
  public static getEscapeVelocity(
    starMass: number,
    radius: number,
    gravityConst: number = SIMULATION_CONSTANTS.G
  ): number {
    if (radius <= 0 || starMass <= 0) return 0;
    return Math.sqrt((2 * gravityConst * starMass) / radius);
  }

  /**
   * Período orbital teórico (3ra Ley de Kepler): T_teo = 2 * pi * sqrt(r0^3 / (G * M))
   * Fuente: Serway, R. A., & Jewett, J. W. (2018). Física para ciencias e ingeniería (Vol. 1, 10.ª ed., Cap. 13, 
   * Sección 13.4: "Las leyes de Kepler y el movimiento de los planetas"). Cengage Learning.
   */
  public static getKeplerPeriod(
    starMass: number,
    initialRadius: number,
    gravityConst: number = SIMULATION_CONSTANTS.G
  ): number {
    if (initialRadius <= 0 || starMass <= 0) return 0;
    return 2 * Math.PI * Math.sqrt(Math.pow(initialRadius, 3) / (gravityConst * starMass));
  }

  /**
   * Fuerza centrípeta teórica/requerida: F_c = (m * v_t^2) / r
   * Fuente: Serway, R. A., & Jewett, J. W. (2018). Física para ciencias e ingeniería (Vol. 1, 10.ª ed., Cap. 6: 
   * "Movimiento circular y otras aplicaciones de las leyes de Newton", Sección 6.1). Cengage Learning.
   */
  public static getCentripetalForce(bodyMass: number, speed: number, radius: number): number {
    if (radius <= 0) return 0;
    return (bodyMass * speed * speed) / radius;
  }

  /**
   * Desviación / Error porcentual entre valor teórico y valor simulado:
   * %Error = (|Valor_teo - Valor_sim| / Valor_teo) * 100
   * Fuente: https://www.disfrutalasmatematicas.com/numeros/porcentaje-error.html
   */
  public static getPercentageError(theoretical: number, simulated: number | null): number | null {
    if (simulated === null || theoretical === 0) return null;
    return (Math.abs(theoretical - simulated) / Math.abs(theoretical)) * 100;
  }
}
