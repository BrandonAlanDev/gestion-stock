export const CATEGORIAS_TIPOGRAFIA = [
  "Elegantes",
  "Modernas",
  "Cercanas",
  "Impactantes",
] as const;

export type CategoriaTipografia = (typeof CATEGORIAS_TIPOGRAFIA)[number];

export interface PlantillaTipografia {
  id: string;
  nombre: string;
  descripcion: string;
  principal: string;
  secundaria: string;
  categoria: CategoriaTipografia;
}

type DefinicionPlantilla = [
  id: string,
  nombre: string,
  descripcion: string,
  principal: string,
  secundaria: string,
];

function crearPlantillas(
  categoria: CategoriaTipografia,
  definiciones: DefinicionPlantilla[],
): PlantillaTipografia[] {
  return definiciones.map(([id, nombre, descripcion, principal, secundaria]) => ({
    id,
    nombre,
    descripcion,
    principal,
    secundaria,
    categoria,
  }));
}

export const PLANTILLAS_TIPOGRAFIA: PlantillaTipografia[] = [
  ...crearPlantillas("Elegantes", [
    ["clasica-elegante", "Clásica elegante", "Títulos con carácter y lectura limpia.", "Outfit", "Playfair Display"],
    ["editorial-refinada", "Editorial refinada", "Un aire de revista para marcas cuidadas.", "DM Sans", "Cormorant Garamond"],
    ["boutique-expresiva", "Boutique expresiva", "Títulos cálidos con texto contemporáneo.", "Manrope", "Fraunces"],
    ["editorial-luminosa", "Editorial luminosa", "Elegancia marcada y texto ligero.", "Source Sans 3", "Playfair Display"],
    ["lujo-contemporaneo", "Lujo contemporáneo", "Serif refinada con base geométrica.", "Montserrat", "Cormorant Garamond"],
    ["diseno-artesanal", "Diseño artesanal", "Títulos expresivos y lectura sencilla.", "Figtree", "Fraunces"],
    ["clasica-equilibrada", "Clásica equilibrada", "Tradición con una interfaz discreta.", "Inter", "Lora"],
    ["prestigio-moderno", "Prestigio moderno", "Títulos sólidos y texto actual.", "Plus Jakarta Sans", "Merriweather"],
    ["moda-accesible", "Moda accesible", "Elegancia visible con formas suaves.", "Poppins", "Playfair Display"],
    ["alta-costura", "Alta costura", "Contraste fino para una marca distinguida.", "Instrument Sans", "Cormorant Garamond"],
  ]),
  ...crearPlantillas("Modernas", [
    ["tecnologia-clara", "Tecnología clara", "Contraste moderno entre dos sans serif.", "Inter", "Space Grotesk"],
    ["comercial-firme", "Comercial firme", "Títulos geométricos y texto familiar.", "Roboto", "Montserrat"],
    ["digital-geometrica", "Digital geométrica", "Curvas precisas para un estilo digital.", "DM Sans", "Sora"],
    ["creativa-urbana", "Creativa urbana", "Títulos con personalidad y texto sobrio.", "Figtree", "Bricolage Grotesque"],
    ["neutra-industrial", "Neutra industrial", "Diseño funcional con títulos firmes.", "Onest", "Archivo"],
    ["innovacion-fresca", "Innovación fresca", "Un acento tecnológico y lectura fluida.", "Be Vietnam Pro", "Space Grotesk"],
    ["geometria-amable", "Geometría amable", "Formas redondas sin perder claridad.", "Work Sans", "Poppins"],
    ["ciudad-contemporanea", "Ciudad contemporánea", "Títulos amplios y texto liviano.", "Source Sans 3", "Urbanist"],
    ["producto-actual", "Producto actual", "Una imagen limpia para catálogos modernos.", "Manrope", "Instrument Sans"],
    ["lineas-precisas", "Líneas precisas", "Títulos definidos con texto minimalista.", "Figtree", "Kumbh Sans"],
  ]),
  ...crearPlantillas("Cercanas", [
    ["cercana-natural", "Cercana y natural", "Lectura amable con títulos clásicos.", "Nunito Sans", "Lora"],
    ["creatividad-amable", "Creatividad amable", "Un toque expresivo sin perder legibilidad.", "Lexend", "Fraunces"],
    ["natural-minimalista", "Natural minimalista", "Calma editorial para una tienda simple.", "Figtree", "Lora"],
    ["tradicion-alegre", "Tradición alegre", "Títulos confiables y texto redondeado.", "Poppins", "Merriweather"],
    ["organica-expresiva", "Orgánica expresiva", "Texturas cálidas con base geométrica.", "Kumbh Sans", "Fraunces"],
    ["calma-cotidiana", "Calma cotidiana", "Una mezcla serena y fácil de leer.", "Onest", "Lora"],
    ["lectura-confiable", "Lectura confiable", "Títulos tradicionales y cuerpo ligero.", "Work Sans", "Merriweather"],
    ["juguetona-moderna", "Juguetona moderna", "Personalidad en títulos y texto amable.", "Nunito Sans", "Bricolage Grotesque"],
    ["calidez-sobria", "Calidez sobria", "Serif robusta con texto equilibrado.", "DM Sans", "Merriweather"],
    ["tienda-familiar", "Tienda familiar", "Títulos cercanos y lectura cómoda.", "Nunito Sans", "Roboto Slab"],
  ]),
  ...crearPlantillas("Impactantes", [
    ["titulares-audaces", "Titulares audaces", "Títulos altos con base de carácter.", "Archivo", "Oswald"],
    ["creatividad-digital", "Creatividad digital", "Títulos expresivos sobre texto neutral.", "Inter", "Bricolage Grotesque"],
    ["gran-formato", "Gran formato", "Acento de cartel para promociones.", "Source Sans 3", "Oswald"],
    ["editorial-fuerte", "Editorial fuerte", "Títulos robustos con texto abierto.", "Work Sans", "Roboto Slab"],
    ["ritmo-urbano", "Ritmo urbano", "Geometría visible y lectura simple.", "Figtree", "Space Grotesk"],
    ["presencia-comercial", "Presencia comercial", "Títulos de marca con cuerpo suave.", "Manrope", "Montserrat"],
    ["estilo-disruptivo", "Estilo disruptivo", "Una voz gráfica para destacar productos.", "DM Sans", "Bricolage Grotesque"],
    ["contraste-solido", "Contraste sólido", "Serif contundente y texto neutro.", "Inter", "Roboto Slab"],
    ["cartel-moderno", "Cartel moderno", "Títulos estrechos que llaman la atención.", "Plus Jakarta Sans", "Oswald"],
    ["identidad-espacial", "Identidad espacial", "Una presencia futurista y clara.", "Outfit", "Space Grotesk"],
  ]),
];
