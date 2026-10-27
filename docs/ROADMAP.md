# Plan de Desarrollo por Fases (Roadmap)

Este plan de desarrollo organiza el trabajo de implementación de **ORB-SYS // HUD** en 4 fases secuenciales y modulares, garantizando entregables verificables en cada etapa.

---

## Fase 1: Núcleo Matemático y Motor Físico

- **Objetivo:**
  Programar y verificar las clases y funciones del motor físico de forma completamente desacoplada de la interfaz gráfica y de React.
- **Módulos Involucrados:**
  - `src/physics/Vector2D.ts`: Álgebra vectorial (suma, resta, magnitud, producto punto, normalización, escalado).
  - `src/physics/CelestialBody.ts`: Estado cinemático del cuerpo (posición, velocidad, masa, historial de estela).
  - `src/physics/PhysicsEngine.ts`: Integrador simpéctico (Euler semi-implícito), fuerza gravitatoria universal, descomposición de aceleración tangencial/centrípeta y energías ($K$, $U$, $E_{total}$).
  - `src/physics/TheoreticalCalc.ts`: Soluciones cerradas para velocidad circular ideal ($v_{teo}$) y período de Kepler ($T_{teo}$).
- **Criterio de Aceptación / Entregable Verificable:**
  Pruebas unitarias/consola en las que un cuerpo en órbita circular teórica ($v_0 = \sqrt{GM/r_0}$) conserve su radio de forma estable tras 1,000 iteraciones con un error de período inferior al 0.5% frente a Kepler.

---

## Fase 2: Renderizador 2D y Efectos Sci-Fi en Canvas

- **Objetivo:**
  Implementar la capa de visualización gráfica en HTML5 Canvas con el bucle continuo a 60 FPS.
- **Módulos Involucrados:**
  - `src/render/CanvasRenderer.ts`: Inicialización del contexto 2D, transformación de coordenadas (mundo a pantalla) y zoom.
  - `src/components/canvas/OrbitCanvas.tsx`: Ciclo con `requestAnimationFrame` y sincronización con el motor.
- **Efectos Visuales Especificados:**
  1. *Persistencia de Fósforo:* Efecto estela mediante barrido con semitransparencia (`rgba(8, 10, 15, 0.12)`) en vez de borrado total.
  2. *Bloom Estelar 2D:* Resplandor del núcleo estelar mediante `ctx.globalCompositeOperation = 'lighter'`, gradientes radiales y `shadowBlur` según la clase espectral.
  3. *Rejilla HUD y Proyección de Vectores:* Cuadrícula técnica sutil y flechas en pantalla que representan la velocidad tangencial ($\vec{v}_t$) y la fuerza gravitatoria ($\vec{F}_g$) escaladas dinámicamente.
- **Criterio de Aceptación / Entregable Verificable:**
  Lienzo interactivo fluido que dibuja el sistema estelar y las órbitas con la estética Cassette Futurism sin caídas de framerate.

---

## Fase 3: Interfaz HUD Analógica y Flujo de Navegación

- **Objetivo:**
  Construir la experiencia de usuario y máquina de estados mediante componentes de React con CSS Modules.
- **Módulos Involucrados:**
  - `src/components/hud/StarSelector.tsx`: Selector interactivo de estrellas según clasificación espectral (M, G, O, Neutrones opcional).
  - `src/components/hud/OrbitControls.tsx`: Sliders numéricos para radio inicial ($r$), masa del satélite ($m$) y velocidad tangencial ($v_t$), incluyendo el botón **"Auto-Calibrar Velocidad Circular"**.
  - `src/components/controls/PlaybackControls.tsx`: Botones Play, Pausa, Paso a Paso (Step) y selector Time Warp (0.5x, 1x, 2x, 5x).
  - Máquina de estados: Navegación fluida entre Estado 1 (Mapa Estelar) y Estado 2/3 (Simulación en cabina) sin recargar la página.
- **Criterio de Aceptación / Entregable Verificable:**
  Flujo completo de navegación funcional en el navegador: selección de estrella $\rightarrow$ inyección de satélite $\rightarrow$ control de simulación y reinicio.

---

## Fase 4: Telemetría Gráfica, Comparador Teórico y Pruebas

- **Objetivo:**
  Vincular las métricas calculadas en el motor con los paneles de instrumentación HUD en tiempo real.
- **Módulos Involucrados:**
  - `src/components/hud/TelemetryPanel.tsx`: Lectura en vivo de distancias, velocidades, aceleraciones y fuerzas.
  - Módulo Comparador Teórico vs. Simulado: Tabla en tiempo real que contrasta $v_{teo}$ vs. $v_{sim}$, $T_{teo}$ vs. $T_{sim}$ y muestra el % de error o excentricidad.
  - `src/components/hud/EnergyChart.tsx`: Gráfica visual del balance energético (Cinética $K$ vs. Potencial $U$ vs. Mecánica total $E$).
- **Criterio de Aceptación / Entregable Verificable:**
  Panel de telemetría reactivo que demuestra visualmente la ley de conservación de la energía y valida la precisión matemática del simulador ante la evaluación docente.
