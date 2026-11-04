import type { CategoriaCatalogo, ProductoCatalogo } from "@/types/productos/catalogo-publico";

const VERSION = 4;
const DURACION_VERIFICACION_MS = 5 * 60 * 1000;
const DURACION_PRODUCTOS_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_PAGINAS = 8;
const MAX_PRODUCTOS = 400;
const PREFIJO = "gestion-stock:catalogo-publico";

type TarjetaGuardada = Pick<ProductoCatalogo, "id" | "name" | "slug" | "categoryId" | "subCategoryId"> & {
  price: string;
  createdAt: string;
  updatedAt: string;
  images: Array<{ srcImage: string }>;
};

interface Entrada<T> {
  guardadoEn: number;
  datos: T;
}

interface ProductoGuardado extends Entrada<TarjetaGuardada> {
  verificadoEn: number;
}

interface PaginaGuardada {
  ids: string[];
  pagina: number;
  paginasTotales: number;
  total: number;
}

interface CacheCatalogo {
  version: number;
  paginas: Record<string, Entrada<PaginaGuardada>>;
  productos: Record<string, ProductoGuardado>;
  categorias?: Entrada<CategoriaCatalogo[]>;
}

function claveTenant(tenantId: string) {
  return `${PREFIJO}:${window.location.host}:${tenantId}`;
}

function leerCache(tenantId: string): CacheCatalogo {
  try {
    const guardado = window.localStorage.getItem(claveTenant(tenantId));
    if (guardado) {
      const cache: unknown = JSON.parse(guardado);
      if (
        cache && typeof cache === "object" &&
        "version" in cache && cache.version === VERSION &&
        "paginas" in cache && cache.paginas && typeof cache.paginas === "object" &&
        "productos" in cache && cache.productos && typeof cache.productos === "object"
      ) return cache as CacheCatalogo;
    }
  } catch {
    // El almacenamiento puede estar bloqueado o contener datos anteriores.
  }
  return { version: VERSION, paginas: {}, productos: {} };
}

function estaVigente<T>(entrada: Entrada<T> | undefined, duracionMs = DURACION_VERIFICACION_MS): entrada is Entrada<T> {
  return Boolean(entrada && Number.isFinite(entrada.guardadoEn) &&
    entrada.guardadoEn <= Date.now() && Date.now() - entrada.guardadoEn < duracionMs);
}

function guardarCache(tenantId: string, cache: CacheCatalogo) {
  try {
    const vigentes = <T extends Entrada<unknown>>(entradas: Record<string, T>, maximo: number, duracionMs: number) =>
      Object.fromEntries(
        Object.entries(entradas)
          .filter(([, entrada]) => estaVigente(entrada, duracionMs))
          .sort((a, b) => b[1].guardadoEn - a[1].guardadoEn)
          .slice(0, maximo)
      );
    cache.paginas = vigentes(cache.paginas, MAX_PAGINAS, DURACION_VERIFICACION_MS);
    cache.productos = vigentes(cache.productos, MAX_PRODUCTOS, DURACION_PRODUCTOS_MS);
    if (!estaVigente(cache.categorias)) delete cache.categorias;
    window.localStorage.setItem(claveTenant(tenantId), JSON.stringify(cache));
  } catch {
    // Una cuota agotada no debe impedir la navegación.
  }
}

function tarjetaValida(producto: TarjetaGuardada | undefined): producto is TarjetaGuardada {
  return Boolean(producto && typeof producto.id === "string" &&
    typeof producto.name === "string" && typeof producto.slug === "string" &&
    typeof producto.categoryId === "string" &&
    (producto.subCategoryId === null || typeof producto.subCategoryId === "string") &&
    typeof producto.createdAt === "string" && Number.isFinite(Date.parse(producto.createdAt)) &&
    typeof producto.updatedAt === "string" && Number.isFinite(Date.parse(producto.updatedAt)) &&
    Number.isFinite(Number(producto.price)) &&
    Array.isArray(producto.images) &&
    producto.images.every((imagen) => typeof imagen?.srcImage === "string"));
}

function normalizarTarjeta(producto: ProductoCatalogo): TarjetaGuardada {
  return {
    id: producto.id,
    name: producto.name,
    slug: producto.slug,
    categoryId: producto.categoryId,
    subCategoryId: producto.subCategoryId,
    price: String(producto.price),
    createdAt: new Date(producto.createdAt).toISOString(),
    updatedAt: new Date(producto.updatedAt).toISOString(),
    images: (producto.images ?? []).map(({ srcImage }) => ({ srcImage })),
  };
}

function agregarProductos(cache: CacheCatalogo, productos: ProductoCatalogo[], obtenidoEn: number) {
  for (const producto of productos) {
    const anterior = cache.productos[producto.id];
    const tarjeta = normalizarTarjeta(producto);
    if (estaVigente(anterior, DURACION_PRODUCTOS_MS) &&
      anterior.datos.updatedAt === tarjeta.updatedAt && anterior.datos.slug === tarjeta.slug) {
      if (anterior.verificadoEn < obtenidoEn) {
        anterior.guardadoEn = obtenidoEn;
        anterior.verificadoEn = obtenidoEn;
      }
    } else if (anterior && anterior.guardadoEn > obtenidoEn) {
      continue;
    } else {
      if (anterior && (
        anterior.datos.categoryId !== tarjeta.categoryId ||
        anterior.datos.subCategoryId !== tarjeta.subCategoryId ||
        anterior.datos.createdAt !== tarjeta.createdAt
      )) {
        for (const [clave, pagina] of Object.entries(cache.paginas)) {
          if (pagina.datos?.ids.includes(producto.id)) delete cache.paginas[clave];
        }
      }
      cache.productos[producto.id] = { guardadoEn: obtenidoEn, verificadoEn: obtenidoEn, datos: tarjeta };
    }
  }
}

