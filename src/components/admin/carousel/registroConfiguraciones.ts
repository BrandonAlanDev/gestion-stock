export type TipoCarousel = "HERO" | "BANNER" | "CARDS";
export type VarianteCarousel = "DEFAULT" | "SHOWCASE";

export type ControlConfiguracion =
  | { control: "slider"; min: number; max: number; step: number; unidad: string; aMostrar: (valor: number) => number; aGuardar: (valor: number) => number }
  | { control: "checkbox" }
  | { control: "select"; opciones: { valor: string; etiqueta: string }[] }
  | { control: "heroLayout" }
  | { control: "cardsLayout" };

export interface DefinicionConfiguracion {
  clave: string;
  etiqueta: string;
  grupo: "Diseño" | "Dimensiones" | "Reproducción" | "Visualización";
  valorPorDefecto: unknown;
  control: ControlConfiguracion;
  visibleCuando?: (ajustes: Record<string, unknown>, tipo: TipoCarousel, variante: VarianteCarousel) => boolean;
}

export const CONFIGURACIONES_GENERICAS: DefinicionConfiguracion[] = [
  { clave: "slideLayout", etiqueta: "Diseño visual", grupo: "Diseño", valorPorDefecto: "standard", control: { control: "heroLayout" }, visibleCuando: (a, tipo) => tipo === "HERO" },
  { clave: "layout", etiqueta: "Estilo de tarjetas", grupo: "Diseño", valorPorDefecto: "simple", control: { control: "cardsLayout" }, visibleCuando: (a, tipo) => tipo === "CARDS" },
  { clave: "columns", etiqueta: "Columnas (md+)", grupo: "Diseño", valorPorDefecto: "md:grid-cols-2", control: { control: "select", opciones: [
    { valor: "md:grid-cols-1", etiqueta: "1 columna" },
    { valor: "md:grid-cols-2", etiqueta: "2 columnas" },
    { valor: "md:grid-cols-3", etiqueta: "3 columnas" },
    { valor: "md:grid-cols-4", etiqueta: "4 columnas" },
  ] }, visibleCuando: (a, tipo) => tipo === "CARDS" && (a.layout ?? "simple") !== "offers" },
  { clave: "cardHeight", etiqueta: "Alto de tarjetas", grupo: "Diseño", valorPorDefecto: "50vh", control: { control: "select", opciones: [
    { valor: "40vh", etiqueta: "40vh (compacto)" },
    { valor: "50vh", etiqueta: "50vh (estándar)" },
    { valor: "60vh", etiqueta: "60vh (grande)" },
    { valor: "70vh", etiqueta: "70vh (extra grande)" },
    { valor: "80vh", etiqueta: "80vh (hero)" },
  ] }, visibleCuando: (a, tipo) => tipo === "CARDS" && (a.layout ?? "simple") !== "offers" },
  { clave: "height", etiqueta: "Altura", grupo: "Dimensiones", valorPorDefecto: 300, control: { control: "slider", min: 150, max: 800, step: 50, unidad: "px", aMostrar: (v) => v, aGuardar: (v) => v }, visibleCuando: (a, tipo, variante) => tipo !== "CARDS" || variante === "SHOWCASE" || a.layout === "offers" },
  { clave: "gap", etiqueta: "Separación entre imágenes", grupo: "Dimensiones", valorPorDefecto: 16, control: { control: "slider", min: 0, max: 48, step: 4, unidad: "px", aMostrar: (v) => v, aGuardar: (v) => v }, visibleCuando: (a, tipo, variante) => tipo !== "CARDS" || variante === "SHOWCASE" || a.layout === "offers" },
  { clave: "autoplayDelay", etiqueta: "Autoplay cada", grupo: "Reproducción", valorPorDefecto: 5000, control: { control: "slider", min: 2, max: 15, step: 1, unidad: "s", aMostrar: (v) => v / 1000, aGuardar: (v) => v * 1000 }, visibleCuando: (a, tipo, variante) => tipo !== "CARDS" || variante === "SHOWCASE" || a.layout === "offers" },
  { clave: "transitionDuration", etiqueta: "Duración", grupo: "Reproducción", valorPorDefecto: 6000, control: { control: "slider", min: 2, max: 15, step: 1, unidad: "s", aMostrar: (v) => v / 1000, aGuardar: (v) => v * 1000 } },
  { clave: "overlayOpacity", etiqueta: "Opacidad overlay", grupo: "Reproducción", valorPorDefecto: 0.9, control: { control: "slider", min: 0, max: 100, step: 5, unidad: "%", aMostrar: (v) => Math.round(v * 100), aGuardar: (v) => v / 100 } },
  { clave: "autoPlay", etiqueta: "Auto-play", grupo: "Reproducción", valorPorDefecto: true, control: { control: "checkbox" } },
  { clave: "showDots", etiqueta: "Mostrar puntos", grupo: "Reproducción", valorPorDefecto: true, control: { control: "checkbox" } },
  { clave: "showNavButtons", etiqueta: "Botones prev/next", grupo: "Reproducción", valorPorDefecto: true, control: { control: "checkbox" } },
  { clave: "showArrows", etiqueta: "Mostrar flechas", grupo: "Visualización", valorPorDefecto: true, control: { control: "checkbox" } },
  { clave: "showSubtitle", etiqueta: "Mostrar subtítulo", grupo: "Visualización", valorPorDefecto: true, control: { control: "checkbox" }, visibleCuando: (a, tipo) => tipo === "CARDS" && (a.layout ?? "simple") !== "offers" },
  { clave: "enableHoverZoom", etiqueta: "Zoom al hover", grupo: "Visualización", valorPorDefecto: true, control: { control: "checkbox" }, visibleCuando: (a, tipo) => tipo === "CARDS" && (a.layout ?? "simple") !== "offers" },
  { clave: "hideButtons", etiqueta: "Ocultar todos los botones", grupo: "Visualización", valorPorDefecto: false, control: { control: "checkbox" }, visibleCuando: (a, tipo) => tipo === "CARDS" && a.layout === "offers" },
];

