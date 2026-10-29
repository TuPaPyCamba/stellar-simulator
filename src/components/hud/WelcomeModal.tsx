"use client";

import { useState } from "react";
import styles from "./WelcomeModal.module.css";

export interface WelcomeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function WelcomeModal({ isOpen: controlledOpen, onClose }: WelcomeModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleClose = () => {
    if (onClose) onClose();
    if (!isControlled) setInternalOpen(false);
  };

  if (!isOpen) {
    if (isControlled) return null;
    return (
      <button
        type="button"
        className={styles.reopenBtn}
        onClick={() => setInternalOpen(true)}
      >
        <span className={styles.statusIndicator} />
        [ ORB-SYS // PANEL INFO ]
      </button>
    );
  }

  return (
    <div className={styles.overlay} suppressHydrationWarning>
      <div className={styles.window} role="dialog" aria-modal="true">
        {/* Cabecera */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.statusIndicator} />
            <h1 className={styles.title}>ORB-SYS // HUD</h1>
          </div>
          <span className={styles.versionTag}>SYS.VER 1.0.0-FULL</span>
        </div>

        {/* Contenido / Descripción */}
        <div className={styles.body}>
          <p className={styles.leadText}>
            Consola interactiva de simulación y telemetría espacial en 2D.
            Diseñada para experimentar con mecánica gravitatoria orbital, contrastar
            predicciones teóricas (3ra Ley de Kepler) y analizar la conservación
            de la energía mecánica en tiempo real.
          </p>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>[ ESPECIFICACIONES DEL SISTEMA ]</h2>
            <div className={styles.gridSpecs}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Arquitectura Base</span>
                <span className={styles.specValue}>Next.js Estático (App Router)</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Alojamiento</span>
                <span className={styles.specValue}>Cloudflare Pages (out/)</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Lienzo Visual</span>
                <span className={styles.specValue}>HTML5 Canvas 2D (60 FPS)</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>Motor Físico</span>
                <span className={styles.specValue}>Euler Semi-Implícito (UAS)</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>[ GUÍA RÁPIDA DE OPERACIÓN ]</h2>
            <p style={{ color: "var(--color-text-dim)", fontSize: "0.78rem", lineHeight: 1.5 }}>
              1. Usa <strong>★ MAPA ESTELAR</strong> para elegir la estrella central (Clase M, G, O o Neutrones).
              <br />
              2. Modifica masa (<strong>M, m</strong>), radio inicial (<strong>r₀</strong>) y velocidad tangencial (<strong>v_t</strong>) en el panel izquierdo, o pulsa <strong>Auto-Calibrar Velocidad Circular</strong>.
              <br />
              3. Observa en el panel derecho la comparativa en vivo frente a la <strong>3ra Ley de Kepler</strong> y el osciloscopio de <strong>Conservación de la Energía</strong>.
            </p>
          </div>
        </div>

        {/* Pie de ventana */}
        <div className={styles.footer}>
          <div className={styles.footerStatus}>
            <span>Estado:</span>
            <span className={styles.nextPhaseTag}>Fases 1–4 Operativas (100%)</span>
          </div>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={handleClose}
          >
            VOLVER AL SIMULADOR [X]
          </button>
        </div>
      </div>
    </div>
  );
}