export function guardarProductosCatalogo(tenantId: string, productos: ProductoCatalogo[], obtenidoEn = Date.now()) {
  const cache = leerCache(tenantId);
  agregarProductos(cache, productos, obtenidoEn);
  guardarCache(tenantId, cache);
}

export function leerProductosCatalogo(tenantId: string) {
  return Object.values(leerCache(tenantId).productos)
    .filter((entrada) => estaVigente(entrada, DURACION_PRODUCTOS_MS) && tarjetaValida(entrada.datos));
}

export function leerPaginaFiltradaCompleta(
  tenantId: string,
  pagina: number,
  limite: number,
  categoryId: string,
  subCategoryId: string | undefined,
  total: number
) {
  const productos = leerProductosCatalogo(tenantId).filter(({ datos }) =>
    datos.categoryId === categoryId && (!subCategoryId || datos.subCategoryId === subCategoryId)
  );
  if (productos.length !== total || productos.some(({ verificadoEn }) =>
    !Number.isFinite(verificadoEn) || verificadoEn > Date.now() ||
    Date.now() - verificadoEn >= DURACION_VERIFICACION_MS
  )) return null;
  productos.sort((a, b) =>
    b.datos.createdAt.localeCompare(a.datos.createdAt) || b.datos.id.localeCompare(a.datos.id)
  );
  const seleccion = productos.slice((pagina - 1) * limite, pagina * limite);
  return {
    productos: seleccion.map(({ datos }) => datos),
    pagina,
    total,
    paginasTotales: Math.ceil(total / limite),
    obtenidoEn: seleccion.length ? Math.min(...seleccion.map(({ verificadoEn }) => verificadoEn)) : Date.now(),
  };
}

export function guardarCategoriasCatalogo(tenantId: string, categorias: CategoriaCatalogo[], obtenidoEn = Date.now()) {
  const cache = leerCache(tenantId);
  cache.categorias = { guardadoEn: obtenidoEn, datos: categorias };
  guardarCache(tenantId, cache);
}

export function leerCategoriasCatalogo(tenantId: string) {
  const entrada = leerCache(tenantId).categorias;
  if (!estaVigente(entrada) || !Array.isArray(entrada.datos) ||
    !entrada.datos.every((categoria) =>
      categoria && typeof categoria.id === "string" && typeof categoria.name === "string" &&
      typeof categoria.slug === "string" &&
      Number.isInteger(categoria.totalProductos) && categoria.totalProductos >= 0 &&
      Array.isArray(categoria.subCategories) && categoria.subCategories.every((subcategoria) =>
        subcategoria && typeof subcategoria.id === "string" && typeof subcategoria.name === "string" &&
        typeof subcategoria.slug === "string" &&
        Number.isInteger(subcategoria.totalProductos) && subcategoria.totalProductos >= 0
      )
    )) return null;
  return entrada;
}

export function clavePaginaCatalogo(pagina: number, limite: number, categoria?: string, subcategoria?: string) {
  return JSON.stringify([pagina, limite, categoria?.trim().toLocaleLowerCase("es-AR") || "", subcategoria?.trim().toLocaleLowerCase("es-AR") || ""]);
}

export function guardarPaginaCatalogo(
  tenantId: string,
  pagina: number,
  limite: number,
  categoria: string | undefined,
  subcategoria: string | undefined,
  productos: ProductoCatalogo[],
  total: number,
  obtenidoEn: number
) {
  const cache = leerCache(tenantId);
  agregarProductos(cache, productos, obtenidoEn);
  cache.paginas[clavePaginaCatalogo(pagina, limite, categoria, subcategoria)] = {
    guardadoEn: obtenidoEn,
    datos: { ids: productos.map((producto) => producto.id), pagina, total, paginasTotales: Math.ceil(total / limite) },
  };
  guardarCache(tenantId, cache);
}

export function leerPaginaCatalogo(tenantId: string, pagina: number, limite: number, categoria?: string, subcategoria?: string) {
  const cache = leerCache(tenantId);
  const entrada = cache.paginas[clavePaginaCatalogo(pagina, limite, categoria, subcategoria)];
  if (!estaVigente(entrada) || !entrada.datos ||
    !Array.isArray(entrada.datos.ids) ||
    !Number.isInteger(entrada.datos.total) || !Number.isInteger(entrada.datos.paginasTotales)) return null;
  const productos = entrada.datos.ids.map((id) => cache.productos[id]);
  if (!productos.every((producto) => estaVigente(producto, DURACION_PRODUCTOS_MS) && tarjetaValida(producto.datos))) return null;
  return {
    productos: productos.map((producto) => producto.datos),
    pagina: entrada.datos.pagina,
    total: entrada.datos.total,
    paginasTotales: entrada.datos.paginasTotales,
    obtenidoEn: entrada.guardadoEn,
  };
}
