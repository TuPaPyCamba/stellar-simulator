// src/render/CanvasRenderer.ts

import { StarConfig } from "@/types";
import { CelestialBody } from "../physics/CelestialBody";
import { PhysicsEngine } from "../physics/PhysicsEngine";
import { Vector2D } from "../physics/Vector2D";
import { IVector2D } from "../physics/types";
import { RenderOptions, RenderViewport, SpaceAnomaly } from "./types";

/**
 * Renderizador Canvas 2D:
 * Dibujo de estelas con persistencia fósforo, bloom estelar, rejilla HUD, vectores y anomalías.
 */
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: RenderViewport;
  private options: RenderOptions;

  constructor(
    ctx: CanvasRenderingContext2D,
    viewport?: Partial<RenderViewport>,
    options?: Partial<RenderOptions>
  ) {
    this.ctx = ctx;
    this.viewport = {
      width: viewport?.width ?? 800,
      height: viewport?.height ?? 600,
      centerX: viewport?.centerX ?? 400,
      centerY: viewport?.centerY ?? 300,
      zoom: viewport?.zoom ?? 1,
    };
    this.options = {
      showVectors: options?.showVectors ?? true,
      showGrid: options?.showGrid ?? true,
      showTrails: options?.showTrails ?? true,
      phosphorPersistenceAlpha: options?.phosphorPersistenceAlpha ?? 0.75,
    };
  }

  public setViewport(viewport: Partial<RenderViewport>): void {
    this.viewport = { ...this.viewport, ...viewport };
  }

  public getViewport(): RenderViewport {
    return this.viewport;
  }

  public setOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  public worldToScreen(worldPos: IVector2D): Vector2D {
    return new Vector2D(
      this.viewport.centerX + worldPos.x * this.viewport.zoom,
      this.viewport.centerY + worldPos.y * this.viewport.zoom
    );
  }

  public screenToWorld(screenPos: IVector2D): Vector2D {
    return new Vector2D(
      (screenPos.x - this.viewport.centerX) / this.viewport.zoom,
      (screenPos.y - this.viewport.centerY) / this.viewport.zoom
    );
  }

  public hardClear(): void {
    const { width, height } = this.viewport;
    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = "#080A0F";
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.restore();
  }

  /**
   * 1. Barrido con Persistencia de Fósforo (Alpha Decay)
   */
  public clearWithPhosphorPersistence(): void {
    const { width, height } = this.viewport;
    const alpha = this.options.showTrails ? this.options.phosphorPersistenceAlpha : 1.0;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.fillStyle = `rgba(8, 10, 15, ${alpha})`;
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.restore();
  }

  /**
   * 2. Rejilla Técnica HUD y Anillos Radiales de Telemetría
   */
  public drawHUDGrid(): void {
    if (!this.options.showGrid) return;

    const { width, height, centerX, centerY, zoom } = this.viewport;
    const gridStep = Math.max(25, 50 * zoom);

    this.ctx.save();
    this.ctx.strokeStyle = "rgba(0, 255, 204, 0.07)";
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    for (let x = centerX % gridStep; x < width; x += gridStep) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
    }
    for (let y = centerY % gridStep; y < height; y += gridStep) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
    }
    this.ctx.stroke();

    // Ejes cartesianos principales
    this.ctx.strokeStyle = "rgba(0, 255, 204, 0.16)";
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, height);
    this.ctx.moveTo(0, centerY);
    this.ctx.lineTo(width, centerY);
    this.ctx.stroke();

    // Anillos concéntricos de referencia orbital (cada 100 UAS)
    this.ctx.setLineDash([4, 6]);
    this.ctx.strokeStyle = "rgba(0, 255, 204, 0.12)";
    this.ctx.fillStyle = "rgba(0, 255, 204, 0.35)";
    this.ctx.font = "10px monospace";

    for (let r = 100; r <= 500; r += 100) {
      const screenR = r * zoom;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, screenR, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.fillText(
        `${r} UAS`,
        Math.round(centerX + screenR + 4),
        Math.round(centerY - 4)
      );
    }

    this.ctx.restore();
  }

  /**
   * 3. Bloom Estelar 2D según la clase espectral
   */
  public drawStar(star: StarConfig, worldPos: IVector2D = { x: 0, y: 0 }): void {
    const pos = this.worldToScreen(worldPos);
    const radius = Math.max(4, star.radius * this.viewport.zoom);

    this.ctx.save();
    this.ctx.globalCompositeOperation = "lighter";

    const outerRadius = radius * 3.8;
    const gradient = this.ctx.createRadialGradient(
      pos.x,
      pos.y,
      radius * 0.2,
      pos.x,
      pos.y,
      outerRadius
    );
    gradient.addColorStop(0, "#FFFFFF");
    gradient.addColorStop(0.25, star.color);
    gradient.addColorStop(0.65, this.hexToRgba(star.color, 0.22));
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, outerRadius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowColor = star.color;
    this.ctx.shadowBlur = radius * 1.8;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, radius * 0.75, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 4. Dibujo de la estela histórica (en base a body.trailHistory)
   */
  public drawTrail(body: CelestialBody): void {
    if (!this.options.showTrails || body.trailHistory.length < 2) return;

    const history = body.trailHistory;
    this.ctx.save();
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    for (let i = 1; i < history.length; i++) {
      const p0 = this.worldToScreen(history[i - 1]);
      const p1 = this.worldToScreen(history[i]);
      const progress = i / history.length;

      this.ctx.strokeStyle = `rgba(0, 255, 204, ${(progress * 0.75).toFixed(3)})`;
      this.ctx.lineWidth = 1 + progress * 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(p0.x, p0.y);
      this.ctx.lineTo(p1.x, p1.y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * 5. Dibujo del cuerpo orbital (satélite/planeta) nítido
   */
  public drawBody(body: CelestialBody): void {
    const pos = this.worldToScreen(body.position);
    const bodyRadius = Math.max(3.5, 4.5 * Math.sqrt(this.viewport.zoom));

    this.ctx.save();
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = "transparent";

    this.ctx.fillStyle = "#00FFCC";
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, bodyRadius, 0, Math.PI * 2);
    this.ctx.fill();

    const boxSize = bodyRadius * 2.8;
    this.ctx.strokeStyle = "rgba(0, 255, 204, 0.65)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(
      Math.round(pos.x - boxSize / 2) + 0.5,
      Math.round(pos.y - boxSize / 2) + 0.5,
      Math.round(boxSize),
      Math.round(boxSize)
    );

    this.ctx.font = "11px monospace";
    this.ctx.fillStyle = "#00FFCC";
    this.ctx.fillText(
      body.name.toUpperCase(),
      Math.round(pos.x + boxSize / 2 + 6),
      Math.round(pos.y + 4)
    );

    this.ctx.restore();
  }

  /**
   * 6. Proyección de Vectores Dinámicos: Velocidad Tangencial (v_t) y Fuerza Gravitatoria (F_g)
   */
  public drawVectors(starMass: number, starPos: Vector2D, body: CelestialBody): void {
    if (!this.options.showVectors) return;

    const originScreen = this.worldToScreen(body.position);

    const velScale = 3.2 * this.viewport.zoom;
    const velEnd = new Vector2D(
      originScreen.x + body.velocity.x * velScale,
      originScreen.y + body.velocity.y * velScale
    );
    this.drawArrow(originScreen, velEnd, "#00FFCC", "v_t");

    const forceVec = PhysicsEngine.getGravitationalForceVector(starMass, starPos, body);
    const forceMag = forceVec.magnitude();
    if (forceMag > 0) {
      const forceDir = forceVec.normalize();
      const visualLength =
        Math.min(130, Math.max(28, Math.sqrt(forceMag) * 6)) * this.viewport.zoom;
      const forceEnd = new Vector2D(
        originScreen.x + forceDir.x * visualLength,
        originScreen.y + forceDir.y * visualLength
      );
      this.drawArrow(originScreen, forceEnd, "#FFB000", "F_g");
    }
  }

  private drawArrow(from: Vector2D, to: Vector2D, color: string, label?: string): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length < 4) return;

    const angle = Math.atan2(dy, dx);
    const headLength = Math.min(10, length * 0.35);

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 8;
    this.ctx.lineWidth = 1.6;

    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(to.x, to.y);
    this.ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();

    if (label) {
      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = "transparent";
      this.ctx.font = "bold 11px monospace";
      this.ctx.fillStyle = color;
      this.ctx.fillText(
        label,
        Math.round(to.x + Math.cos(angle) * 12 - 6),
        Math.round(to.y + Math.sin(angle) * 12 + 4)
      );
    }

    this.ctx.restore();
  }

  /**
   * 7. Contactos Anómalos del Radar (Cometas, Naves y Entidades Abisales)
   * Dibujados con vectores de Canvas para visibilidad 100% garantizada en cualquier SO.
   */
  public drawAnomalies(anomalies: SpaceAnomaly[]): void {
    if (!anomalies || anomalies.length === 0) return;

    for (const item of anomalies) {
      const pos = this.worldToScreen(item.position);
      const lifeRatio = item.age / item.maxAge;
      const alpha =
        lifeRatio < 0.1
          ? lifeRatio / 0.1
          : lifeRatio > 0.9
          ? (1 - lifeRatio) / 0.1
          : 1;

      this.ctx.save();

      // 1. Estela del contacto con ligero brillo
      if (item.trail.length > 1) {
        this.ctx.beginPath();
        for (let i = 0; i < item.trail.length; i++) {
          const tp = this.worldToScreen(item.trail[i]);
          if (i === 0) this.ctx.moveTo(tp.x, tp.y);
          else this.ctx.lineTo(tp.x, tp.y);
        }
        this.ctx.strokeStyle = this.hexToRgba(item.color, alpha * 0.75);
        this.ctx.shadowColor = item.color;
        this.ctx.shadowBlur = 6;
        this.ctx.lineWidth = item.type === "COMET" ? 2.2 : 1.5;
        if (item.type !== "COMET") {
          this.ctx.setLineDash([4, 4]);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      }

      // 2. Símbolo vectorial en Canvas según el tipo de anomalía
      this.ctx.strokeStyle = this.hexToRgba(item.color, alpha);
      this.ctx.fillStyle = this.hexToRgba(item.color, alpha);
      this.ctx.shadowColor = item.color;
      this.ctx.shadowBlur = 8;
      this.ctx.lineWidth = 1.5;

      if (item.type === "COMET") {
        // Estrella de 4 puntas + núcleo brillante
        const r = 7;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x - r, pos.y);
        this.ctx.lineTo(pos.x + r, pos.y);
        this.ctx.moveTo(pos.x, pos.y - r);
        this.ctx.lineTo(pos.x, pos.y + r);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (item.type === "UFO") {
        // Rombo táctico + punto central
        const r = 9;
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y - r);
        this.ctx.lineTo(pos.x + r, pos.y);
        this.ctx.lineTo(pos.x, pos.y + r);
        this.ctx.lineTo(pos.x - r, pos.y);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // LEVIATHAN: Ojo abisal pulsante con anillos concéntricos y tentáculos/apéndices
        const pulse = 10 + Math.sin(item.age * 6) * 3;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, pulse, 0, Math.PI * 2);
        this.ctx.stroke();

        // Pupila vertical abisal
        this.ctx.beginPath();
        this.ctx.ellipse(pos.x, pos.y, 2.5, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // 3. Etiqueta de telemetría nítida (sin shadowBlur)
      this.ctx.shadowBlur = 0;
      this.ctx.shadowColor = "transparent";
      this.ctx.font = "bold 11px monospace";
      this.ctx.fillStyle = this.hexToRgba(item.color, alpha);
      this.ctx.fillText(
        item.label,
        Math.round(pos.x + 14),
        Math.round(pos.y + 4)
      );

      this.ctx.restore();
    }
  }

  /**
   * Método maestro que ejecuta toda la tubería de renderizado de un fotograma
   */
  public renderFrame(
    star: StarConfig,
    starPos: Vector2D,
    bodies: CelestialBody[],
    anomalies: SpaceAnomaly[] = []
  ): void {
    this.clearWithPhosphorPersistence();
    this.drawHUDGrid();
    this.drawStar(star, starPos);
    this.drawAnomalies(anomalies);

    for (const body of bodies) {
      this.drawTrail(body);
      this.drawVectors(star.mass, starPos, body);
      this.drawBody(body);
    }
  }

  private hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}