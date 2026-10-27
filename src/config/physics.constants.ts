/**
 * Constantes físicas escaladas para UAS (Unidades Astronómicas de Simulación)
 * Estructura de configuración inicial.
 */

export const SIMULATION_CONSTANTS = {
  // Constante gravitacional escalada para la simulación
  G: 1000,
  // Paso de tiempo físico fijo (dt) independiente de los FPS de renderizado
  FIXED_DT: 1 / 60,
  // Frecuencia de actualización de telemetría (Hz o ticks)
  TELEMETRY_SAMPLE_RATE: 10,
} as const;
