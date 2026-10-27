"use client";

import styles from "./hud.module.css";

export interface StarSelectorProps {
  className?: string;
}

/**
 * Selector de estrellas del catálogo (Estado 1 de navegación)
 * (Esqueleto estructural)
 */
export function StarSelector({ className }: StarSelectorProps) {
  return (
    <div className={`${styles.panel} ${className ?? ""}`.trim()}>
      {/* Contenido estructural a implementar en Fase 3 */}
    </div>
  );
}
