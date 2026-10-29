"use client";

import { TelemetryData } from "@/physics/types";
import styles from "./hud.module.css";

export interface EnergySample {
  k: number;
  u: number;
  e: number;
}

export interface EnergyChartProps {
  className?: string;
  telemetry: TelemetryData | null;
  history?: EnergySample[];
}

/**
 * Minigráfica de barras y osciloscopio temporal de Energía (Cinética K, Potencial U y Mecánica Total E)
 * Demostración visual de la Ley de Conservación de la Energía (Fase 4)
 */
export function EnergyChart({
  className,
  telemetry,
  history = [],
}: EnergyChartProps) {
  const k = telemetry?.kineticEnergy ?? 0;
  const u = telemetry?.potentialEnergy ?? 0;
  const eTotal = telemetry?.totalEnergy ?? 0;

  // Escala relativa para las barras de magnitud (tomando el máximo entre K, |U| y |E|)
  const maxMag = Math.max(1, k, Math.abs(u), Math.abs(eTotal));
  const kPct = Math.min(100, (k / maxMag) * 100);
  const uPct = Math.min(100, (Math.abs(u) / maxMag) * 100);
  const ePct = Math.min(100, (Math.abs(eTotal) / maxMag) * 100);

  // Construcción de polilíneas SVG para el osciloscopio de conservación de energía
  const width = 260;
  const height = 68;
  const samples = history.length > 1 ? history : [{ k, u, e: eTotal }, { k, u, e: eTotal }];

  let minVal = Math.min(...samples.map((s) => Math.min(s.k, s.u, s.e)), -10);
  let maxVal = Math.max(...samples.map((s) => Math.max(s.k, s.u, s.e)), 10);
  if (Math.abs(maxVal - minVal) < 1) {
    maxVal += 10;
    minVal -= 10;
  }

  const mapY = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal);
    return height - 6 - norm * (height - 12);
  };

  const buildPoints = (selector: (s: EnergySample) => number) =>
    samples
      .map((s, idx) => {
        const x = (idx / Math.max(1, samples.length - 1)) * width;
        const y = mapY(selector(s));
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const zeroY = mapY(0);

  return (
    <section
      className={`${styles.panel} ${className ?? ""}`.trim()}
      aria-label="Balance y Conservación de Energía Mecánica"
    >
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <span>⚡</span>
          <span>BALANCE Y CONSERVACIÓN DE ENERGÍA</span>
        </div>
        <span className={styles.panelTag}>
          {eTotal < 0 ? "LIGADO (E < 0)" : "ESCAPE (E ≥ 0)"}
        </span>
      </div>

      <div className={styles.panelBody}>
        {/* 1. Barras dinámicas de magnitud energética */}
        <div className={styles.energyBars}>
          <div className={styles.energyRow}>
            <div className={styles.energyRowHeader}>
              <span style={{ color: "#00ffcc" }}>Cinética (K = ½mv²)</span>
              <strong style={{ color: "#00ffcc" }}>+{k.toFixed(0)} J-sim</strong>
            </div>
            <div className={styles.energyBarTrack}>
              <div className={styles.energyBarK} style={{ width: `${kPct}%` }} />
            </div>
          </div>

          <div className={styles.energyRow}>
            <div className={styles.energyRowHeader}>
              <span style={{ color: "#ffb000" }}>Potencial (U = -GMm/r)</span>
              <strong style={{ color: "#ffb000" }}>{u.toFixed(0)} J-sim</strong>
            </div>
            <div className={styles.energyBarTrack}>
              <div className={styles.energyBarU} style={{ width: `${uPct}%` }} />
            </div>
          </div>

          <div className={styles.energyRow}>
            <div className={styles.energyRowHeader}>
              <span style={{ color: "#e6ffff" }}>Mecánica Total (E = K + U)</span>
              <strong
                style={{
                  color: eTotal < 0 ? "#e6ffff" : "var(--color-alert-crimson)",
                }}
              >
                {eTotal >= 0 ? `+${eTotal.toFixed(0)}` : eTotal.toFixed(0)} J-sim
              </strong>
            </div>
            <div className={styles.energyBarTrack}>
              <div className={styles.energyBarE} style={{ width: `${ePct}%` }} />
            </div>
          </div>
        </div>

        {/* 2. Osciloscopio CRT: Curvas K(t), U(t) y E_total(t) constante */}
        <div className={styles.scopeBox}>
          <div className={styles.scopeLegend}>
            <span style={{ color: "#00ffcc" }}>━ K (Cinética)</span>
            <span style={{ color: "#e6ffff" }}>━ E_total (Constante)</span>
            <span style={{ color: "#ffb000" }}>━ U (Potencial)</span>
          </div>

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className={styles.scopeSvg}
            preserveAspectRatio="none"
          >
            {/* Línea de referencia E = 0 */}
            {zeroY >= 0 && zeroY <= height && (
              <line
                x1={0}
                y1={zeroY}
                x2={width}
                y2={zeroY}
                stroke="rgba(0, 255, 204, 0.2)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            )}

            {/* Curva U(t) */}
            <polyline
              fill="none"
              stroke="#ffb000"
              strokeWidth="1.6"
              points={buildPoints((s) => s.u)}
            />

            {/* Curva K(t) */}
            <polyline
              fill="none"
              stroke="#00ffcc"
              strokeWidth="1.6"
              points={buildPoints((s) => s.k)}
            />

            {/* Línea E_total(t) (Conservación de energía) */}
            <polyline
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeDasharray="4 2"
              points={buildPoints((s) => s.e)}
            />
          </svg>
        </div>

        {/* Explicación en lenguaje natural del balance energético */}
        <div className={styles.inlineExplainBox}>
          <strong style={{ color: "var(--color-vector-amber)" }}>¿Qué muestra este balance?</strong>{" "}
          Como en una montaña rusa, cuando el satélite se acerca a la estrella pierde &ldquo;altura&rdquo; (
          <strong>U</strong> baja) pero gana velocidad (<strong>K</strong> sube). Al sumarse (
          <strong>E = K + U</strong>), la línea blanca punteada permanece fija en{" "}
          <strong>{eTotal.toFixed(0)} J-sim</strong>: la energía total nunca se pierde, solo se transforma.
        </div>
      </div>
    </section>
  );
}
