"use client";

import { useCallback, useRef, useState } from "react";
import { OrbitCanvas } from "@/components/canvas/OrbitCanvas";
import { PlaybackControls } from "@/components/controls/PlaybackControls";
import { EnergyChart, EnergySample } from "@/components/hud/EnergyChart";
import { OrbitControls } from "@/components/hud/OrbitControls";
import { PhenomenonExplainer } from "@/components/hud/PhenomenonExplainer";
import { StarSelector } from "@/components/hud/StarSelector";
import { TelemetryPanel } from "@/components/hud/TelemetryPanel";
import { WelcomeModal } from "@/components/hud/WelcomeModal";
import { SIMULATION_CONSTANTS } from "@/config/physics.constants";
import { STAR_PRESETS } from "@/config/StarPresets";
import { CelestialBody } from "@/physics/CelestialBody";
import { PhysicsEngine, TelemetryData } from "@/physics/PhysicsEngine";
import { TheoreticalCalc } from "@/physics/TheoreticalCalc";
import { Vector2D } from "@/physics/Vector2D";
import { RenderOptions } from "@/render/types";
import { StarConfig } from "@/types";
import styles from "./page.module.css";

const DEFAULT_STAR = STAR_PRESETS.SOL_TYPE;
const DEFAULT_RADIUS = 180;
const DEFAULT_MASS = 10;
const DEFAULT_SPEED = TheoreticalCalc.getCircularVelocity(DEFAULT_STAR.mass, DEFAULT_RADIUS);

function createOrbitalBody(mass: number, radius: number, tangentialSpeed: number): CelestialBody {
  return new CelestialBody(
    "probe-alpha",
    "SAT-01",
    mass,
    new Vector2D(radius, 0),
    new Vector2D(0, tangentialSpeed),
    radius
  );
}

