# ORB-SYS // HUD — Simulador Orbital 2D

> **Aplicación web interactiva (SPA)** para simular, visualizar y contrastar la mecánica orbital y gravitatoria en 2D bajo una estética retro-futurista (*Cassette Futurism* inspirada en monitores CRT de fósforo y osciloscopios de los años 70/80).

El proyecto está construido sobre una arquitectura estática optimizada para **Cloudflare Pages**, combinando la modularidad de **Next.js (App Router)** y **React + CSS Modules** para la interfaz HUD con un **motor físico en TypeScript puro** desacoplado y un renderizador de alto rendimiento en **HTML5 Canvas 2D**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **Framework Base** | **Next.js (App Router)** + **TypeScript** | Enrutamiento estático, tipado estricto y compilación optimizada con Turbopack. |
| **Alojamiento / Hosting** | **Cloudflare Pages** | Despliegue global estático (`output: 'export'`) directo desde GitHub. Sin backend ni SSR. |
| **Interfaz & HUD** | **React** + **CSS Modules** | Máquina de estados de navegación, controles deslizantes, estética CRT adaptable y telemetría. |
| **Motor Físico** | **TypeScript Puro** | Gravitación universal, integrador de Euler semi-implícito (simpéctico) y paso de tiempo fijo (`dt = 1/60`). |
| **Renderizado Gráfico** | **HTML5 Canvas 2D** | Bucle a 60 FPS (`requestAnimationFrame`), persistencia de fósforo (estelas), bloom estelar y vectores dinámicos. |

---

## 📐 Principio de Separación Arquitectónica

Para asegurar fluidez continua a 60 FPS sin ralentizaciones provocadas por renderizados de React:

1. **Física con paso fijo (`dt = 1/60 s`):** El cálculo físico corre en un ciclo temporal constante, desacoplado de los FPS de la pantalla.
2. **Canvas 2D autónomo:** Dibuja la estrella central, planetas, estelas orbitales mediante barrido semitransparente (`rgba(8, 10, 15, 0.12)`) y vectores $\vec{v}_t$ y $\vec{F}_g$.
3. **Telemetría a menor frecuencia:** Los datos numéricos para el panel HUD se muestrean periódicamente (ej. 10 Hz) para no sobrecargar el árbol de componentes React.

---

## 📂 Estructura del Proyecto

La estructura base ya se encuentra completamente inicializada y lista para la implementación modular:

```text
stellar-simulator/
├── docs/                                # Documentación técnica y propuestas
│   ├── Propuesta de proyecto - Simulador orbital.pdf   # Especificación física y diseño UX
│   ├── propuesta-stack-orbital.pdf                     # Arquitectura técnica final aprobada
│   ├── ARQUITECTURA.md                                 # Resumen completo de diseño y ecuaciones
│   ├── ROADMAP.md                                      # Plan de fases y entregables del equipo
│   └── CLOUDFLARE_PAGES.md                             # Parámetros y guía de despliegue
├── public/                              # Activos estáticos públicos
├── src/
│   ├── app/                             # Next.js App Router (Layout y SPA estática)
│   │   ├── globals.css                  # Tokens CRT (variables CSS) y reset
│   │   ├── layout.tsx                   # Layout raíz y metadatos del simulador
│   │   ├── page.module.css              # Contenedor principal de la aplicación
│   │   └── page.tsx                     # Punto de anclaje de Canvas y HUD
│   ├── components/                      # Componentes React con CSS Modules
│   │   ├── canvas/
│   │   │   ├── OrbitCanvas.module.css   # Estilos del lienzo 2D
│   │   │   └── OrbitCanvas.tsx          # Componente React contenedor del Canvas
│   │   ├── controls/
│   │   │   └── PlaybackControls.tsx     # Controles Play, Pause, Step y Time Warp
│   │   └── hud/
│   │       ├── EnergyChart.tsx          # Gráfico de balance energético (K vs. U vs. E)
│   │       ├── hud.module.css           # Estilos de módulos CSS para paneles HUD
│   │       ├── OrbitControls.tsx        # Inyección de parámetros (masa, radio, velocidad)
│   │       ├── StarSelector.tsx         # Selector interactivo de estrellas (Clases M, G, O, Neutrones)
│   │       └── TelemetryPanel.tsx       # Métricas en vivo y comparador teórico vs. simulado
│   ├── config/                          # Catálogos y configuración
│   │   ├── physics.constants.ts         # Constantes de simulación UAS (G = 1000, dt fijo)
│   │   └── StarPresets.ts               # Constantes de tipos espectrales estelares
│   ├── physics/                         # Núcleo del motor físico (cálculo desacoplado)
│   │   ├── CelestialBody.ts             # Entidad orbital (estado cinemático y estela)
│   │   ├── PhysicsEngine.ts             # Integrador numérico y cálculo de fuerzas
│   │   ├── TheoreticalCalc.ts           # Fórmulas analíticas (Kepler y velocidad ideal)
│   │   ├── types.ts                     # Interfaces cinemáticas y vectoriales
│   │   └── Vector2D.ts                  # Operaciones de álgebra lineal 2D
│   ├── render/                          # Motor gráfico en Canvas 2D
│   │   ├── CanvasRenderer.ts            # Dibujo de estrellas, bloom, estelas y vectores
│   │   └── types.ts                     # Viewport y opciones de renderizado
│   └── types/                           # Definiciones de tipos globales y dominio
│       └── index.ts
├── next.config.ts                       # Configuración estática (output: 'export')
├── package.json                         # Dependencias y scripts
└── tsconfig.json                        # Configuración de TypeScript
```

