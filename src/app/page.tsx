import styles from "./page.module.css";
import { OrbitCanvas } from "@/components/canvas/OrbitCanvas";
import { WelcomeModal } from "@/components/hud/WelcomeModal";

export default function Home() {
  return (
    <main className={styles.mainContainer} suppressHydrationWarning>
      {/* Contenedor del Canvas 2D (Fase 2) */}
      <OrbitCanvas />

      {/* Ventana técnica informativa del estado de inicialización */}
      <WelcomeModal />

      {/* Los paneles de HUD y Controles (Fase 3 y 4) se integrarán aquí */}
    </main>
  );
}
