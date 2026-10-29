// src/components/canvas/OrbitCanvas.tsx
"use client";

import { useEffect, useRef } from "react";
import { SIMULATION_CONSTANTS } from "@/config/physics.constants";
import { STAR_PRESETS } from "@/config/StarPresets";
import { CelestialBody } from "@/physics/CelestialBody";
import { PhysicsEngine, TelemetryData } from "@/physics/PhysicsEngine";
import { TheoreticalCalc } from "@/physics/TheoreticalCalc";
import { Vector2D } from "@/physics/Vector2D";
import { CanvasRenderer } from "@/render/CanvasRenderer";
import { RenderOptions, SpaceAnomaly } from "@/render/types";
import { StarConfig } from "@/types";
import styles from "./OrbitCanvas.module.css";

export interface OrbitCanvasProps {
  className?: string;
  star?: StarConfig;
  body?: CelestialBody | null;
  isPaused?: boolean;
  timeScale?: number;
  clearSignal?: number;
  renderOptions?: Partial<RenderOptions>;
  onTelemetryUpdate?: (telemetry: TelemetryData) => void;
}

/**
 * Contenedor del lienzo HTML5 Canvas para el renderizado 2D orbital a 60 FPS
 */
export function OrbitCanvas({
  className,
  star = STAR_PRESETS.SOL_TYPE,
  body,
  isPaused = false,
  timeScale = 1,
  clearSignal = 0,
  renderOptions,
  onTelemetryUpdate,
}: OrbitCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const renderOptionsRef = useRef<Partial<RenderOptions> | undefined>(renderOptions);

  // Cuerpo orbital de respaldo por si aún no se inyecta uno desde el HUD (Fase 3)
  const fallbackBodyRef = useRef<CelestialBody | null>(null);

  // Referencias mutables para leer siempre el estado más fresco dentro de requestAnimationFrame
  const stateRef = useRef({
    star,
    body,
    isPaused,
    timeScale,
    onTelemetryUpdate,
  });

  useEffect(() => {
    stateRef.current = {
      star,
      body,
      isPaused,
      timeScale,
      onTelemetryUpdate,
    };
  }, [star, body, isPaused, timeScale, onTelemetryUpdate]);

  // Si no se recibe un cuerpo externo, creamos una sonda por defecto en órbita circular
  useEffect(() => {
    if (!body) {
      const r0 = 180;
      const v0 = TheoreticalCalc.getCircularVelocity(star.mass, r0);
      fallbackBodyRef.current = new CelestialBody(
        "probe-alpha",
        "SAT-01",
        10,
        new Vector2D(r0, 0),
        new Vector2D(0, v0),
        r0
      );
    }
    rendererRef.current?.hardClear();

    const activeBody = body !== undefined ? body : fallbackBodyRef.current;
    if (activeBody && stateRef.current.onTelemetryUpdate) {
      stateRef.current.onTelemetryUpdate(
        PhysicsEngine.computeTelemetry(star.mass, new Vector2D(0, 0), activeBody)
      );
    }
  }, [star, body, clearSignal]);

  // Actualizar opciones de renderizado cuando cambien las props
  useEffect(() => {
    renderOptionsRef.current = renderOptions;
    if (rendererRef.current && renderOptions) {
      rendererRef.current.setOptions(renderOptions);
    }
  }, [renderOptions]);

  // Inicialización del Canvas, ResizeObserver, Zoom, Paneo y Bucle 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderer = new CanvasRenderer(ctx, undefined, renderOptionsRef.current);
    rendererRef.current = renderer;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(300, Math.floor(rect.width));
      const height = Math.max(300, Math.floor(rect.height));

      canvas.width = width;
      canvas.height = height;

      renderer.setViewport({
        width,
        height,
        centerX: width / 2,
        centerY: height / 2,
      });
      renderer.hardClear();
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    // Soporte de Zoom con la rueda del ratón (0.35x a 3.0x)
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentZoom = renderer.getViewport().zoom;
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const nextZoom = Math.min(3.0, Math.max(0.35, currentZoom * zoomFactor));
      renderer.setViewport({ zoom: nextZoom });
      renderer.hardClear();
    };

    // Paneo suave de cámara tipo Radar siguiendo al puntero
    const MAX_PAN_OFFSET = 45;
    const PAN_SMOOTHING = 0.08;
    const targetOffset = { x: 0, y: 0 };
    const currentOffset = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      targetOffset.x = -normX * MAX_PAN_OFFSET;
      targetOffset.y = -normY * MAX_PAN_OFFSET;
    };

    const handleMouseLeave = () => {
      targetOffset.x = 0;
      targetOffset.y = 0;
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // --- Sistema de Eventos Aleatorios de Radar (Ambiente / Lore) ---
    const anomalies: SpaceAnomaly[] = [];
    let anomalyCooldown = 1.0;

    const generateRandomName = (type: "COMET" | "UFO" | "LEVIATHAN") => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const randLetter = () => letters[Math.floor(Math.random() * letters.length)];
      const randNum = (min: number, max: number) => Math.floor(min + Math.random() * (max - min));

      if (type === "COMET") {
        const prefix = Math.random() < 0.5 ? "C" : "P";
        return `${prefix}/${randNum(2025, 2032)}/${randLetter()}${randLetter()}-${randNum(10, 99)}`;
      } else if (type === "UFO") {
        const sectors = ["SECTOR-7G", "OBLIVION", "NEXUS", "DEEP-VOID", "OUTPOST-9", "VECTOR-X"];
        const sec = sectors[Math.floor(Math.random() * sectors.length)];
        return `BOGEY // ${sec}-${randNum(100, 999)}`;
      } else {
        const anomaliesList = ["VOID-ENTITY", "ELDRITCH-CORE", "ABYSSAL-MASS", "SINGULARITY-X", "NON-EUCLID"];
        const name = anomaliesList[Math.floor(Math.random() * anomaliesList.length)];
        return `WARN // ${name}-${randLetter()}${randNum(1, 9)}`;
      }
    };

    const spawnRandomAnomaly = () => {
      const angleIn = Math.random() * Math.PI * 2;
      const spawnRadius = 520;
      const startX = Math.cos(angleIn) * spawnRadius;
      const startY = Math.sin(angleIn) * spawnRadius;

      const passDirection = Math.random() < 0.5 ? 1 : -1;
      const passDistance = (70 + Math.random() * 90) * passDirection;
      const targetX = Math.cos(angleIn + Math.PI / 2) * passDistance;
      const targetY = Math.sin(angleIn + Math.PI / 2) * passDistance;

      const dirX = targetX - startX;
      const dirY = targetY - startY;
      const targetAngle = Math.atan2(dirY, dirX);

      const roll = Math.random();
      if (roll < 0.35) {
        const speed = 65 + Math.random() * 30;
        anomalies.push({
          id: `comet-${Date.now()}`,
          type: "COMET",
          label: generateRandomName("COMET"),
          glyph: "✦",
          color: "#00FFCC",
          position: { x: startX, y: startY },
          velocity: { x: Math.cos(targetAngle) * speed, y: Math.sin(targetAngle) * speed },
          trail: [],
          age: 0,
          maxAge: 11,
        });
      } else if (roll < 0.85) {
        const speed = 45 + Math.random() * 20;
        anomalies.push({
          id: `ufo-${Date.now()}`,
          type: "UFO",
          label: generateRandomName("UFO"),
          glyph: "⌬",
          color: "#FFB000",
          position: { x: startX, y: startY },
          velocity: { x: Math.cos(targetAngle) * speed, y: Math.sin(targetAngle) * speed },
          trail: [],
          age: 0,
          maxAge: 15,
        });
      } else {
        const speed = 32 + Math.random() * 12;
        anomalies.push({
          id: `void-${Date.now()}`,
          type: "LEVIATHAN",
          label: generateRandomName("LEVIATHAN"),
          glyph: "ꙮ",
          color: "#FF3366",
          position: { x: startX, y: startY },
          velocity: { x: Math.cos(targetAngle) * speed, y: Math.sin(targetAngle) * speed },
          trail: [],
          age: 0,
          maxAge: 20,
        });
      }
    };

    // Bucle principal de simulación y renderizado
    const starPos = new Vector2D(0, 0);
    let animationFrameId: number;
    let tickCounter = 0;

    const renderLoop = () => {
      const {
        star: currentStar,
        body: externalBody,
        isPaused: paused,
        timeScale: warp,
        onTelemetryUpdate: emitTelemetry,
      } = stateRef.current;

      const activeBody = externalBody !== undefined ? externalBody : fallbackBodyRef.current;

      if (activeBody && !paused) {
        const steps = Math.max(1, Math.round(warp * 2));
        const scaledDt = (SIMULATION_CONSTANTS.FIXED_DT * warp) / steps;

        for (let i = 0; i < steps; i++) {
          PhysicsEngine.step(currentStar.mass, starPos, activeBody, scaledDt);
        }

        tickCounter++;
        const sampleInterval = Math.max(
          1,
          Math.round(60 / SIMULATION_CONSTANTS.TELEMETRY_SAMPLE_RATE)
        );
        if (emitTelemetry && tickCounter % sampleInterval === 0) {
          emitTelemetry(
            PhysicsEngine.computeTelemetry(currentStar.mass, starPos, activeBody)
          );
        }
      }

      // Actualizar anomalías ambientales (si no está en pausa)
      if (!paused) {
        const dt = SIMULATION_CONSTANTS.FIXED_DT;
        anomalyCooldown -= dt;
        if (anomalyCooldown <= 0 && anomalies.length < 2) {
          spawnRandomAnomaly();
          anomalyCooldown = 25 + Math.random() * 10;
        }

        for (let i = anomalies.length - 1; i >= 0; i--) {
          const a = anomalies[i];
          a.age += dt;
          a.trail.push({ x: a.position.x, y: a.position.y });
          if (a.trail.length > 35) a.trail.shift();

          if (a.type === "LEVIATHAN") {
            const perpX = -a.velocity.y * 0.35 * Math.cos(a.age * 4);
            const perpY = a.velocity.x * 0.35 * Math.cos(a.age * 4);
            a.position.x += (a.velocity.x + perpX) * dt;
            a.position.y += (a.velocity.y + perpY) * dt;
          } else {
            a.position.x += a.velocity.x * dt;
            a.position.y += a.velocity.y * dt;
          }

          if (a.age >= a.maxAge) {
            anomalies.splice(i, 1);
          }
        }
      }

      // Interpolación suave (Lerp) del centro del viewport
      currentOffset.x += (targetOffset.x - currentOffset.x) * PAN_SMOOTHING;
      currentOffset.y += (targetOffset.y - currentOffset.y) * PAN_SMOOTHING;

      const vp = renderer.getViewport();
      renderer.setViewport({
        centerX: vp.width / 2 + currentOffset.x,
        centerY: vp.height / 2 + currentOffset.y,
      });

      renderer.renderFrame(
        currentStar,
        starPos,
        activeBody ? [activeBody] : [],
        anomalies
      );

      animationFrameId = window.requestAnimationFrame(renderLoop);
    };

    animationFrameId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const containerClass = className
    ? `${styles.canvasContainer} ${className}`
    : styles.canvasContainer;

  return (
    <div ref={containerRef} className={containerClass} suppressHydrationWarning>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
