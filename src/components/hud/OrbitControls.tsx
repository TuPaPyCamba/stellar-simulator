"use client";

import styles from "./hud.module.css";

export interface OrbitControlsProps {
  className?: string;
}

/**
 * Controles de inyección de cuerpos y parámetros orbitales (Estado 2 de navegación)
 * (Esqueleto estructural)
 */
export function OrbitControls({ className }: OrbitControlsProps) {
  return (
    <div className={`${styles.panel} ${className ?? ""}`.trim()}>
      {/* Contenido estructural a implementar en Fase 3 */}
    </div>
  );
}
