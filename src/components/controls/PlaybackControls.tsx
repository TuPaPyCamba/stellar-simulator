"use client";

import styles from "../hud/hud.module.css";

export interface PlaybackControlsProps {
  className?: string;
  isPaused: boolean;
  timeScale: number;
  onTogglePause: () => void;
  onStepForward: () => void;
  onTimeScaleChange: (scale: number) => void;
  onResetSimulation: () => void;
  onOpenStarMap: () => void;
}

const TIME_WARP_OPTIONS = [0.5, 1, 2, 5];

/**
 * Controles de reproducción de la simulación (Play/Pause, Step, Time Warp, Reinicio y Mapa Estelar)
 */
export function PlaybackControls({
  className,
  isPaused,
  timeScale,
  onTogglePause,
  onStepForward,
  onTimeScaleChange,
  onResetSimulation,
  onOpenStarMap,
}: PlaybackControlsProps) {
  return (
    <div
      className={`${styles.panel} ${styles.playbackBar} ${className ?? ""}`.trim()}
      role="toolbar"
      aria-label="Controles de Reproducción y Tiempo"
    >
      {/* Play / Pause & Step */}
      <div className={styles.playbackGroup}>
        <button
          type="button"
          className={isPaused ? styles.btnPrimary : styles.btnAmber}
          onClick={onTogglePause}
          style={{ minWidth: "120px" }}
        >
          <span>{isPaused ? "▶" : "⏸"}</span>
          <span>{isPaused ? "REANUDAR" : "PAUSAR"}</span>
        </button>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onStepForward}
          disabled={!isPaused}
          title={
            isPaused
              ? "Avanza exactamente 1 paso físico (dt = 1/60 s)"
              : "Pausa la simulación para usar el avance Paso a Paso"
          }
        >
          ⏭ PASO (+dt)
        </button>
      </div>

      <div className={styles.divider} />

      {/* Multiplicador Time Warp: 0.5x, 1x, 2x, 5x */}
      <div className={styles.playbackGroup}>
        <span className={styles.warpLabel}>TIME WARP:</span>
        {TIME_WARP_OPTIONS.map((scale) => {
          const active = Math.abs(timeScale - scale) < 0.01;
          return (
            <button
              key={scale}
              type="button"
              className={`${styles.btnSecondary} ${
                active ? styles.btnSecondaryActive : ""
              }`.trim()}
              onClick={() => onTimeScaleChange(scale)}
            >
              {scale}x
            </button>
          );
        })}
      </div>

      <div className={styles.divider} />

      {/* Estado 4: Reinicio o Cambio de Sistema */}
      <div className={styles.playbackGroup}>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onResetSimulation}
          title="Limpia la estela y restablece el satélite a t = 0 manteniendo la estrella"
        >
          ↺ REINICIAR (t=0)
        </button>

        <button
          type="button"
          className={styles.btnSecondary}
          onClick={onOpenStarMap}
          title="Regresa al Estado 1: Selección de Estrella en el Mapa Estelar"
        >
          ★ MAPA ESTELAR
        </button>
      </div>
    </div>
  );
}
