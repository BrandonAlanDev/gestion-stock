export const categories = [
  { 
    id: 1, 
    name: "Botines", 
    subcategories: ["Fútbol 11 (FG)", "Fútbol 5 (TF)", "Fútbol Salón (IC)", "Gama Profesional"] 
  },
  { 
    id: 2, 
    name: "Urbano", 
    subcategories: ["Zapatillas", "Remeras Oversize", "Buzos", "Gorras"] 
  },
  { 
    id: 3, 
    name: "Indumentaria", 
    subcategories: ["Camisetas", "Shorts", "Medias de Agarre", "Conjuntos Deportivos"] 
  },
  { 
    id: 4, 
    name: "Accesorios", 
    subcategories: ["Pelotas", "Canilleras", "Guantes de Arquero", "Bolsos y Mochilas"] 
  },
];

export const heroSlides = [
  {
    id: "slide-botines-1",
    title: "PREDATOR ELITE",
    subtitle: "⚽ PRO FG",
    description: "Máximo control y grip en césped natural.",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551958219-acbc608c6d77?q=80&w=600&auto=format&fit=crop"
    ],
    ctaText: "Ver Botines",
    targetCategory: "Botines"
  },
  {
    id: "slide-urbano-1",
    title: "AIR MAX PLUS",
    subtitle: "🔥 STREETWEAR",
    description: "Estilo agresivo e iconografía de asfalto.",
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616166330003-8e5529e4652a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?q=80&w=600&auto=format&fit=crop"
    ],
    ctaText: "Ver Sneakers",
    targetCategory: "Urbano"
  },
  {
    id: "slide-lanzamientos-1",
    title: "DROP TEMPORADA",
    subtitle: "⚡ INGRESO",
    description: "Equipate antes que nadie con la selección élite.",
    images: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop"
    ],
    ctaText: "Ver Catálogo",
    targetCategory: null
  }
];

// ==========================================
// PRODUCTS EXPORT (SOLUCIONA TU ERROR DE COMPILACIÓN)
// ==========================================
export const products = [
  {
    id: "prod-1",
    title: "ADIDAS PREDATOR ELITE FG",
    description: "Diseño aerodinámico y zonas de hule Strikeskin para un control de pelota quirúrgico.",
    price: 345000,
    category: "Botines",
    subcategory: "Gama Profesional",
    image: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600"],
    isNew: true,
    shipping: "Envío Gratis"
  },
  {
    id: "prod-2",
    title: "NIKE AIR MAX PLUS TN 'TRIPLE BLACK'",
    description: "Líneas de diseño onduladas inspiradas en palmeras y una actitud puramente urbana.",
    price: 290000,
    category: "Urbano",
    subcategory: "Zapatillas",
    image: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600"],
    isNew: true,
    shipping: "Envío Gratis"
  },
  {
    id: "prod-3",
    title: "BUZO OVERSIZE 'MEMENTO' HEAVYWEIGHT",
    description: "Frisa premium pesada con lavado split y moldería cuadrada drop shoulder.",
    price: 78000,
    category: "Urbano",
    subcategory: "Buzos",
    image: ["https://images.unsplash.com/photo-1616166330003-8e5529e4652a?q=80&w=600"],
    isNew: false,
    shipping: "Envío Normal"
  },
  {
    id: "prod-4",
    title: "MEDIAS DE AGARRE PRO TRAC",
    description: "Almohadillas antideslizantes en la planta para máxima estabilidad en cambios de ritmo.",
    price: 15500,
    category: "Indumentaria",
    subcategory: "Medias de Agarre",
    image: ["https://images.unsplash.com/photo-1551958219-acbc608c6d77?q=80&w=600"],
    isNew: false,
    shipping: "Envío Normal"
  }
];