import { StarConfig } from "@/types";

/**
 * Catálogo de estrellas preconfiguradas según clasificación espectral
 * (Esqueleto de presets - valores a definir en la fase correspondiente)
 */
export const STAR_PRESETS: Record<string, StarConfig> = {
  // Clase M - Enana Roja
  RED_DWARF: {
    id: "star_m",
    name: "Proxima-M",
    spectralClass: "M",
    mass: 500,
    radius: 12,
    color: "#ff4d4d",
    description: "Enana Roja: baja masa, radio pequeño, brillo rojizo tenue.",
  },
  // Clase G - Enana Amarilla (Referencia tipo Sol)
  SOL_TYPE: {
    id: "star_g",
    name: "Helios-G",
    spectralClass: "G",
    mass: 1000,
    radius: 18,
    color: "#ffd700",
    description: "Enana Amarilla: masa media, referencia base, brillo dorado.",
  },
  // Clase O - Gigante Azul
  BLUE_GIANT: {
    id: "star_o",
    name: "Rigel-O",
    spectralClass: "O",
    mass: 3000,
    radius: 26,
    color: "#00ccff",
    description: "Gigante Azul: masa extrema, pozo gravitatorio intenso, resplandor azul-blanco.",
  },
  // Estrella de Neutrones (Opcional/Bonus)
  NEUTRON_STAR: {
    id: "star_neutron",
    name: "Pulsar-N",
    spectralClass: "NEUTRON",
    mass: 5000,
    radius: 6,
    color: "#e6ffff",
    description: "Estrella de Neutrones: masa altísima en radio mínimo para velocidades extremas.",
  },
};
