"use client";

import { useState } from "react";
import { TheoreticalCalc } from "@/physics/TheoreticalCalc";
import { TelemetryData } from "@/physics/types";
import { StarConfig } from "@/types";
import styles from "./hud.module.css";

export interface PhenomenonExplainerProps {
  className?: string;
  star: StarConfig;
  initialRadius: number;
  initialVelocity: number;
  telemetry: TelemetryData | null;
}

type ExplainTab = "PHENOMENON" | "TELEMETRY" | "ENERGY";

/**
 * Panel educativo e intérprete en lenguaje natural del fenómeno físico,
 * la telemetría y la conservación de la energía.
 */
export function PhenomenonExplainer({
  className,
  star,
  initialRadius,
  initialVelocity,
  telemetry,
}: PhenomenonExplainerProps) {
  const [activeTab, setActiveTab] = useState<ExplainTab>("PHENOMENON");

  const vTeo = TheoreticalCalc.getCircularVelocity(star.mass, initialRadius);
  const vEsc = TheoreticalCalc.getEscapeVelocity(star.mass, initialRadius);

  const r = telemetry?.distance ?? initialRadius;
  const v = telemetry?.speed ?? initialVelocity;
  const at = telemetry?.tangentialAccel ?? 0;
  const eTotal = telemetry?.totalEnergy ?? -1;

  const isCircular = vTeo > 0 && Math.abs(initialVelocity - vTeo) / vTeo < 0.015;
  const isEscape = (vEsc > 0 && initialVelocity >= vEsc * 0.995) || eTotal >= 0;

  // Narración dinámica en vivo según el estado instantáneo del satélite
  let liveTitle = "Equilibrio Circular Perfecto";
  let liveExplanation =
    "El satélite viaja a la velocidad justa donde su impulso por seguir en línea recta se equilibra exactamente con el jalón de gravedad de la estrella. Por eso mantiene siempre la misma distancia y rapidez.";

  if (isEscape) {
    liveTitle = "Fuga Gravitatoria (Escape Hiperbólico)";
    liveExplanation =
      "El satélite lleva demasiada velocidad para que la estrella pueda retenerlo. Aunque la gravedad intenta frenarlo, su energía de movimiento gana y escapará para siempre hacia el espacio profundo.";
  } else if (!isCircular) {
    if (at > 0.08) {
      liveTitle = "Órbita Elíptica — Cayendo hacia la Estrella";
      liveExplanation = `En este momento el satélite se acerca a la estrella (r = ${r.toFixed(
        0
      )} UAS). Como va "de bajada" hacia el pozo gravitatorio, la gravedad lo empuja a favor de su camino y su velocidad aumenta (${v.toFixed(
        1
      )} UAS/s).`;
    } else if (at < -0.08) {
      liveTitle = "Órbita Elíptica — Alejándose de la Estrella";
      liveExplanation = `En este momento el satélite se aleja de la estrella (r = ${r.toFixed(
        0
      )} UAS). Igual que una pelota lanzada hacia arriba, la gravedad tira de él hacia atrás y lo va frenando poco a poco (${v.toFixed(
        1
      )} UAS/s) hasta llegar al punto más lejano.`;
    } else {
      liveTitle = "Órbita Elíptica — Punto de Retorno (Ápside)";
      liveExplanation =
        "El satélite está cruzando uno de los extremos de su elipse (el punto más cercano o el más lejano), cambiando entre acercarse y alejarse de la estrella.";
    }
  }

  return (
    <section
      className={`${styles.panel} ${className ?? ""}`.trim()}
      aria-label="Explicación del Fenómeno en Lenguaje Natural"
    >
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <span>📖</span>
          <span>INTÉRPRETE FÍSICO EN LENGUAJE NATURAL</span>
        </div>
        <span className={styles.panelTag}>GUÍA EN VIVO</span>
      </div>

      <div className={styles.panelBody}>
        {/* Selector de pestañas explicativas */}
        <div className={styles.explainTabs}>
          <button
            type="button"
            className={`${styles.explainTabBtn} ${
              activeTab === "PHENOMENON" ? styles.explainTabBtnActive : ""
            }`}
            onClick={() => setActiveTab("PHENOMENON")}
          >
            1. Fenómeno
          </button>
          <button
            type="button"
            className={`${styles.explainTabBtn} ${
              activeTab === "TELEMETRY" ? styles.explainTabBtnActive : ""
            }`}
            onClick={() => setActiveTab("TELEMETRY")}
          >
            2. Telemetría
          </button>
          <button
            type="button"
            className={`${styles.explainTabBtn} ${
              activeTab === "ENERGY" ? styles.explainTabBtnActive : ""
            }`}
            onClick={() => setActiveTab("ENERGY")}
          >
            3. Energía
          </button>
        </div>

        {/* PESTAÑA 1: Explicación del fenómeno físico y vectores */}
        {activeTab === "PHENOMENON" && (
          <>
            <div className={styles.naturalCard}>
              <span className={styles.naturalTitle}>
                ● ¿Qué está pasando ahora mismo? — {liveTitle}
              </span>
              <p>{liveExplanation}</p>
            </div>

            <div className={`${styles.naturalCard} ${styles.naturalCardAmber}`}>
              <span className={`${styles.naturalTitle} ${styles.naturalTitleAmber}`}>
                ● ¿Cómo funciona una órbita y qué son las flechas?
              </span>
              <ul className={styles.naturalList}>
                <li>
                  <strong style={{ color: "#00ffcc" }}>Flecha Cian (v_t — Inercia):</strong>{" "}
                  Indica hacia dónde quiere ir el satélite. Si apagaras la gravedad de golpe, saldría disparado en línea recta siguiendo esta flecha.
                </li>
                <li>
                  <strong style={{ color: "#ffb000" }}>Flecha Ámbar (F_g — Gravedad):</strong>{" "}
                  Es la &ldquo;cuerda invisible&rdquo; con la que la estrella jala al satélite hacia el centro. Mientras más se acerca a la estrella, más fuerte es este jalón.
                </li>
                <li>
                  <strong>El secreto de orbitar:</strong> Orbitar es <em>caer eternamente hacia la estrella pero avanzar tan rápido de lado que nunca llegas a chocar con ella</em>.
                </li>
              </ul>
            </div>
          </>
        )}

        {/* PESTAÑA 2: Explicación de la telemetría y 3ra Ley de Kepler */}
        {activeTab === "TELEMETRY" && (
          <>
            <div className={styles.naturalCard}>
              <span className={styles.naturalTitle}>
                ● ¿Qué significan los números de Telemetría?
              </span>
              <ul className={styles.naturalList}>
                <li>
                  <strong style={{ color: "#00ffcc" }}>F_g vs. F_c (Fuerzas):</strong>{" "}
                  <strong>F_c</strong> es el jalón que el satélite <em>necesita</em> para doblar en círculo perfecto, y <strong>F_g</strong> es el jalón real que le da la estrella. Si <strong>F_g = F_c</strong>, el camino es un círculo exacto.
                </li>
                <li>
                  <strong style={{ color: "#00ffcc" }}>Aceleración (a_c | a_t):</strong>{" "}
                  <strong>a_c</strong> mide cuánto se curva el giro hacia el centro; <strong>a_t</strong> mide si el satélite está ganando rapidez (+) al bajar o frenando (-) al subir. En un círculo perfecto, <strong>a_t vale 0</strong>.
                </li>
              </ul>
            </div>

            <div className={`${styles.naturalCard} ${styles.naturalCardAmber}`}>
              <span className={`${styles.naturalTitle} ${styles.naturalTitleAmber}`}>
                ● ¿Por qué comparamos Teórico vs. Simulador?
              </span>
              <p>
                La <strong>3ra Ley de Kepler</strong> es una fórmula matemática en papel que predice cuántos segundos tardará el satélite en dar una vuelta completa (<strong>T_teo</strong>).
              </p>
              <p>
                El simulador <strong>no hace trampa usando esa fórmula</strong>: mueve el satélite empujándolo poquito a poquito 60 veces por segundo y usa un cronómetro al completar los 360° (<strong>T_sim</strong>). Que ambos tiempos coincidan (error &lt; 0.5%) comprueba que el motor físico es fiel a la realidad.
              </p>
            </div>
          </>
        )}

        {/* PESTAÑA 3: Explicación del balance y conservación de la energía */}
        {activeTab === "ENERGY" && (
          <>
            <div className={styles.naturalCard}>
              <span className={styles.naturalTitle}>
                ● La Montaña Rusa Espacial (K vs. U)
              </span>
              <ul className={styles.naturalList}>
                <li>
                  <strong style={{ color: "#00ffcc" }}>Energía Cinética (K — Velocidad):</strong>{" "}
                  Es la energía de movimiento. Sube cuando el satélite acelera al acercarse a la estrella.
                </li>
                <li>
                  <strong style={{ color: "#ffb000" }}>Energía Potencial (U — Altura):</strong>{" "}
                  Es la energía por estar lejos o cerca del astro (es negativa porque está atrapado en el &ldquo;pozo&rdquo; de gravedad).
                </li>
              </ul>
            </div>

            <div className={`${styles.naturalCard} ${styles.naturalCardAmber}`}>
              <span className={`${styles.naturalTitle} ${styles.naturalTitleAmber}`}>
                ● ¿Cómo leer la gráfica del Osciloscopio?
              </span>
              <p>
                En una <strong>órbita circular</strong>, como ni la distancia ni la rapidez cambian, verás 3 líneas rectas planas.
              </p>
              <p>
                En una <strong>órbita elíptica</strong>, verás cómo la curva cian (<strong>K</strong>) y la curva ámbar (<strong>U</strong>) suben y bajan como espejo: todo lo que pierde de altura lo gana en velocidad. Por eso la suma de ambas —la <strong>línea blanca punteada (E_total)</strong>— se mantiene siempre recta, demostrando que <strong>la energía se conserva</strong>.
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
