import type { Carousel } from "@/types/carousel";

const PREFIJO_CARRUSEL = "carousel_";

function esIdCarrusel(id: string): boolean {
  return id.startsWith(PREFIJO_CARRUSEL);
}

function ordenarPorOrder(carousels: Carousel[]): Carousel[] {
  return [...carousels].sort((a, b) => a.order - b.order);
}

function activosPorTipo(carousels: Carousel[], tipo: Carousel["type"]): Carousel[] {
  return ordenarPorOrder(
    carousels.filter((c) => c.type === tipo && c.active !== false)
  );
}

function construirSeccionesPorDefecto(carousels: Carousel[]): string[] {
  const orden: string[] = [];

  for (const tipo of ["HERO", "BANNER"] as const) {
    for (const item of activosPorTipo(carousels, tipo)) {
      orden.push(PREFIJO_CARRUSEL + item.id);
    }
  }

  orden.push("featured");

  for (const item of activosPorTipo(carousels, "CARDS")) {
    orden.push(PREFIJO_CARRUSEL + item.id);
  }

  orden.push("location");

  return orden;
}

function migrarSeccionesAntiguas(
  secciones: string[],
  carousels: Carousel[]
): string[] {
  const nuevoOrden: string[] = [];

  for (const seccion of secciones) {
    if (seccion === "hero") {
      for (const item of activosPorTipo(carousels, "HERO")) {
        nuevoOrden.push(PREFIJO_CARRUSEL + item.id);
      }
    } else if (seccion === "banner") {
      for (const item of activosPorTipo(carousels, "BANNER")) {
        nuevoOrden.push(PREFIJO_CARRUSEL + item.id);
      }
    } else if (seccion === "cards") {
      for (const item of activosPorTipo(carousels, "CARDS")) {
        nuevoOrden.push(PREFIJO_CARRUSEL + item.id);
      }
    } else {
      nuevoOrden.push(seccion);
    }
  }

  return nuevoOrden;
}

function parsearOrden(rawOrder: string | null): string[] {
  if (!rawOrder) return [];
  try {
    const datos: unknown = JSON.parse(rawOrder);
    return Array.isArray(datos)
      ? datos.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function normalizarSecciones(
  carousels: Carousel[],
  rawOrder: string | null
): string[] {
  const idsExistentes = new Set(carousels.map((c) => PREFIJO_CARRUSEL + c.id));

  let secciones = parsearOrden(rawOrder);
  if (secciones.length === 0) {
    secciones = construirSeccionesPorDefecto(carousels);
  } else if (!secciones.some(esIdCarrusel)) {
    secciones = migrarSeccionesAntiguas(secciones, carousels);
  }

  const inactivos = new Set(
    carousels
      .filter((c) => c.active === false)
      .map((c) => PREFIJO_CARRUSEL + c.id)
  );

  const podadas = secciones.filter(
    (s) => !esIdCarrusel(s) || (idsExistentes.has(s) && !inactivos.has(s))
  );

  const existentes = new Set(podadas);
  const nuevosHeroBanner: string[] = [];
  const nuevosCards: string[] = [];
  const nuevosInactivos: string[] = [];
  for (const c of ordenarPorOrder(carousels)) {
    const id = PREFIJO_CARRUSEL + c.id;
    if (existentes.has(id)) continue;
    if (c.active === false) {
      nuevosInactivos.push(id);
      continue;
    }
    if (c.type === "CARDS") nuevosCards.push(id);
    else nuevosHeroBanner.push(id);
  }

  let siguiente = [...podadas];

  const idxDestacada = siguiente.indexOf("featured");
  if (nuevosHeroBanner.length > 0) {
    const en = idxDestacada >= 0 ? idxDestacada : siguiente.length;
    siguiente = [
      ...siguiente.slice(0, en),
      ...nuevosHeroBanner,
      ...siguiente.slice(en),
    ];
  }

  if (nuevosCards.length > 0) {
    const idxUbicacion = siguiente.indexOf("location");
    const en = idxUbicacion >= 0 ? idxUbicacion : siguiente.length;
    siguiente = [
      ...siguiente.slice(0, en),
      ...nuevosCards,
      ...siguiente.slice(en),
    ];
  }

  return [...siguiente, ...nuevosInactivos];
}
