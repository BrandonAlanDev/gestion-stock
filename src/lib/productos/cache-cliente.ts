import type { ProductoCatalogo } from "@/types/productos/catalogo-publico";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

const VERSION = 2;
const DURACION_MS = 5 * 60 * 1000;
const MAX_PAGINAS = 8;
const MAX_DETALLES = 30;
const PREFIJO = "gestion-stock:catalogo-publico";

type TarjetaGuardada = Pick<ProductoCatalogo, "id" | "name" | "price" | "createdAt" | "images">;
type DetalleGuardado = Pick<ProductoDetalleSerializado, "id" | "name" | "price" | "description" | "images">;

interface Entrada<T> {
  guardadoEn: number;
  datos: T;
}

interface PaginaGuardada {
  productos: TarjetaGuardada[];
  pagina: number;
  paginasTotales: number;
}

interface CacheCatalogo {
  version: number;
  paginas: Record<string, Entrada<PaginaGuardada>>;
  detalles: Record<string, Entrada<DetalleGuardado>>;
}

function claveHost() {
  return `${PREFIJO}:${window.location.host}`;
}

function claveTenant(tenantId: string) {
  return `${claveHost()}:${tenantId}`;
}

function leerCache(tenantId: string): CacheCatalogo {
  try {
    const guardado = window.localStorage.getItem(claveTenant(tenantId));
    if (guardado) {
      const cache: unknown = JSON.parse(guardado);
      if (
        cache &&
        typeof cache === "object" &&
        "version" in cache && cache.version === VERSION &&
        "paginas" in cache && cache.paginas && typeof cache.paginas === "object" &&
        "detalles" in cache && cache.detalles && typeof cache.detalles === "object"
      ) {
        return cache as CacheCatalogo;
      }
    }
  } catch {
    // El almacenamiento puede estar bloqueado o contener datos anteriores.
  }
  return { version: VERSION, paginas: {}, detalles: {} };
}

function guardarCache(tenantId: string, cache: CacheCatalogo) {
  try {
    const vigentes = <T>(entradas: Record<string, Entrada<T>>, maximo: number) =>
      Object.fromEntries(
        Object.entries(entradas)
          .filter(([, entrada]) => entrada && typeof entrada.guardadoEn === "number" && Date.now() - entrada.guardadoEn < DURACION_MS)
          .sort((a, b) => b[1].guardadoEn - a[1].guardadoEn)
          .slice(0, maximo)
      );
    cache.paginas = vigentes(cache.paginas, MAX_PAGINAS);
    cache.detalles = vigentes(cache.detalles, MAX_DETALLES);
    window.localStorage.setItem(claveTenant(tenantId), JSON.stringify(cache));
  } catch {
    // Una cuota agotada no debe impedir la navegación.
  }
}

export function clavePaginaCatalogo(pagina: number, categoria?: string, subcategoria?: string) {
  return JSON.stringify([pagina, categoria?.trim().toLowerCase() || "", subcategoria?.trim().toLowerCase() || ""]);
}

export function guardarPaginaCatalogo(
  tenantId: string,
  pagina: number,
  categoria: string | undefined,
  subcategoria: string | undefined,
  productos: ProductoCatalogo[],
  paginasTotales: number,
  obtenidoEn: number
) {
  const cache = leerCache(tenantId);
  cache.paginas[clavePaginaCatalogo(pagina, categoria, subcategoria)] = {
    guardadoEn: obtenidoEn,
    datos: {
      productos: productos.map(({ id, name, price, createdAt, images }) => ({ id, name, price: String(price), createdAt, images })),
      pagina,
      paginasTotales,
    },
  };
  guardarCache(tenantId, cache);
}

export function leerPaginaCatalogo(tenantId: string, pagina: number, categoria?: string, subcategoria?: string) {
  const entrada = leerCache(tenantId).paginas[clavePaginaCatalogo(pagina, categoria, subcategoria)];
  if (!entrada || typeof entrada.guardadoEn !== "number" || Date.now() - entrada.guardadoEn >= DURACION_MS || !entrada.datos) return null;
  const datos = entrada.datos;
  if (
    !Array.isArray(datos.productos) ||
    !datos.productos.every((producto) =>
      producto && typeof producto.id === "string" && typeof producto.name === "string" &&
      typeof producto.createdAt === "string" && Number.isFinite(Number(producto.price)) &&
      Array.isArray(producto.images) && producto.images.every((imagen) => typeof imagen?.srcImage === "string")
    ) ||
    !Number.isInteger(datos.paginasTotales)
  ) return null;
  return datos;
}

export function guardarDetalleProducto(tenantId: string, producto: ProductoDetalleSerializado) {
  const cache = leerCache(tenantId);
  cache.detalles[producto.id] = {
    guardadoEn: Date.now(),
    datos: {
      id: producto.id,
      name: producto.name,
      price: producto.price,
      description: producto.description,
      images: producto.images,
    },
  };
  guardarCache(tenantId, cache);
}

export function leerVistaPreviaProducto(tenantId: string, id: string): DetalleGuardado | null {
  const cache = leerCache(tenantId);
  const detalle = cache.detalles[id];
  if (
    detalle && typeof detalle.guardadoEn === "number" && Date.now() - detalle.guardadoEn < DURACION_MS &&
    detalle.datos?.id === id && typeof detalle.datos.name === "string" &&
    Array.isArray(detalle.datos.images) && detalle.datos.images.every((imagen) => typeof imagen?.srcImage === "string")
  ) {
    return detalle.datos;
  }
  for (const pagina of Object.values(cache.paginas)) {
    if (!pagina || typeof pagina.guardadoEn !== "number" || Date.now() - pagina.guardadoEn >= DURACION_MS || !Array.isArray(pagina.datos?.productos)) continue;
    const tarjeta = pagina.datos.productos.find((producto) => producto?.id === id);
    if (tarjeta && typeof tarjeta.name === "string" && Array.isArray(tarjeta.images) && tarjeta.images.every((imagen) => typeof imagen?.srcImage === "string")) {
      return { id, name: tarjeta.name, price: Number(tarjeta.price), images: (tarjeta.images ?? []).map((imagen, indice) => ({ id: `${id}-${indice}`, srcImage: imagen.srcImage })) };
    }
  }
  return null;
}
