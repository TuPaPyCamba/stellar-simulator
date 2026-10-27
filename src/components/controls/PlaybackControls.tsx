"use client";

import styles from "../hud/hud.module.css";

export interface PlaybackControlsProps {
  className?: string;
}

/**
 * Controles de reproducción de la simulación (Play/Pause, Step, Time Warp, Reset)
 * (Esqueleto estructural)
 */
export function PlaybackControls({ className }: PlaybackControlsProps) {
  return (
    <div className={`${styles.panel} ${className ?? ""}`.trim()}>
      {/* Controles estructurales a implementar en Fase 3 */}
    </div>
  );
}
