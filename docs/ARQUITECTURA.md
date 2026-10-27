# ORB-SYS // HUD — Arquitectura del Sistema

Este documento sintetiza las decisiones de diseño y arquitectura técnica consensuadas en los documentos de propuesta del proyecto (*Simulador Orbital - ORB-SYS // HUD* y *Propuesta Técnica de Stack Orbital*).

---

## 1. Resumen Ejecutivo y Filosofía del Stack

El proyecto es una **Single Page Application (SPA)** interactiva que simula la mecánica orbital y gravitatoria de dos cuerpos en 2D, emulando una consola de telemetría espacial retro-futurista (*Cassette Futurism*).

### Decisión de Arquitectura Final
Para la entrega y evaluación académica se seleccionó un enfoque de **Next.js estático (`output: 'export'`)** orientado a **Cloudflare Pages**:
- **Despliegue serverless / estático:** Los archivos HTML, JS y CSS compilados se distribuyen globalmente en el CDN de Cloudflare Pages desde el directorio `out/`.
- **Cero backend ni base de datos:** Toda la simulación física, el bucle temporal y el renderizado gráfico en Canvas 2D se ejecutan en el navegador del cliente.
- **Sin SSR ni Server Actions:** Garantiza simplicidad de mantenimiento, despliegue instantáneo mediante Git y portabilidad absoluta.

---

## 2. Mapa de Responsabilidades del Stack

| Capa / Tecnología | Responsabilidad Principal |
| :--- | :--- |
| **Next.js (App Router) + TypeScript** | Enrutamiento estático, layout base, estructura tipada y configuración de build. |
| **React + CSS Modules** | Paneles de control HUD, sliders numéricos, máquina de estados de navegación y estética adaptable. |
| **Motor Físico (TypeScript puro)** | Ecuaciones de gravitación universal, aceleración tangencial/centrípeta, integrador simpéctico y telemetría. |
| **Canvas 2D (HTML5)** | Renderizado a 60 FPS, barrido con persistencia de fósforo (estelas), bloom estelar y vectores en pantalla. |
| **GitHub + Cloudflare Pages** | Integración continua, versionado y publicación pública bajo HTTPS. |

---

## 3. Principio de Separación: Física vs. Render vs. React

Para asegurar fluidez (60 FPS) y precisión matemática sin degradación por cálculo o renderizado de React:
1. **Física con paso fijo (`dt = 1/60 s`):**
   - El motor físico corre con paso de tiempo constante independientemente de variaciones en la tasa de refresco del monitor.
2. **Renderizado en Canvas 2D:**
   - La estrella central, los cuerpos orbitales, las estelas de fósforo y los vectores de velocidad ($\vec{v}_t$) y fuerza gravitatoria ($\vec{F}_g$) se dibujan directamente sobre el canvas usando `requestAnimationFrame`.
3. **Telemetría desacoplada:**
   - La telemetría y métricas de energía se calculan o muestrean a menor frecuencia (ej. 10 Hz) para no saturar las actualizaciones de estado en los componentes React de la interfaz.

---

## 4. Modelo Físico y Matemático

Para evitar la manipulación de constantes astronómicas con magnitudes de $10^{30} \text{ kg}$, el simulador opera con **Unidades Astronómicas de Simulación (UAS)** normalizadas donde $G = 1000$:

### 4.1. Gravitación Universal y Fuerza Centrípeta
$$\vec{F}_g = G \frac{M \cdot m}{r^2} \hat{r}$$
$$F_c = \frac{m \cdot v_t^2}{r}$$

### 4.2. Integrador Numérico
Se emplea **Integración de Euler Semi-Implícita (Euler Simpéctico)** para garantizar la conservación de la energía y evitar que errores de redondeo amplifiquen la órbita con el tiempo:
1. $\vec{v}_{t+\Delta t} = \vec{v}_t + \vec{a}_t \cdot \Delta t$
2. $\vec{x}_{t+\Delta t} = \vec{x}_t + \vec{v}_{t+\Delta t} \cdot \Delta t$

### 4.3. Validación Teórica vs. Simulación
El sistema compara analíticamente:
- **Velocidad circular teórica:**
  $$v_{teo} = \sqrt{\frac{G \cdot M}{r_0}}$$
- **Período orbital teórico (3ra Ley de Kepler):**
  $$T_{teo} = 2\pi \sqrt{\frac{r_0^3}{G \cdot M}}$$
- **Desviación / Error porcentual:**
  $$\% \text{Error} = \frac{|T_{teo} - T_{sim}|}{T_{teo}} \times 100$$

---

## 5. Dirección de Arte y Estética Visual

- **Concepto:** *Sci-Fi Analógico / Cassette Futurism* (monitores CRT de fósforo y osciloscopios).
- **Paleta de Colores:**
  - Fondo espacial: `#080A0F`
  - Rejilla y acentos fósforo/cian: `#00FFCC` (opacidad base 15%)
  - Vectores y advertencias en ámbar: `#FFB000`
  - Alertas críticas en carmesí: `#FF3366`
- **Técnicas en Canvas 2D:**
  - *Estelas orbitales:* Relleno semitransparente con alpha decay (`rgba(8, 10, 15, 0.12)`) en vez de `clearRect()`.
  - *Bloom estelar:* `ctx.globalCompositeOperation = 'lighter'` con gradientes radiales y `ctx.shadowBlur`.
  - *Vectores dinámicos:* Flechas en tiempo real para $\vec{v}_t$ y $\vec{F}_g$.

---

## 6. Estructura de Directorios del Proyecto

```text
stellar-simulator/
├── docs/                                # Documentación y especificaciones
│   ├── Propuesta de proyecto - Simulador orbital.pdf
│   ├── propuesta-stack-orbital.pdf
│   ├── ARQUITECTURA.md
│   ├── ROADMAP.md
│   └── CLOUDFLARE_PAGES.md
├── public/                              # Activos estáticos públicos
├── src/
│   ├── app/                             # Next.js App Router (Páginas y layout estático)
│   │   ├── globals.css                  # Variables CSS (paleta CRT) y reset
│   │   ├── layout.tsx                   # Layout raíz y metadatos
│   │   ├── page.module.css              # Módulo CSS del contenedor principal
│   │   └── page.tsx                     # Punto de anclaje de la SPA
│   ├── components/                      # Componentes React (interfaz y HUD)
│   │   ├── canvas/
│   │   │   ├── OrbitCanvas.module.css
│   │   │   └── OrbitCanvas.tsx          # Lienzo Canvas 2D
│   │   ├── controls/
│   │   │   └── PlaybackControls.tsx     # Controles Play/Pause/TimeWarp
│   │   └── hud/
│   │       ├── EnergyChart.tsx          # Minigráfica de energía
│   │       ├── hud.module.css
│   │       ├── OrbitControls.tsx        # Inyección de parámetros orbitales
│   │       ├── StarSelector.tsx         # Catálogo de estrellas
│   │       └── TelemetryPanel.tsx       # Telemetría y validación teórica
│   ├── config/                          # Catálogos y constantes
│   │   ├── physics.constants.ts         # Constante G, dt fijo, tasas de muestreo
│   │   └── StarPresets.ts               # Constantes de estrellas Clase M, G, O, Neutrones
│   ├── physics/                         # Núcleo del motor físico (cálculo puro)
│   │   ├── CelestialBody.ts             # Entidad orbital
│   │   ├── PhysicsEngine.ts             # Integrador numérico y fuerzas
│   │   ├── TheoreticalCalc.ts           # Kepler y fórmulas cerradas
│   │   ├── types.ts                     # Interfaces del dominio físico
│   │   └── Vector2D.ts                  # Álgebra de vectores 2D
│   ├── render/                          # Motor gráfico en Canvas 2D
│   │   ├── CanvasRenderer.ts            # Dibujo de estrellas, órbitas y vectores
│   │   └── types.ts                     # Opciones de renderizado y viewport
│   └── types/                           # Definiciones de tipos globales compartidos
│       └── index.ts
├── next.config.ts                       # Configuración estática ('output: export')
├── package.json
└── tsconfig.json
```
