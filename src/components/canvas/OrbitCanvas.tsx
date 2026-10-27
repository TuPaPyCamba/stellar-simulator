"use client";

import styles from "./OrbitCanvas.module.css";

export interface OrbitCanvasProps {
  className?: string;
}

/**
 * Contenedor del lienzo HTML5 Canvas para el renderizado 2D orbital
 * (Esqueleto estructural sin lógica de dibujo)
 */
export function OrbitCanvas({ className }: OrbitCanvasProps) {
  const containerClass = className
    ? `${styles.canvasContainer} ${className}`
    : styles.canvasContainer;

  return (
    <div className={containerClass} suppressHydrationWarning>
      <canvas className={styles.canvas} />
    </div>
  );
}
