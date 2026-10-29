"use client";

import { useState } from "react";
import styles from "./WelcomeModal.module.css";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        type="button"
        className={styles.reopenBtn}
        onClick={() => setIsOpen(true)}
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
          <span className={styles.versionTag}>SYS.VER 0.1.0-INIT</span>
        </div>

        {/* Contenido / Descripción */}
        <div className={styles.body}>
          <p className={styles.leadText}>
            Consola interactiva de simulación y telemetría espacial en 2D.
            Diseñada para experimentar con mecánica gravitatoria orbital, contrastar
            predicciones teóricas (3ra Ley de Kepler) y analizar la conservación
            de la energía mecánica.
          </p>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>[ ESTADO DEL SISTEMA ]</h2>
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
            <h2 className={styles.sectionTitle}>[ ESQUEMA DE CARPETAS MONTADO ]</h2>
            <p style={{ color: "var(--color-text-dim)", fontSize: "0.8rem" }}>
              src/physics (motor desacoplado) · src/render (Canvas 2D) · src/components/hud (paneles React) · docs (especificaciones y PDFs).
            </p>
          </div>
        </div>

        {/* Pie de ventana */}
        <div className={styles.footer}>
          <div className={styles.footerStatus}>
            <span>Próximo hito:</span>
            <span className={styles.nextPhaseTag}>Fase 3 (HUD y Navegación)</span>
          </div>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setIsOpen(false)}
          >
            MINIMIZAR [X]
          </button>
        </div>
      </div>
    </div>
  );
}
