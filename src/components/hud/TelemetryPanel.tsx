"use client";

import { SIMULATION_CONSTANTS } from "@/config/physics.constants";
import { TheoreticalCalc } from "@/physics/TheoreticalCalc";
import { TelemetryData } from "@/physics/types";
import styles from "./hud.module.css";

export interface TelemetryPanelProps {
  className?: string;
  telemetry: TelemetryData | null;
  starMass: number;
  bodyMass: number;
  initialRadius: number;
}

/**
 * Panel de telemetría en vivo y comparativa teórica vs. simulador (Fase 4)
 */
export function TelemetryPanel({
  className,
  telemetry,
  starMass,
  bodyMass,
  initialRadius,
}: TelemetryPanelProps) {
  const G = SIMULATION_CONSTANTS.G;

  // Valores de respaldo si aún no llega el primer pulso
  const r = telemetry?.distance ?? initialRadius;
  const v = telemetry?.speed ?? TheoreticalCalc.getCircularVelocity(starMass, initialRadius, G);
  const fg =
    telemetry?.gravitationalForce ??
    (initialRadius > 0 ? (G * starMass * bodyMass) / (initialRadius * initialRadius) : 0);
  const fc =
    telemetry?.requiredCentripetalForce ??
    TheoreticalCalc.getCentripetalForce(bodyMass, v, r);
  const ac = telemetry?.centripetalAccel ?? (r > 0 ? (v * v) / r : 0);
  const at = telemetry?.tangentialAccel ?? 0;

  // Cálculos teóricos de referencia en r0
  const vTeo =
    telemetry?.theoreticalSpeed ??
    TheoreticalCalc.getCircularVelocity(starMass, initialRadius, G);
  const tTeo =
    telemetry?.theoreticalPeriod ??
    TheoreticalCalc.getKeplerPeriod(starMass, initialRadius, G);
  const fTeo =
    initialRadius > 0 ? (G * starMass * bodyMass) / (initialRadius * initialRadius) : 0;

  const vErr = TheoreticalCalc.getPercentageError(vTeo, v) ?? 0;
  const fErr = TheoreticalCalc.getPercentageError(fTeo, fg) ?? 0;
  const tSim = telemetry?.simulatedPeriod ?? null;
  const tErr = telemetry?.periodErrorPercent ?? null;

  const orbitProgress = telemetry?.orbitProgress ?? 0;
  const completedOrbits = telemetry?.completedOrbits ?? 0;

  return (
    <section
      className={`${styles.panel} ${className ?? ""}`.trim()}
      aria-label="Telemetría en Vivo y Validación Teórica"
    >
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <span>📡</span>
          <span>TELEMETRÍA Y VALIDACIÓN DE KEPLER</span>
        </div>
        <span className={styles.panelTag}>EN VIVO 10 Hz</span>
      </div>

      <div className={styles.panelBody}>
        {/* 1. Lecturas Instantáneas de Vectores y Dinámica */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricName}>Distancia Radial (r)</span>
            <span className={styles.metricNumber}>{r.toFixed(2)} UAS</span>
            <span className={styles.metricSub}>≈ {(r / 180).toFixed(2)} UA equiv.</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricName}>Rapidez Orbital (v)</span>
            <span className={styles.metricNumber}>{v.toFixed(2)} UAS/s</span>
            <span className={styles.metricSub}>v₀ ref: {vTeo.toFixed(2)} UAS/s</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricName}>Fuerza Gravitatoria (F_g)</span>
            <span className={`${styles.metricNumber} ${styles.metricNumberAmber}`}>
              {fg.toFixed(1)} uN
            </span>
            <span className={styles.metricSub}>F_c req: {fc.toFixed(1)} uN</span>
          </div>

          <div className={styles.metricCard}>
            <span className={styles.metricName}>Aceleración (a_c | a_t)</span>
            <span className={styles.metricNumber}>
              {ac.toFixed(2)} | {at >= 0 ? `+${at.toFixed(2)}` : at.toFixed(2)}
            </span>
            <span className={styles.metricSub}>Centrípeta vs. Tangencial</span>
          </div>
        </div>

        {/* 2. Progreso de Barrido Angular (2π rad) */}
        <div className={styles.orbitProgressWrap}>
          <div className={styles.orbitProgressHeader}>
            <span>BARRIDO ANGULAR (2π rad): {(orbitProgress * 360).toFixed(0)}°</span>
            <span style={{ color: "var(--color-phosphor-cyan)", fontWeight: 700 }}>
              ÓRBITAS COMPLETADAS: {completedOrbits}
            </span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${Math.min(100, Math.max(0, orbitProgress * 100))}%` }}
            />
          </div>
        </div>

        {/* 3. Módulo de Comparación: Simulador vs. Cálculo Teórico */}
        <div className={styles.compSectionTitle}>
          <span>[ SIMULADOR VS. CÁLCULO TEÓRICO (r₀ = {Math.round(initialRadius)}) ]</span>
        </div>

        <table className={styles.compTable}>
          <thead>
            <tr>
              <th>Magnitud</th>
              <th>Teórico</th>
              <th>Simulado</th>
              <th>% Desv.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Velocidad (v)</td>
              <td>{vTeo.toFixed(2)}</td>
              <td>{v.toFixed(2)}</td>
              <td>
                <span className={vErr < 1.5 ? styles.badgeGood : styles.badgeWarn}>
                  {vErr.toFixed(2)}%
                </span>
              </td>
            </tr>
            <tr>
              <td>Fuerza (F)</td>
              <td>{fTeo.toFixed(1)}</td>
              <td>{fg.toFixed(1)}</td>
              <td>
                <span className={fErr < 2.0 ? styles.badgeGood : styles.badgeWarn}>
                  {fErr.toFixed(2)}%
                </span>
              </td>
            </tr>
            <tr>
              <td>Período (T)</td>
              <td>{tTeo.toFixed(2)} s</td>
              <td>{tSim !== null ? `${tSim.toFixed(2)} s` : "Midiendo..."}</td>
              <td>
                {tErr !== null ? (
                  <span className={tErr < 1.0 ? styles.badgeGood : styles.badgeWarn}>
                    {tErr.toFixed(2)}%
                  </span>
                ) : (
                  <span className={styles.badgePending}>
                    {(orbitProgress * 100).toFixed(0)}% de 1ª
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Lectura en lenguaje natural de la telemetría actual */}
        <div className={styles.inlineExplainBox}>
          <strong style={{ color: "var(--color-phosphor-cyan)" }}>En palabras simples:</strong>{" "}
          {Math.abs(fg - fc) / Math.max(1, fg) < 0.03
            ? "El jalón de gravedad de la estrella (F_g) empata con la fuerza necesaria para girar en círculo (F_c), manteniendo distancia y rapidez fijas."
            : fg > fc
            ? "La gravedad (F_g) supera a la inercia de giro (F_c), jalando al satélite hacia adentro y acelerándolo."
            : "El impulso del satélite (F_c) supera al jalón gravitatorio actual (F_g), abriendo su trayectoria hacia una distancia mayor."}{" "}
          {tSim !== null
            ? `La vuelta completa tardó ${tSim.toFixed(2)} s frente a los ${tTeo.toFixed(2)} s que predice la 3ra Ley de Kepler.`
            : "Al completar los 360° se comparará el tiempo real contra la predicción de Kepler."}
        </div>
      </div>
    </section>
  );
}
