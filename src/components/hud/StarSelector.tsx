"use client";

import { STAR_PRESETS } from "@/config/StarPresets";
import { TheoreticalCalc } from "@/physics/TheoreticalCalc";
import { StarConfig } from "@/types";
import styles from "./hud.module.css";

export interface StarSelectorProps {
  className?: string;
  isOpen?: boolean;
  selectedStar: StarConfig;
  onSelectStar: (star: StarConfig) => void;
  onConfirmAndStart?: (star: StarConfig) => void;
  onClose?: () => void;
}

/**
 * Selector de estrellas del catálogo (Estado 1 de navegación: Mapa Estelar)
 */
export function StarSelector({
  className,
  isOpen = true,
  selectedStar,
  onSelectStar,
  onConfirmAndStart,
  onClose,
}: StarSelectorProps) {
  if (!isOpen) return null;

  const stars = Object.values(STAR_PRESETS);

  return (
    <div
      className={`${styles.starModalOverlay} ${className ?? ""}`.trim()}
      suppressHydrationWarning
    >
      <div className={styles.starModalWindow} role="dialog" aria-modal="true">
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>
            <span>★</span>
            <span>ESTADO 1 // MAPA ESTELAR — SELECCIÓN DE ESTRELLA CENTRAL</span>
          </div>
          <span className={styles.panelTag}>CATÁLOGO ESPECTRAL</span>
        </div>

        <div className={styles.panelBody} style={{ padding: "1.1rem 1.25rem", gap: "1rem" }}>
          <p style={{ fontSize: "0.78rem", color: "rgba(230, 255, 255, 0.82)", lineHeight: 1.45 }}>
            Selecciona el astro central del sistema gravitatorio. Al fijar una estrella, su masa (
            <strong style={{ color: "var(--color-phosphor-cyan)" }}>M</strong>), radio visual y
            pozo gravitatorio definirán la velocidad orbital circular ideal y el período de Kepler.
          </p>

          <div className={styles.starGrid}>
            {stars.map((preset) => {
              const isSelected = selectedStar.id === preset.id;
              const visualDiameter = Math.max(14, Math.min(44, preset.radius * 1.6));
              const refV = TheoreticalCalc.getCircularVelocity(preset.mass, 180).toFixed(1);

              return (
                <div
                  key={preset.id}
                  className={`${styles.starCard} ${
                    isSelected ? styles.starCardSelected : ""
                  }`.trim()}
                  onClick={() => onSelectStar({ ...preset })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectStar({ ...preset });
                    }
                  }}
                >
                  <div className={styles.starPreviewWrap}>
                    <div
                      className={styles.starSphere}
                      style={{
                        width: `${visualDiameter}px`,
                        height: `${visualDiameter}px`,
                        backgroundColor: "#ffffff",
                        boxShadow: `0 0 ${visualDiameter * 0.6}px 4px ${preset.color}, 0 0 ${
                          visualDiameter * 1.3
                        }px 8px ${preset.color}`,
                      }}
                    />
                  </div>

                  <div className={styles.starName}>{preset.name}</div>
                  <div className={styles.starClassBadge}>
                    CLASE {preset.spectralClass}
                  </div>
                  <p className={styles.starDesc}>{preset.description}</p>

                  <div className={styles.starStats}>
                    <span>M: {preset.mass} UAS</span>
                    <span>v₀(180): {refV}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "0.5rem",
              borderTop: "1px solid rgba(0, 255, 204, 0.2)",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "0.74rem", color: "var(--color-text-dim)" }}>
              Astro seleccionado:{" "}
              <strong style={{ color: selectedStar.color }}>
                {selectedStar.name} (Clase {selectedStar.spectralClass})
              </strong>{" "}
              — M = {selectedStar.mass} UAS
            </div>

            <div style={{ display: "flex", gap: "0.6rem" }}>
              {onClose && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={onClose}
                >
                  CANCELAR [ESC]
                </button>
              )}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => {
                  if (onConfirmAndStart) {
                    onConfirmAndStart(selectedStar);
                  } else if (onClose) {
                    onClose();
                  }
                }}
              >
                [ ⌖ FIJAR ESTRELLA E INYECTAR SISTEMA ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
