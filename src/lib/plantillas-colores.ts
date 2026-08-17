// Plantillas de colores para el selector del panel admin.
// Para agregar una plantilla nueva solo hace falta sumar un objeto al array PLANTILLAS_COLORES.
import { esColorHexValido } from "@/lib/contraste/es-color-hex-valido";

export interface PlantillaColor {
  id: string;
  nombre: string;
  descripcion: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
}

export const PLANTILLAS_COLORES: PlantillaColor[] = [
  // ─────────────────────────────────────
  // CLÁSICAS / PROFESIONALES
  // ─────────────────────────────────────

  {
    id: "barberia",
    nombre: "Clásica",
    descripcion: "Cálida, clásica y con personalidad.",
    primaryColor: "#D97706",
    secondaryColor: "#78350F",
    bgColor: "#0D0A07",
  },
  {
    id: "elegante",
    nombre: "Elegante",
    descripcion: "Sobria, refinada y profesional.",
    primaryColor: "#1E293B",
    secondaryColor: "#F8FAFC",
    bgColor: "#0B1220",
  },
  {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "Azul confiable para una imagen empresarial.",
    primaryColor: "#1D4ED8",
    secondaryColor: "#EFF6FF",
    bgColor: "#0A1120",
  },
  {
    id: "ejecutivo",
    nombre: "Ejecutivo",
    descripcion: "Seriedad y autoridad con un estilo moderno.",
    primaryColor: "#334155",
    secondaryColor: "#E2E8F0",
    bgColor: "#0F172A",
  },
  {
    id: "navy",
    nombre: "Navy",
    descripcion: "Clásica, sólida y corporativa.",
    primaryColor: "#2563EB",
    secondaryColor: "#DBEAFE",
    bgColor: "#0F172A",
  },

  // ─────────────────────────────────────
  // MINIMALISTAS / NEUTRAS
  // ─────────────────────────────────────

  {
    id: "minimalista",
    nombre: "Minimalista",
    descripcion: "Neutros limpios y sin distracciones.",
    primaryColor: "#18181B",
    secondaryColor: "#F4F4F5",
    bgColor: "#09090B",
  },
  {
    id: "grafito",
    nombre: "Grafito",
    descripcion: "Oscura, moderna y discreta.",
    primaryColor: "#52525B",
    secondaryColor: "#E4E4E7",
    bgColor: "#18181B",
  },
  {
    id: "arena",
    nombre: "Arena",
    descripcion: "Neutra, cálida y relajada.",
    primaryColor: "#A16207",
    secondaryColor: "#FEF3C7",
    bgColor: "#FFFBEB",
  },
  {
    id: "cream",
    nombre: "Cream",
    descripcion: "Suave, luminosa y acogedora.",
    primaryColor: "#92400E",
    secondaryColor: "#FEF3C7",
    bgColor: "#FFFCF5",
  },

  // ─────────────────────────────────────
  // NATURALES
  // ─────────────────────────────────────

  {
    id: "natural",
    nombre: "Natural",
    descripcion: "Verdes profundos con aire de frescura.",
    primaryColor: "#166534",
    secondaryColor: "#F0FDF4",
    bgColor: "#07130A",
  },
  {
    id: "sage",
    nombre: "Sage",
    descripcion: "Verde suave y equilibrado.",
    primaryColor: "#4D7C62",
    secondaryColor: "#ECFDF5",
    bgColor: "#F7FAF8",
  },
  {
    id: "forest",
    nombre: "Forest",
    descripcion: "Profunda, natural y sofisticada.",
    primaryColor: "#15803D",
    secondaryColor: "#DCFCE7",
    bgColor: "#052E16",
  },
  {
    id: "olive",
    nombre: "Oliva",
    descripcion: "Cálida, orgánica y diferente.",
    primaryColor: "#657A3A",
    secondaryColor: "#F1F5D8",
    bgColor: "#161A0B",
  },

  // ─────────────────────────────────────
  // FRÍAS
  // ─────────────────────────────────────

  {
    id: "fresco",
    nombre: "Fresco",
    descripcion: "Celeste luminoso y juvenil.",
    primaryColor: "#0EA5E9",
    secondaryColor: "#F0F9FF",
    bgColor: "#0B2433",
  },
  {
    id: "arctic",
    nombre: "Arctic",
    descripcion: "Fría, limpia y moderna.",
    primaryColor: "#0891B2",
    secondaryColor: "#CFFAFE",
    bgColor: "#083344",
  },
  {
    id: "ice",
    nombre: "Ice",
    descripcion: "Clara, fresca y minimalista.",
    primaryColor: "#0284C7",
    secondaryColor: "#E0F2FE",
    bgColor: "#F8FCFF",
  },
  {
    id: "ocean",
    nombre: "Ocean",
    descripcion: "Profunda y equilibrada como el océano.",
    primaryColor: "#0369A1",
    secondaryColor: "#E0F2FE",
    bgColor: "#082F49",
  },

  // ─────────────────────────────────────
  // MODERNAS
  // ─────────────────────────────────────

  {
    id: "moderno",
    nombre: "Moderno",
    descripcion: "Turquesa actual y despejado.",
    primaryColor: "#0F766E",
    secondaryColor: "#F0FDFA",
    bgColor: "#04211E",
  },
  {
    id: "teal",
    nombre: "Teal",
    descripcion: "Equilibrio entre tecnología y frescura.",
    primaryColor: "#0D9488",
    secondaryColor: "#CCFBF1",
    bgColor: "#042F2E",
  },
  {
    id: "indigo",
    nombre: "Indigo",
    descripcion: "Moderna, elegante y tecnológica.",
    primaryColor: "#4F46E5",
    secondaryColor: "#E0E7FF",
    bgColor: "#1E1B4B",
  },
  {
    id: "violeta",
    nombre: "Violeta",
    descripcion: "Creativa, moderna y sofisticada.",
    primaryColor: "#7C3AED",
    secondaryColor: "#F5F3FF",
    bgColor: "#150F2E",
  },

  // ─────────────────────────────────────
  // FUTURISTAS
  // ─────────────────────────────────────

  {
    id: "cyber",
    nombre: "Cyber",
    descripcion: "Intensa, tecnológica y futurista.",
    primaryColor: "#06B6D4",
    secondaryColor: "#CFFAFE",
    bgColor: "#020617",
  },
  {
    id: "electric",
    nombre: "Electric",
    descripcion: "Contraste fuerte con energía digital.",
    primaryColor: "#2563EB",
    secondaryColor: "#22D3EE",
    bgColor: "#030712",
  },
  {
    id: "aurora",
    nombre: "Aurora",
    descripcion: "Vibrante y experimental.",
    primaryColor: "#8B5CF6",
    secondaryColor: "#2DD4BF",
    bgColor: "#0F0A1F",
  },
  {
    id: "plasma",
    nombre: "Plasma",
    descripcion: "Intensa, oscura y llena de energía.",
    primaryColor: "#D946EF",
    secondaryColor: "#A855F7",
    bgColor: "#18051F",
  },
  {
    id: "neon",
    nombre: "Neon",
    descripcion: "Impactante y de inspiración digital.",
    primaryColor: "#84CC16",
    secondaryColor: "#D9F99D",
    bgColor: "#101A05",
  },

  // ─────────────────────────────────────
  // CÁLIDAS
  // ─────────────────────────────────────

  {
    id: "terracota",
    nombre: "Terracota",
    descripcion: "Cálida, artesanal y cercana.",
    primaryColor: "#C2410C",
    secondaryColor: "#FFEDD5",
    bgColor: "#27100A",
  },
  {
    id: "cobre",
    nombre: "Cobre",
    descripcion: "Cálida y sofisticada con carácter.",
    primaryColor: "#B45309",
    secondaryColor: "#FDE68A",
    bgColor: "#1C1105",
  },
  {
    id: "sunset",
    nombre: "Sunset",
    descripcion: "Cálida, energética y llamativa.",
    primaryColor: "#EA580C",
    secondaryColor: "#FED7AA",
    bgColor: "#2A1005",
  },
  {
    id: "coral",
    nombre: "Coral",
    descripcion: "Amigable, alegre y contemporánea.",
    primaryColor: "#F43F5E",
    secondaryColor: "#FFE4E6",
    bgColor: "#2A0A12",
  },

  // ─────────────────────────────────────
  // CREATIVAS / JUVENILES
  // ─────────────────────────────────────

  {
    id: "vibrante",
    nombre: "Vibrante",
    descripcion: "Violeta intenso con mucha energía.",
    primaryColor: "#7C3AED",
    secondaryColor: "#F5F3FF",
    bgColor: "#150F2E",
  },
  {
    id: "candy",
    nombre: "Candy",
    descripcion: "Colorida, divertida y amigable.",
    primaryColor: "#EC4899",
    secondaryColor: "#FCE7F3",
    bgColor: "#2A0A1D",
  },
  {
    id: "bubblegum",
    nombre: "Bubblegum",
    descripcion: "Suave, divertida y juvenil.",
    primaryColor: "#DB2777",
    secondaryColor: "#FBCFE8",
    bgColor: "#FFF7FB",
  },
  {
    id: "lemon",
    nombre: "Lemon",
    descripcion: "Alegre, luminosa y energética.",
    primaryColor: "#CA8A04",
    secondaryColor: "#FEF9C3",
    bgColor: "#1C1805",
  },
  {
    id: "peach",
    nombre: "Peach",
    descripcion: "Cálida, suave y cercana.",
    primaryColor: "#EA580C",
    secondaryColor: "#FFEDD5",
    bgColor: "#FFF8F3",
  },

  // ─────────────────────────────────────
  // PREMIUM / OSCURAS
  // ─────────────────────────────────────

  {
    id: "noir",
    nombre: "Noir",
    descripcion: "Oscura, exclusiva y sofisticada.",
    primaryColor: "#A1A1AA",
    secondaryColor: "#27272A",
    bgColor: "#09090B",
  },
  {
    id: "royal",
    nombre: "Royal",
    descripcion: "Elegante, profunda y distinguida.",
    primaryColor: "#8B5CF6",
    secondaryColor: "#EDE9FE",
    bgColor: "#120B26",
  },
  {
    id: "burgundy",
    nombre: "Burgundy",
    descripcion: "Intensa, clásica y sofisticada.",
    primaryColor: "#9F1239",
    secondaryColor: "#FFE4E6",
    bgColor: "#1F080F",
  },
  {
    id: "emerald",
    nombre: "Emerald",
    descripcion: "Premium, profunda y refinada.",
    primaryColor: "#059669",
    secondaryColor: "#D1FAE5",
    bgColor: "#022C22",
  },
];

for (const plantilla of PLANTILLAS_COLORES) {
  if (
    !esColorHexValido(plantilla.primaryColor) ||
    !esColorHexValido(plantilla.secondaryColor) ||
    !esColorHexValido(plantilla.bgColor)
  ) {
    throw new Error(`La plantilla "${plantilla.nombre}" define un color inválido.`);
  }
}
