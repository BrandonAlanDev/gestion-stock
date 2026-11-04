import { createHash } from "node:crypto";

interface ProductoParaSlug {
  id: string;
  name: string;
  createdAt?: Date | string;
}

export interface IndiceProductosPublicos {
  porId: Record<string, { slug: string; name: string }>;
  porSlug: Record<string, string>;
  porBase: Record<string, string>;
  categorias: string[];
}

export function normalizarNombreProducto(nombre: string) {
  return nombre.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "prenda";
}

export function crearIndiceProductosPublicos(productos: ProductoParaSlug[], categorias: string[]): IndiceProductosPublicos {
  const bases = new Map<string, number>();
  for (const producto of productos) {
    const base = normalizarNombreProducto(producto.name);
    bases.set(base, (bases.get(base) ?? 0) + 1);
  }

  // Las categorías comparten el mismo segmento de URL con los productos.
  const categoriasReservadas = new Set(categorias.map(normalizarNombreProducto));
  const reservados = new Set([...bases.keys(), ...categoriasReservadas, "item"]);
  const ocupados = new Set<string>();
  const porId: IndiceProductosPublicos["porId"] = {};
  const porSlug: IndiceProductosPublicos["porSlug"] = {};
  const porBase: IndiceProductosPublicos["porBase"] = {};

  for (const producto of [...productos].sort((a, b) => {
    const fechaA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const fechaB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return fechaA - fechaB || a.id.localeCompare(b.id);
  })) {
    const base = normalizarNombreProducto(producto.name);
    if (!Object.hasOwn(porBase, base)) porBase[base] = producto.id;
  }

  for (const producto of [...productos].sort((a, b) => a.id.localeCompare(b.id))) {
    const base = normalizarNombreProducto(producto.name);
    let slug = base;
    if ((bases.get(base) ?? 0) > 1 || categoriasReservadas.has(base) || base === "item") {
      const token = createHash("sha256").update(producto.id).digest("hex");
      let longitud = 8;
      slug = `${base}-${token.slice(0, longitud)}`;
      while ((reservados.has(slug) || ocupados.has(slug)) && longitud < token.length) {
        longitud += 1;
        slug = `${base}-${token.slice(0, longitud)}`;
      }
      if (reservados.has(slug) || ocupados.has(slug)) slug = `${base}-${token}-${normalizarNombreProducto(producto.id)}`;
    }
    ocupados.add(slug);
    porId[producto.id] = { slug, name: producto.name };
    porSlug[slug] = producto.id;
  }

  // Un enlace cacheado con sufijo sigue llevando al producto si deja de estar duplicado.
  for (const producto of productos) {
    const base = normalizarNombreProducto(producto.name);
    const token = createHash("sha256").update(producto.id).digest("hex").slice(0, 8);
    const alias = `${base}-${token}`;
    if (!reservados.has(alias) && !Object.hasOwn(porSlug, alias)) porSlug[alias] = producto.id;
  }

  return { porId, porSlug, porBase, categorias };
}

export function resolverIdProductoPorSegmento(segmento: string, indice: IndiceProductosPublicos): string | null {
  if (Object.hasOwn(indice.porSlug, segmento)) return indice.porSlug[segmento];
  if (Object.hasOwn(indice.porId, segmento)) return segmento;
  if (Object.hasOwn(indice.porBase, segmento)) return indice.porBase[segmento];
  return null;
}
