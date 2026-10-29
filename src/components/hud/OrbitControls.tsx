"use client";

import { TheoreticalCalc } from "@/physics/TheoreticalCalc";
import { RenderOptions } from "@/render/types";
import { StarConfig } from "@/types";
import styles from "./hud.module.css";

export interface OrbitControlsProps {
  className?: string;
  star: StarConfig;
  bodyMass: number;
  initialRadius: number;
  initialVelocity: number;
  renderOptions: RenderOptions;
  onStarMassChange: (mass: number) => void;
  onOpenStarSelector: () => void;
  onBodyMassChange: (mass: number) => void;
  onRadiusChange: (radius: number) => void;
  onVelocityChange: (velocity: number) => void;
  onAutoCalibrateCircular: () => void;
  onApplyScenario: (scenario: "CIRCULAR" | "ELLIPTIC_IN" | "ELLIPTIC_OUT" | "ESCAPE") => void;
  onInjectOrbit: () => void;
  onRenderOptionsChange: (options: Partial<RenderOptions>) => void;
}

/**
 * Controles de configuración e inyección de objetos orbitales (Estado 2 de navegación)
 */
export function OrbitControls({
  className,
  star,
  bodyMass,
  initialRadius,
  initialVelocity,
  renderOptions,
  onStarMassChange,
  onOpenStarSelector,
  onBodyMassChange,
  onRadiusChange,
  onVelocityChange,
  onAutoCalibrateCircular,
  onApplyScenario,
  onInjectOrbit,
  onRenderOptionsChange,
}: OrbitControlsProps) {
  const vTeo = TheoreticalCalc.getCircularVelocity(star.mass, initialRadius);
  const vEsc = TheoreticalCalc.getEscapeVelocity(star.mass, initialRadius);

  // Clasificación del régimen orbital según Sección 4.2 del documento de física
  const diffCircular = Math.abs(initialVelocity - vTeo);
  const isCircular = vTeo > 0 && diffCircular / vTeo < 0.015;
  const isEscape = vEsc > 0 && initialVelocity >= vEsc * 0.995;

  let regimeClass = styles.regimeElliptical;
  let regimeTitle = "CASO 2 // ÓRBITA ELÍPTICA (v_t ≠ v_teo)";
  let regimeColor = "var(--color-vector-amber)";
  let regimeDesc =
    initialVelocity < vTeo
      ? "Sub-circular: el cuerpo cae hacia un periastro más cercano acelerando tangencialmente."
      : "Super-circular: el cuerpo asciende hacia un apoastro más lejano frenando su rapidez.";

  if (isCircular) {
    regimeClass = styles.regimeCircular;
    regimeTitle = "CASO 1 // ÓRBITA CIRCULAR PERFECTA (v_t = v_teo)";
    regimeColor = "var(--color-phosphor-cyan)";
    regimeDesc =
      "Equilibrio dinámico exacto (a_g = a_c, a_t = 0). Rapidez y radio permanecen constantes.";
  } else if (isEscape) {
    regimeClass = styles.regimeEscape;
    regimeTitle = "CASO 3 // ESCAPE HIPERBÓLICO (v_t ≥ v_esc)";
    regimeColor = "var(--color-alert-crimson)";
    regimeDesc =
      "La energía cinética supera el pozo gravitatorio (E_total ≥ 0). El objeto escapa del sistema.";
  }

  return (
    <section
      className={`${styles.panel} ${className ?? ""}`.trim()}
      aria-label="Parámetros e Inyección Orbital"
    >
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <span>⚙</span>
          <span>PARÁMETROS E INYECCIÓN ORBITAL</span>
        </div>
        <span className={styles.panelTag}>4 VARIABLES</span>
      </div>

      <div className={styles.panelBody}>
        {/* 1. Estrella Central y su Masa (M) */}
        <div className={styles.controlGroup}>
          <div className={styles.controlHeader}>
            <span className={styles.controlLabel}>
              1. Masa Estelar (<span className={styles.controlSymbol}>M</span>) —{" "}
              <strong style={{ color: star.color }}>{star.name}</strong>
            </span>
            <div className={styles.controlValueGroup}>
              <input
                type="number"
                className={styles.numberInput}
                min={100}
                max={6000}
                step={50}
                value={Math.round(star.mass)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) {
                    onStarMassChange(Math.max(100, Math.min(6000, val)));
                  }
                }}
              />
              <span className={styles.unitText}>UAS</span>
            </div>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={100}
            max={6000}
            step={50}
            value={star.mass}
            onChange={(e) => onStarMassChange(Number(e.target.value))}
          />
          <div className={styles.subHint}>
            <span>Clase {star.spectralClass}</span>
            <button
              type="button"
              onClick={onOpenStarSelector}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-phosphor-cyan)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              [Cambiar Astro en Mapa Estelar]
            </button>
          </div>
        </div>

        {/* 2. Masa del Satélite / Cuerpo Orbital (m) */}
        <div className={styles.controlGroup}>
          <div className={styles.controlHeader}>
            <span className={styles.controlLabel}>
              2. Masa Cuerpo Orbital (<span className={styles.controlSymbol}>m</span>)
            </span>
            <div className={styles.controlValueGroup}>
              <input
                type="number"
                className={styles.numberInput}
                min={1}
                max={500}
                step={1}
                value={bodyMass}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) {
                    onBodyMassChange(Math.max(1, Math.min(500, val)));
                  }
                }}
              />
              <span className={styles.unitText}>UAS</span>
            </div>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1}
            max={500}
            step={1}
            value={bodyMass}
            onChange={(e) => onBodyMassChange(Number(e.target.value))}
          />
          <div className={styles.subHint}>
            <span>Escala F_g, K y U</span>
            <span>No altera v_teo ni T_teo</span>
          </div>
        </div>

        {/* 3. Radio o Distancia Inicial (r_0) */}
        <div className={styles.controlGroup}>
          <div className={styles.controlHeader}>
            <span className={styles.controlLabel}>
              3. Radio Inicial (<span className={styles.controlSymbol}>r₀</span>)
            </span>
            <div className={styles.controlValueGroup}>
              <input
                type="number"
                className={styles.numberInput}
                min={60}
                max={420}
                step={5}
                value={Math.round(initialRadius)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) {
                    onRadiusChange(Math.max(60, Math.min(420, val)));
                  }
                }}
              />
              <span className={styles.unitText}>UAS</span>
            </div>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={60}
            max={420}
            step={5}
            value={initialRadius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
          />
          <div className={styles.subHint}>
            <span>60 UAS (Interior)</span>
            <span>420 UAS (Exterior)</span>
          </div>
        </div>

        {/* 4. Velocidad Tangencial Inicial (v_t) */}
        <div className={styles.controlGroup}>
          <div className={styles.controlHeader}>
            <span className={styles.controlLabel}>
              4. Velocidad Tangencial (<span className={styles.controlSymbol}>v_t</span>)
            </span>
            <div className={styles.controlValueGroup}>
              <input
                type="number"
                className={styles.numberInput}
                min={1}
                max={160}
                step={0.1}
                value={Number(initialVelocity.toFixed(2))}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) {
                    onVelocityChange(Math.max(1, Math.min(160, val)));
                  }
                }}
              />
              <span className={styles.unitText}>UAS/s</span>
            </div>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={5}
            max={140}
            step={0.1}
            value={Math.min(140, initialVelocity)}
            onChange={(e) => onVelocityChange(Number(e.target.value))}
          />
          <div className={styles.subHint}>
            <span>v_teo ideal: {vTeo.toFixed(2)}</span>
            <span>v_esc: {vEsc.toFixed(2)}</span>
          </div>
        </div>

        {/* Botón Auto-Calibrar Velocidad Circular */}
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={onAutoCalibrateCircular}
          title="Asigna v_t = sqrt(G*M/r_0) exactamente para obtener movimiento circular uniforme"
        >
          <span>⌖</span>
          <span>AUTO-CALIBRAR VELOCIDAD CIRCULAR ({vTeo.toFixed(2)})</span>
        </button>

        {/* Diagnóstico del Caso Físico */}
        <div className={`${styles.regimeBox} ${regimeClass}`}>
          <span className={styles.regimeTitle} style={{ color: regimeColor }}>
            {regimeTitle}
          </span>
          <span className={styles.regimeDesc}>{regimeDesc}</span>
        </div>

        {/* Escenarios Preconfigurados */}
        <div className={styles.controlGroup}>
          <span className={styles.compSectionTitle}>[ ESCENARIOS DE DEMOSTRACIÓN ]</span>
          <div className={styles.presetGrid}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onApplyScenario("CIRCULAR")}
            >
              ● Circular (1.00 v_teo)
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onApplyScenario("ELLIPTIC_IN")}
            >
              ◐ Elíptica Caída (0.78 v_teo)
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onApplyScenario("ELLIPTIC_OUT")}
            >
              ◑ Elíptica Alta (1.20 v_teo)
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onApplyScenario("ESCAPE")}
            >
              ↗ Escape Hiperbólico
            </button>
          </div>
        </div>

        {/* Botón Re-inyectar desde t=0 */}
        <button
          type="button"
          className={styles.btnAmber}
          onClick={onInjectOrbit}
        >
          <span>🚀</span>
          <span>RE-INYECTAR SATÉLITE EN (r₀, 0)</span>
        </button>

        {/* Capas de visualización del Canvas */}
        <div className={styles.controlGroup}>
          <span className={styles.compSectionTitle}>[ CAPAS DE MONITOR CRT ]</span>
          <div className={styles.toggleRow}>
            <button
              type="button"
              className={`${styles.toggleChip} ${
                renderOptions.showVectors ? styles.toggleChipActive : ""
              }`}
              onClick={() =>
                onRenderOptionsChange({ showVectors: !renderOptions.showVectors })
              }
            >
              Vectores v_t / F_g
            </button>
            <button
              type="button"
              className={`${styles.toggleChip} ${
                renderOptions.showTrails ? styles.toggleChipActive : ""
              }`}
              onClick={() =>
                onRenderOptionsChange({ showTrails: !renderOptions.showTrails })
              }
            >
              Estela Fósforo
            </button>
            <button
              type="button"
              className={`${styles.toggleChip} ${
                renderOptions.showGrid ? styles.toggleChipActive : ""
              }`}
              onClick={() =>
                onRenderOptionsChange({ showGrid: !renderOptions.showGrid })
              }
            >
              Rejilla HUD
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
