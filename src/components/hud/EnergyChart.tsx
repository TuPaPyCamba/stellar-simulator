"use client";

import styles from "./hud.module.css";

export interface EnergyChartProps {
  className?: string;
}

/**
 * Minigráfica de barras/líneas de energía (Cinética K vs Potencial U vs Total E)
 * (Esqueleto estructural)
 */
export function EnergyChart({ className }: EnergyChartProps) {
  return (
    <div className={`${styles.panel} ${className ?? ""}`.trim()}>
      {/* Contenido estructural a implementar en Fase 4 */}
    </div>
  );
}
