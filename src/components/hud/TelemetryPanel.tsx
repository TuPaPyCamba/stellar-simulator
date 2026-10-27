"use client";

import styles from "./hud.module.css";

export interface TelemetryPanelProps {
  className?: string;
}

/**
 * Panel de telemetría y comparativa teórica en vivo (Estado 3 y 4)
 * (Esqueleto estructural)
 */
export function TelemetryPanel({ className }: TelemetryPanelProps) {
  return (
    <div className={`${styles.panel} ${className ?? ""}`.trim()}>
      {/* Contenido estructural a implementar en Fase 4 */}
    </div>
  );
}
