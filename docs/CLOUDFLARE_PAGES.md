# Despliegue en Cloudflare Pages

El simulador orbital **ORB-SYS // HUD** está configurado como una exportación estática de Next.js (`output: 'export'`). Esto permite alojarlo y distribuirlo en **Cloudflare Pages** de manera 100% gratuita, ultrarrápida y sin necesidad de funciones SSR de servidor.

---

## 1. Parámetros de Configuración en Cloudflare Pages

Al vincular el repositorio de GitHub en el panel de Cloudflare Pages:

| Parámetro | Valor a configurar |
| :--- | :--- |
| **Framework preset** | `None` / `Next.js (Static HTML Export)` |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Root directory** | `/` (raíz del repositorio) |
| **Node.js Version** | `>= 18.0.0` (recomendado: 20 o 22) |

### Variable de entorno recomendada (opcional en Cloudflare Pages):
```env
NODE_VERSION=20
```

---

## 2. Cómo funciona el proceso de Build

1. Al ejecutar `npm run build`:
   - Next.js (con Turbopack) compila los componentes de React, estilos CSS Modules y scripts de TypeScript.
   - Gracias a `output: "export"` en `next.config.ts`, Next.js genera un bundle puramente estático dentro de la carpeta `out/`.
   - La carpeta `out/` contiene el archivo `index.html`, los bundles de JavaScript/CSS optimizados en `_next/` y el archivo `404.html`.
2. Cloudflare Pages toma el contenido de `out/` y lo despliega directamente a su red global perimetral (Edge CDN).

---

## 3. Verificación Local de la Exportación Estática

Puedes compilar y probar la versión estática localmente con los siguientes comandos:

```bash
# 1. Compilar el proyecto estático
npm run build

# 2. Servir el directorio out/ localmente para verificar
npx serve out
```