---

## 🚀 Guía de Ejecución Local

### 1. Requisitos Previos
- **Node.js**: Versión 18.18+ o superior (recomendado: Node.js 20 o 22 LTS).
- **npm**: Versión 9+ o superior.

Verifica tus versiones instaladas:
```bash
node -v
npm -v
```

---

### 2. Instalación de Dependencias
Si clonas el repositorio por primera vez, instala los paquetes requeridos:
```bash
npm install
```

---

### 3. Modo Desarrollo (Hot Reload)
Inicia el servidor local de desarrollo con recarga en caliente:
```bash
npm run dev
```
Abre en tu navegador [http://localhost:3000](http://localhost:3000) para ver la aplicación en ejecución.

---

### 4. Compilación Estática para Producción
Para generar el paquete estático tal como se distribuirá en **Cloudflare Pages**:
```bash
npm run build
```
- Este comando compila TypeScript, optimiza los bundles y genera la carpeta estática **`out/`** conteniendo `index.html`, `404.html` y los recursos en `_next/`.

---

### 5. Previsualización Local del Build Estático
Para comprobar exactamente cómo se comportará el sitio en Cloudflare Pages antes de subirlo a GitHub:
```bash
npm run preview
# O alternativamente:
npx serve out
```
Esto levantará un servidor HTTP estático local sirviendo directamente la carpeta `out/`.

---

### 6. Verificación de Código y Tipos (Linting)
Para validar que no existan errores de tipado o formato:
```bash
npm run lint
```

---

## ☁️ Publicación en Cloudflare Pages

El repositorio está listo para despliegue continuo mediante conexión a GitHub en el panel de Cloudflare Pages:

| Parámetro | Configuración |
| :--- | :--- |
| **Framework preset** | `None` o `Next.js (Static HTML Export)` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Root directory** | `/` |

---

## 🗺️ Fases del Proyecto (Roadmap)

1. **Fase 1 — Núcleo Matemático y Motor Físico:** Implementación de `Vector2D`, `CelestialBody`, `PhysicsEngine` y `TheoreticalCalc` con pruebas de estabilidad orbital y período de Kepler (< 0.5% de error).
2. **Fase 2 — Renderizador 2D en Canvas:** Dibujo a 60 FPS con estelas de persistencia de fósforo, resplandor estelar 2D (bloom) y proyección de vectores tangenciales y centrípetos.
3. **Fase 3 — Interfaz HUD y Flujo de Navegación:** Componentes de control, selector de estrella, inyección orbital con auto-calibración y máquina de estados.
4. **Fase 4 — Telemetría, Comparativa Teórica y Pruebas:** Minigráfica de balance energético ($K$ vs. $U$), instrumentación en vivo y tabla de validación teórica vs. simulada para la evaluación académica.

Para detalles exhaustivos, consulta los documentos en [docs/](file:///c:/dev/PersonalProjects/stellar-simulator/docs).
