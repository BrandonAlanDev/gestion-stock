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
  // ECOMMERCE / TIENDAS
  // ─────────────────────────────────────

  {
    id: "ecommerce",
    nombre: "Ecommerce",
    descripcion: "Limpia, moderna y versátil para cualquier tienda.",
    primaryColor: "#334155",
    secondaryColor: "#F1F5F9",
    bgColor: "#FFFFFF",
  },

  {
    id: "commerce-blue",
    nombre: "Commerce",
    descripcion: "Azul sobrio y confiable para tiendas online.",
    primaryColor: "#2563EB",
    secondaryColor: "#EFF6FF",
    bgColor: "#FFFFFF",
  },

  {
    id: "store-slate",
    nombre: "Slate",
    descripcion: "Neutral, moderna y adaptable a cualquier producto.",
    primaryColor: "#475569",
    secondaryColor: "#F1F5F9",
    bgColor: "#FFFFFF",
  },

  {
    id: "store-stone",
    nombre: "Stone",
    descripcion: "Neutra y sofisticada para una tienda elegante.",
    primaryColor: "#57534E",
    secondaryColor: "#F5F5F4",
    bgColor: "#FAFAF9",
  },

  // ─────────────────────────────────────
  // ZAPATILLAS / SNEAKERS
  // ─────────────────────────────────────

  {
    id: "sneaker",
    nombre: "Sneaker",
    descripcion: "Urbana, moderna y equilibrada.",
    primaryColor: "#18181B",
    secondaryColor: "#F4F4F5",
    bgColor: "#FFFFFF",
  },

  {
    id: "street",
    nombre: "Street",
    descripcion: "Oscura y urbana para moda streetwear.",
    primaryColor: "#27272A",
    secondaryColor: "#E4E4E7",
    bgColor: "#FAFAFA",
  },

  {
    id: "urban-blue",
    nombre: "Urban Blue",
    descripcion: "Azul profundo con estética contemporánea.",
    primaryColor: "#1E40AF",
    secondaryColor: "#EFF6FF",
    bgColor: "#FFFFFF",
  },

  {
    id: "urban-green",
    nombre: "Urban Green",
    descripcion: "Verde sobrio para una identidad urbana.",
    primaryColor: "#365314",
    secondaryColor: "#F7FEE7",
    bgColor: "#FFFFFF",
  },

  {
    id: "graphite",
    nombre: "Graphite",
    descripcion: "Minimalista, oscura y orientada a producto.",
    primaryColor: "#3F3F46",
    secondaryColor: "#F4F4F5",
    bgColor: "#FFFFFF",
  },

  // ─────────────────────────────────────
  // MODA / ROPA
  // ─────────────────────────────────────

  {
    id: "fashion",
    nombre: "Fashion",
    descripcion: "Elegante y contemporánea para tiendas de moda.",
    primaryColor: "#292524",
    secondaryColor: "#F5F5F4",
    bgColor: "#FFFEFC",
  },

  {
    id: "fashion-beige",
    nombre: "Beige",
    descripcion: "Cálida, limpia y sofisticada.",
    primaryColor: "#78716C",
    secondaryColor: "#F5F5F4",
    bgColor: "#FAF9F7",
  },

  {
    id: "fashion-brown",
    nombre: "Chocolate",
    descripcion: "Cálida y elegante con inspiración editorial.",
    primaryColor: "#5C4033",
    secondaryColor: "#F3E8DF",
    bgColor: "#FCFAF8",
  },

  {
    id: "fashion-navy",
    nombre: "Fashion Navy",
    descripcion: "Clásica y refinada para moda masculina o femenina.",
    primaryColor: "#1E293B",
    secondaryColor: "#F1F5F9",
    bgColor: "#FFFFFF",
  },

  {
    id: "fashion-olive",
    nombre: "Olive",
    descripcion: "Natural, sobria y actual.",
    primaryColor: "#556B2F",
    secondaryColor: "#F1F5E8",
    bgColor: "#FCFDF9",
  },

  // ─────────────────────────────────────
  // BOUTIQUE
  // ─────────────────────────────────────

  {
    id: "boutique",
    nombre: "Boutique",
    descripcion: "Delicada, elegante y contemporánea.",
    primaryColor: "#7C6F64",
    secondaryColor: "#F3F0ED",
    bgColor: "#FFFCFA",
  },

  {
    id: "taupe",
    nombre: "Taupe",
    descripcion: "Neutra y sofisticada para una estética premium.",
    primaryColor: "#665F59",
    secondaryColor: "#F1EFEC",
    bgColor: "#FAF9F7",
  },

  {
    id: "mocca",
    nombre: "Mocca",
    descripcion: "Cálida y refinada con inspiración natural.",
    primaryColor: "#6B4F3A",
    secondaryColor: "#F3E9DF",
    bgColor: "#FCFAF7",
  },

  {
    id: "dust",
    nombre: "Dust",
    descripcion: "Suave, elegante y de inspiración editorial.",
    primaryColor: "#8A7F78",
    secondaryColor: "#F4F1EF",
    bgColor: "#FEFDFB",
  },

  // ─────────────────────────────────────
  // PREMIUM
  // ─────────────────────────────────────

  {
    id: "luxury",
    nombre: "Luxury",
    descripcion: "Sobria y exclusiva para productos premium.",
    primaryColor: "#18181B",
    secondaryColor: "#E7E5E4",
    bgColor: "#FFFFFF",
  },

  {
    id: "premium-navy",
    nombre: "Premium Navy",
    descripcion: "Profunda, elegante y de alto nivel.",
    primaryColor: "#172554",
    secondaryColor: "#E8EEF8",
    bgColor: "#FDFCFA",
  },

  {
    id: "premium-brown",
    nombre: "Premium Brown",
    descripcion: "Cálida y sofisticada para productos exclusivos.",
    primaryColor: "#4A3328",
    secondaryColor: "#EFE5DF",
    bgColor: "#FCFAF8",
  },

  {
    id: "premium-green",
    nombre: "Premium Green",
    descripcion: "Verde profundo con estética refinada.",
    primaryColor: "#14532D",
    secondaryColor: "#EAF4ED",
    bgColor: "#FCFDFC",
  },

  {
    id: "black-white",
    nombre: "Black & White",
    descripcion: "Contraste puro para una identidad minimalista.",
    primaryColor: "#18181B",
    secondaryColor: "#F4F4F5",
    bgColor: "#FFFFFF",
  },

  // ─────────────────────────────────────
  // TECNOLOGÍA
  // ─────────────────────────────────────

  {
    id: "tech",
    nombre: "Tech",
    descripcion: "Azul moderno para productos tecnológicos.",
    primaryColor: "#1D4ED8",
    secondaryColor: "#EFF6FF",
    bgColor: "#FFFFFF",
  },

  {
    id: "tech-slate",
    nombre: "Tech Slate",
    descripcion: "Tecnológica, sobria y profesional.",
    primaryColor: "#334155",
    secondaryColor: "#E2E8F0",
    bgColor: "#F8FAFC",
  },

  {
    id: "tech-indigo",
    nombre: "Tech Indigo",
    descripcion: "Moderna y digital sin ser llamativa.",
    primaryColor: "#4338CA",
    secondaryColor: "#EEF2FF",
    bgColor: "#FFFFFF",
  },

  {
    id: "tech-cyan",
    nombre: "Tech Cyan",
    descripcion: "Fresca y tecnológica con un toque moderno.",
    primaryColor: "#0E7490",
    secondaryColor: "#ECFEFF",
    bgColor: "#FFFFFF",
  },

  // ─────────────────────────────────────
  // HOGAR / DECORACIÓN
  // ─────────────────────────────────────

  {
    id: "home",
    nombre: "Home",
    descripcion: "Cálida y neutra para hogar y decoración.",
    primaryColor: "#57534E",
    secondaryColor: "#F5F5F4",
    bgColor: "#FAFAF9",
  },

  {
    id: "home-sand",
    nombre: "Sand",
    descripcion: "Natural, cálida y relajada.",
    primaryColor: "#8A6A45",
    secondaryColor: "#F5EFE6",
    bgColor: "#FCFAF6",
  },

  {
    id: "home-sage",
    nombre: "Home Sage",
    descripcion: "Suave y natural para decoración.",
    primaryColor: "#64735B",
    secondaryColor: "#EEF2EA",
    bgColor: "#FBFCFA",
  },

  {
    id: "home-earth",
    nombre: "Earth",
    descripcion: "Tonos tierra para una identidad acogedora.",
    primaryColor: "#704F3A",
    secondaryColor: "#F2E8DF",
    bgColor: "#FCFAF7",
  },

  // ─────────────────────────────────────
  // BEAUTY / COSMÉTICA
  // ─────────────────────────────────────

  {
    id: "beauty",
    nombre: "Beauty",
    descripcion: "Suave, limpia y elegante para cosmética.",
    primaryColor: "#806A63",
    secondaryColor: "#F4EFED",
    bgColor: "#FFFDFC",
  },

  {
    id: "beauty-rose",
    nombre: "Rose",
    descripcion: "Rosa apagado con una estética sofisticada.",
    primaryColor: "#9A7375",
    secondaryColor: "#F5EDEE",
    bgColor: "#FFFCFC",
  },

  {
    id: "beauty-mauve",
    nombre: "Mauve",
    descripcion: "Delicada, moderna y sobria.",
    primaryColor: "#806477",
    secondaryColor: "#F2EDF1",
    bgColor: "#FDFCFE",
  },

  {
    id: "beauty-nude",
    nombre: "Nude",
    descripcion: "Neutra y minimalista para marcas de belleza.",
    primaryColor: "#8B6F61",
    secondaryColor: "#F5ECE7",
    bgColor: "#FFFCFA",
  },

  // ─────────────────────────────────────
  // NATURAL / LIFESTYLE
  // ─────────────────────────────────────

  {
    id: "lifestyle",
    nombre: "Lifestyle",
    descripcion: "Natural y moderna para productos variados.",
    primaryColor: "#3F6212",
    secondaryColor: "#F3F7EA",
    bgColor: "#FCFDF9",
  },

  {
    id: "botanical",
    nombre: "Botanical",
    descripcion: "Verde suave inspirado en la naturaleza.",
    primaryColor: "#52705B",
    secondaryColor: "#EDF3EE",
    bgColor: "#FAFCFA",
  },

  {
    id: "earthy",
    nombre: "Earthy",
    descripcion: "Tierra y verdes para una estética orgánica.",
    primaryColor: "#665C48",
    secondaryColor: "#F1EEE7",
    bgColor: "#FAF9F5",
  },

  // ─────────────────────────────────────
  // URBAN / CONTEMPORÁNEAS
  // ─────────────────────────────────────

  {
    id: "urban",
    nombre: "Urban",
    descripcion: "Gris profundo y azul para una tienda actual.",
    primaryColor: "#374151",
    secondaryColor: "#F3F4F6",
    bgColor: "#FFFFFF",
  },

  {
    id: "concrete",
    nombre: "Concrete",
    descripcion: "Industrial, neutra y contemporánea.",
    primaryColor: "#52525B",
    secondaryColor: "#EDEDED",
    bgColor: "#FAFAFA",
  },

  {
    id: "deep-blue",
    nombre: "Deep Blue",
    descripcion: "Azul profundo con una identidad moderna.",
    primaryColor: "#1E3A5F",
    secondaryColor: "#EAF0F6",
    bgColor: "#FBFCFD",
  },

  {
    id: "muted-green",
    nombre: "Muted Green",
    descripcion: "Verde apagado para una estética contemporánea.",
    primaryColor: "#4B6355",
    secondaryColor: "#EDF2EE",
    bgColor: "#FAFCFA",
  },
  // ─────────────────────────────────────
  // ECOMMERCE DARK
  // ─────────────────────────────────────

  {
    id: "dark-commerce",
    nombre: "Dark Commerce",
    descripcion: "Oscura, moderna y versátil para cualquier tienda.",
    primaryColor: "#CBD5E1",
    secondaryColor: "#1E293B",
    bgColor: "#0F172A",
  },

  {
    id: "dark-store",
    nombre: "Dark Store",
    descripcion: "Sobria y elegante para ecommerce moderno.",
    primaryColor: "#E2E8F0",
    secondaryColor: "#1F2937",
    bgColor: "#111827",
  },

  {
    id: "midnight",
    nombre: "Midnight",
    descripcion: "Azul profundo y sofisticado para tiendas premium.",
    primaryColor: "#60A5FA",
    secondaryColor: "#1E3A5F",
    bgColor: "#0B1220",
  },

  {
    id: "midnight-blue",
    nombre: "Midnight Blue",
    descripcion: "Profunda, profesional y contemporánea.",
    primaryColor: "#93C5FD",
    secondaryColor: "#172554",
    bgColor: "#0A1020",
  },

  {
    id: "navy-dark",
    nombre: "Navy Dark",
    descripcion: "Azul oscuro con una estética premium.",
    primaryColor: "#60A5FA",
    secondaryColor: "#1E293B",
    bgColor: "#0F172A",
  },

  // ─────────────────────────────────────
  // DARK SNEAKERS / STREETWEAR
  // ─────────────────────────────────────

  {
    id: "dark-sneaker",
    nombre: "Dark Sneaker",
    descripcion: "Oscura y minimalista para zapatillas y calzado.",
    primaryColor: "#F4F4F5",
    secondaryColor: "#27272A",
    bgColor: "#09090B",
  },

  {
    id: "street-dark",
    nombre: "Street Dark",
    descripcion: "Urbana, sobria y moderna.",
    primaryColor: "#D4D4D8",
    secondaryColor: "#27272A",
    bgColor: "#18181B",
  },

  {
    id: "graphite-dark",
    nombre: "Graphite Dark",
    descripcion: "Gris grafito para una estética industrial.",
    primaryColor: "#E4E4E7",
    secondaryColor: "#3F3F46",
    bgColor: "#18181B",
  },

  {
    id: "urban-dark",
    nombre: "Urban Dark",
    descripcion: "Contemporánea y discreta para moda urbana.",
    primaryColor: "#CBD5E1",
    secondaryColor: "#334155",
    bgColor: "#111827",
  },

  {
    id: "concrete-dark",
    nombre: "Concrete Dark",
    descripcion: "Industrial y minimalista.",
    primaryColor: "#D1D5DB",
    secondaryColor: "#374151",
    bgColor: "#1F2937",
  },

  // ─────────────────────────────────────
  // DARK FASHION
  // ─────────────────────────────────────

  {
    id: "fashion-dark",
    nombre: "Fashion Dark",
    descripcion: "Elegante y editorial para tiendas de moda.",
    primaryColor: "#E7E5E4",
    secondaryColor: "#292524",
    bgColor: "#1C1917",
  },

  {
    id: "chocolate-dark",
    nombre: "Chocolate Dark",
    descripcion: "Cálida y sofisticada con tonos marrones.",
    primaryColor: "#E7D7C9",
    secondaryColor: "#3F2D24",
    bgColor: "#211712",
  },

  {
    id: "taupe-dark",
    nombre: "Taupe Dark",
    descripcion: "Neutra, cálida y refinada.",
    primaryColor: "#D6CCC5",
    secondaryColor: "#3B3531",
    bgColor: "#211E1C",
  },

  {
    id: "olive-dark",
    nombre: "Olive Dark",
    descripcion: "Verde oliva profundo para una estética sofisticada.",
    primaryColor: "#C5D0A8",
    secondaryColor: "#35401F",
    bgColor: "#171C0F",
  },

  // ─────────────────────────────────────
  // DARK PREMIUM
  // ─────────────────────────────────────

  {
    id: "noir-store",
    nombre: "Noir Store",
    descripcion: "Exclusiva, oscura y minimalista.",
    primaryColor: "#E4E4E7",
    secondaryColor: "#27272A",
    bgColor: "#09090B",
  },

  {
    id: "luxury-dark",
    nombre: "Luxury Dark",
    descripcion: "Minimalismo oscuro para productos premium.",
    primaryColor: "#D6D3D1",
    secondaryColor: "#292524",
    bgColor: "#0C0A09",
  },

  {
    id: "onyx",
    nombre: "Onyx",
    descripcion: "Profunda, limpia y de alto contraste.",
    primaryColor: "#D4D4D8",
    secondaryColor: "#18181B",
    bgColor: "#09090B",
  },

  {
    id: "charcoal",
    nombre: "Charcoal",
    descripcion: "Gris carbón elegante y equilibrado.",
    primaryColor: "#E5E7EB",
    secondaryColor: "#374151",
    bgColor: "#111827",
  },

  {
    id: "platinum-dark",
    nombre: "Platinum Dark",
    descripcion: "Fría, elegante y minimalista.",
    primaryColor: "#CBD5E1",
    secondaryColor: "#334155",
    bgColor: "#0F172A",
  },

  // ─────────────────────────────────────
  // DARK GREEN
  // ─────────────────────────────────────

  {
    id: "forest-dark",
    nombre: "Forest Dark",
    descripcion: "Verde profundo con una estética premium.",
    primaryColor: "#86EFAC",
    secondaryColor: "#14532D",
    bgColor: "#071A10",
  },

  {
    id: "emerald-dark",
    nombre: "Emerald Dark",
    descripcion: "Elegante y sofisticada con verde esmeralda.",
    primaryColor: "#6EE7B7",
    secondaryColor: "#064E3B",
    bgColor: "#022C22",
  },

  {
    id: "sage-dark",
    nombre: "Sage Dark",
    descripcion: "Verde apagado y relajado sobre fondo oscuro.",
    primaryColor: "#B7C7B1",
    secondaryColor: "#344137",
    bgColor: "#151B17",
  },

  {
    id: "moss-dark",
    nombre: "Moss Dark",
    descripcion: "Natural, sobria y contemporánea.",
    primaryColor: "#B8C39A",
    secondaryColor: "#3D4727",
    bgColor: "#171B0E",
  },

  // ─────────────────────────────────────
  // DARK WARM
  // ─────────────────────────────────────

  {
    id: "coffee-dark",
    nombre: "Coffee Dark",
    descripcion: "Cálida y elegante inspirada en tonos café.",
    primaryColor: "#D6BFAF",
    secondaryColor: "#3D2B20",
    bgColor: "#1C120D",
  },

  {
    id: "amber-dark",
    nombre: "Amber Dark",
    descripcion: "Cálida y sofisticada sin resultar llamativa.",
    primaryColor: "#F0C98A",
    secondaryColor: "#4A3416",
    bgColor: "#1C1408",
  },

  {
    id: "terracotta-dark",
    nombre: "Terracotta Dark",
    descripcion: "Tierra profunda para una identidad cálida.",
    primaryColor: "#E5A88C",
    secondaryColor: "#4A2418",
    bgColor: "#1C0E09",
  },

  // ─────────────────────────────────────
  // DARK BLUE / COLD
  // ─────────────────────────────────────

  {
    id: "ocean-dark",
    nombre: "Ocean Dark",
    descripcion: "Azul profundo, limpio y profesional.",
    primaryColor: "#7DD3FC",
    secondaryColor: "#164E63",
    bgColor: "#082F49",
  },

  {
    id: "steel-dark",
    nombre: "Steel Dark",
    descripcion: "Fría, tecnológica y sobria.",
    primaryColor: "#CBD5E1",
    secondaryColor: "#334155",
    bgColor: "#111827",
  },

  {
    id: "slate-dark",
    nombre: "Slate Dark",
    descripcion: "Equilibrada y profesional para ecommerce.",
    primaryColor: "#CBD5E1",
    secondaryColor: "#334155",
    bgColor: "#0F172A",
  },

  {
    id: "indigo-dark",
    nombre: "Indigo Dark",
    descripcion: "Moderna y digital con un azul profundo.",
    primaryColor: "#A5B4FC",
    secondaryColor: "#312E81",
    bgColor: "#111036",
  },

  // ─────────────────────────────────────
  // DARK MUTED
  // ─────────────────────────────────────

  {
    id: "dusty-dark",
    nombre: "Dusty Dark",
    descripcion: "Apagada, elegante y diferente.",
    primaryColor: "#D1C5BE",
    secondaryColor: "#403A37",
    bgColor: "#211F1D",
  },

  {
    id: "stone-dark",
    nombre: "Stone Dark",
    descripcion: "Neutra y sofisticada con tonos piedra.",
    primaryColor: "#D6D3D1",
    secondaryColor: "#44403C",
    bgColor: "#1C1917",
  },

  {
    id: "smoke",
    nombre: "Smoke",
    descripcion: "Minimalista y discreta para productos variados.",
    primaryColor: "#D1D5DB",
    secondaryColor: "#374151",
    bgColor: "#18181B",
  },

  {
    id: "ash",
    nombre: "Ash",
    descripcion: "Gris suave con una estética contemporánea.",
    primaryColor: "#D4D4D8",
    secondaryColor: "#3F3F46",
    bgColor: "#18181B",
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