export const EXCLUSIONES_POR_TIPO: Record<string, string[]> = {
  "HERO:DEFAULT": ["height", "gap", "autoplayDelay", "showArrows", "layout", "columns", "cardHeight", "showSubtitle", "enableHoverZoom", "hideButtons"],
  "HERO:SHOWCASE": ["slideLayout", "transitionDuration", "autoPlay", "showNavButtons", "overlayOpacity", "layout", "columns", "cardHeight", "showSubtitle", "enableHoverZoom", "hideButtons"],
  "BANNER:DEFAULT": ["slideLayout", "gap", "autoplayDelay", "showArrows", "overlayOpacity", "layout", "columns", "cardHeight", "showSubtitle", "enableHoverZoom", "hideButtons"],
  "BANNER:SHOWCASE": ["slideLayout", "transitionDuration", "autoPlay", "showNavButtons", "overlayOpacity", "layout", "columns", "cardHeight", "showSubtitle", "enableHoverZoom", "hideButtons"],
  "CARDS:DEFAULT": ["slideLayout", "transitionDuration", "autoPlay", "showDots", "showNavButtons", "overlayOpacity", "showArrows"],
  "CARDS:SHOWCASE": ["slideLayout", "transitionDuration", "autoPlay", "showNavButtons", "overlayOpacity", "layout", "columns", "cardHeight", "showSubtitle", "enableHoverZoom", "hideButtons"],
};

export function obtenerConfiguraciones(tipo: TipoCarousel, variante: VarianteCarousel): DefinicionConfiguracion[] {
  const excluidas = EXCLUSIONES_POR_TIPO[`${tipo}:${variante}`] ?? [];
  const setExcluidas = new Set(excluidas);
  return CONFIGURACIONES_GENERICAS.filter((d) => !setExcluidas.has(d.clave));
}