export default function Home() {
  const [star, setStar] = useState<StarConfig>({ ...DEFAULT_STAR });
  const [bodyMass, setBodyMass] = useState<number>(DEFAULT_MASS);
  const [initialRadius, setInitialRadius] = useState<number>(DEFAULT_RADIUS);
  const [initialVelocity, setInitialVelocity] = useState<number>(DEFAULT_SPEED);

  const [body, setBody] = useState<CelestialBody>(() =>
    createOrbitalBody(DEFAULT_MASS, DEFAULT_RADIUS, DEFAULT_SPEED)
  );

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [clearSignal, setClearSignal] = useState<number>(0);

  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    showVectors: true,
    showGrid: true,
    showTrails: true,
    phosphorPersistenceAlpha: 0.75,
  });

  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [energyHistory, setEnergyHistory] = useState<EnergySample[]>([]);

  const [isStarMapOpen, setIsStarMapOpen] = useState<boolean>(false);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [hudVisible, setHudVisible] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTelemetryUpdate = useCallback((data: TelemetryData) => {
    setTelemetry(data);
    setEnergyHistory((prev) => {
      const next = [
        ...prev,
        {
          k: data.kineticEnergy,
          u: data.potentialEnergy,
          e: data.totalEnergy,
        },
      ];
      return next.length > 65 ? next.slice(next.length - 65) : next;
    });
  }, []);

  // Re-inyecta un cuerpo nuevo en (r0, 0) con velocidad (0, vt) y limpia el lienzo
  const injectBody = useCallback(
    (nextStarMass: number, nextBodyMass: number, nextRadius: number, nextVelocity: number) => {
      const newBody = createOrbitalBody(nextBodyMass, nextRadius, nextVelocity);
      setBody(newBody);
      setEnergyHistory([]);
      setClearSignal((c) => c + 1);
      const initialTel = PhysicsEngine.computeTelemetry(
        nextStarMass,
        new Vector2D(0, 0),
        newBody
      );
      setTelemetry(initialTel);
    },
    []
  );

  // 1. Cambio de masa estelar (M)
  const handleStarMassChange = (newMass: number) => {
    const updatedStar = { ...star, mass: newMass };
    setStar(updatedStar);
    injectBody(newMass, bodyMass, initialRadius, initialVelocity);
  };

  // 2. Cambio de masa del satélite (m)
  const handleBodyMassChange = (newMass: number) => {
    setBodyMass(newMass);
    injectBody(star.mass, newMass, initialRadius, initialVelocity);
  };

  // 3. Cambio de radio inicial (r0) -> re-inyecta en el nuevo radio
  const handleRadiusChange = (newRadius: number) => {
    setInitialRadius(newRadius);
    injectBody(star.mass, bodyMass, newRadius, initialVelocity);
  };

  // 4. Cambio de velocidad tangencial inicial (vt) -> re-inyecta con la nueva velocidad
  const handleVelocityChange = (newVel: number) => {
    setInitialVelocity(newVel);
    injectBody(star.mass, bodyMass, initialRadius, newVel);
  };

  // Auto-Calibrar Velocidad Circular Ideal: v_teo = sqrt(G * M / r0)
  const handleAutoCalibrateCircular = () => {
    const vIdeal = TheoreticalCalc.getCircularVelocity(star.mass, initialRadius);
    setInitialVelocity(vIdeal);
    injectBody(star.mass, bodyMass, initialRadius, vIdeal);
  };

  // Escenarios demostrativos preconfigurados
  const handleApplyScenario = (
    scenario: "CIRCULAR" | "ELLIPTIC_IN" | "ELLIPTIC_OUT" | "ESCAPE"
  ) => {
    const vIdeal = TheoreticalCalc.getCircularVelocity(star.mass, initialRadius);
    const vEsc = TheoreticalCalc.getEscapeVelocity(star.mass, initialRadius);

    let targetV = vIdeal;
    if (scenario === "ELLIPTIC_IN") targetV = vIdeal * 0.78;
    else if (scenario === "ELLIPTIC_OUT") targetV = vIdeal * 1.2;
    else if (scenario === "ESCAPE") targetV = vEsc * 1.04;

    setInitialVelocity(targetV);
    injectBody(star.mass, bodyMass, initialRadius, targetV);
  };

  // Avance Paso a Paso (+dt) cuando está en pausa
  const handleStepForward = () => {
    if (!isPaused) return;
    const starPos = new Vector2D(0, 0);
    PhysicsEngine.step(star.mass, starPos, body, SIMULATION_CONSTANTS.FIXED_DT);
    const tel = PhysicsEngine.computeTelemetry(star.mass, starPos, body);
    handleTelemetryUpdate(tel);
  };

  // Reiniciar simulación a t = 0
  const handleResetSimulation = () => {
    injectBody(star.mass, bodyMass, initialRadius, initialVelocity);
  };

  // Confirmar nueva estrella desde el Mapa Estelar (Estado 1)
  const handleConfirmStar = (chosenStar: StarConfig) => {
    setStar(chosenStar);
    const vIdeal = TheoreticalCalc.getCircularVelocity(chosenStar.mass, initialRadius);
    setInitialVelocity(vIdeal);
    injectBody(chosenStar.mass, bodyMass, initialRadius, vIdeal);
    setIsStarMapOpen(false);
  };

  // Exportar configuración actual en JSON (Requisito de Propuesta Técnica)
  const handleExportJson = () => {
    const payload = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      star,
      parameters: {
        bodyMass,
        initialRadius,
        initialVelocity,
        timeScale,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orb-sys-config-${star.spectralClass.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importar configuración desde archivo JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(String(event.target?.result));
        const nextStar: StarConfig = parsed.star ?? star;
        const nextMass = Number(parsed.parameters?.bodyMass ?? bodyMass);
        const nextRadius = Number(parsed.parameters?.initialRadius ?? initialRadius);
        const nextVel = Number(parsed.parameters?.initialVelocity ?? initialVelocity);
        const nextWarp = Number(parsed.parameters?.timeScale ?? timeScale);

        setStar(nextStar);
        setBodyMass(nextMass);
        setInitialRadius(nextRadius);
        setInitialVelocity(nextVel);
        setTimeScale(nextWarp);
        injectBody(nextStar.mass, nextMass, nextRadius, nextVel);
      } catch {
        // Ignorar archivos JSON malformados
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <main className={styles.mainContainer} suppressHydrationWarning>
      {/* Lienzo 2D de Simulación Orbital a 60 FPS */}
      <OrbitCanvas
        star={star}
        body={body}
        isPaused={isPaused}
        timeScale={timeScale}
        clearSignal={clearSignal}
        renderOptions={renderOptions}
        onTelemetryUpdate={handleTelemetryUpdate}
      />

      {/* Barra Superior de Consola */}
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <span
            className={`${styles.statusDot} ${
              isPaused ? styles.statusDotPaused : ""
            }`.trim()}
          />
          <span className={styles.brandTitle}>ORB-SYS // HUD</span>
          <span className={styles.stateBadge}>
            {isStarMapOpen
              ? "ESTADO 1: MAPA ESTELAR"
              : isPaused
              ? "ESTADO 3: PAUSA TÁCTICA"
              : "ESTADO 3: TELEMETRÍA ACTIVA"}
          </span>
          <div className={styles.starIndicator}>
            <span>Astro Central:</span>
            <strong style={{ color: star.color }}>
              ★ {star.name} (Clase {star.spectralClass} | M={Math.round(star.mass)})
            </strong>
          </div>
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.topBtn}
            onClick={() => setIsStarMapOpen(true)}
          >
            ★ MAPA ESTELAR
          </button>

          <button
            type="button"
            className={styles.topBtn}
            onClick={handleExportJson}
            title="Exportar parámetros orbitales en formato JSON"
          >
            ⬇ EXPORTAR JSON
          </button>

          <button
            type="button"
            className={styles.topBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Importar parámetros orbitales desde un archivo JSON"
          >
            ⬆ IMPORTAR JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={handleImportJson}
          />

          <button
            type="button"
            className={styles.topBtn}
            onClick={() => setHudVisible((v) => !v)}
          >
            {hudVisible ? "[ OCULTAR PANELES ]" : "[ MOSTRAR PANELES ]"}
          </button>

          <button
            type="button"
            className={styles.topBtn}
            onClick={() => setIsInfoOpen(true)}
          >
            [ ℹ INFO ]
          </button>
        </div>
      </header>

      {/* Paneles Laterales HUD (Fase 3 y Fase 4) */}
      {hudVisible && (
        <>
          <aside className={styles.leftDock}>
            <OrbitControls
              star={star}
              bodyMass={bodyMass}
              initialRadius={initialRadius}
              initialVelocity={initialVelocity}
              renderOptions={renderOptions}
              onStarMassChange={handleStarMassChange}
              onOpenStarSelector={() => setIsStarMapOpen(true)}
              onBodyMassChange={handleBodyMassChange}
              onRadiusChange={handleRadiusChange}
              onVelocityChange={handleVelocityChange}
              onAutoCalibrateCircular={handleAutoCalibrateCircular}
              onApplyScenario={handleApplyScenario}
              onInjectOrbit={() =>
                injectBody(star.mass, bodyMass, initialRadius, initialVelocity)
              }
              onRenderOptionsChange={(opts) =>
                setRenderOptions((prev) => ({ ...prev, ...opts }))
              }
            />

            <PhenomenonExplainer
              star={star}
              initialRadius={initialRadius}
              initialVelocity={initialVelocity}
              telemetry={telemetry}
            />
          </aside>

          <aside className={styles.rightDock}>
            <TelemetryPanel
              telemetry={telemetry}
              starMass={star.mass}
              bodyMass={bodyMass}
              initialRadius={initialRadius}
            />

            <EnergyChart
              telemetry={telemetry}
              history={energyHistory}
            />
          </aside>
        </>
      )}

      {/* Barra Inferior Central: Reproducción y Time Warp */}
      <div className={styles.bottomDock}>
        <PlaybackControls
          isPaused={isPaused}
          timeScale={timeScale}
          onTogglePause={() => setIsPaused((p) => !p)}
          onStepForward={handleStepForward}
          onTimeScaleChange={setTimeScale}
          onResetSimulation={handleResetSimulation}
          onOpenStarMap={() => setIsStarMapOpen(true)}
        />
      </div>

      {/* Estado 1: Modal Selector de Estrella (Mapa Estelar) */}
      <StarSelector
        isOpen={isStarMapOpen}
        selectedStar={star}
        onSelectStar={(s) => setStar(s)}
        onConfirmAndStart={handleConfirmStar}
        onClose={() => setIsStarMapOpen(false)}
      />

      {/* Modal Informativo del Sistema */}
      <WelcomeModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </main>
  );
}
