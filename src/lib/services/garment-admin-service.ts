import { Prisma } from "@/../generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  EstadoProducto,
  FiltroStock,
  OrdenProducto,
  ProductoAdminRow,
  VarianteAdminResumen,
} from "@/lib/productos/tipos";

export const UMBRAL_STOCK_BAJO = 5;
export const LIMITE_MAXIMO_ADMIN = 50;

interface ParametrosConsultaProductos {
  pagina: number;
  limite: number;
  busqueda?: string;
  categoriaId?: string;
  subcategoriaId?: string;
  proveedorId?: string;
  estado?: EstadoProducto;
  stock?: FiltroStock;
  orden?: OrdenProducto;
}

const ORDENES_SQL: Record<OrdenProducto, Prisma.Sql> = {
  recientes: Prisma.raw("g.createdAt DESC"),
  antiguos: Prisma.raw("g.createdAt ASC"),
  "nombre-asc": Prisma.raw("g.name ASC"),
  "nombre-desc": Prisma.raw("g.name DESC"),
  "precio-asc": Prisma.raw("g.price ASC"),
  "precio-desc": Prisma.raw("g.price DESC"),
  "stock-asc": Prisma.raw("COALESCE(SUM(v.stock), 0) ASC"),
  "stock-desc": Prisma.raw("COALESCE(SUM(v.stock), 0) DESC"),
};

const TOTAL_STOCK = Prisma.sql`COALESCE(SUM(v.stock), 0)`;

interface FilaCrudaConsulta {
  id: string;
  nombre: string;
  precio: string | number;
  precioMaximo: string | number | null;
  activo: number;
  creadoEn: Date;
  categoriaId: string;
  subcategoriaId: string | null;
  proveedorId: string | null;
  categoriaNombre: string | null;
  subcategoriaNombre: string | null;
  proveedorNombre: string | null;
  stockTotal: string | number;
  cantidadVariantes: string | number;
}

function construirCondiciones(tenantId: string, p: ParametrosConsultaProductos): Prisma.Sql {
  const condiciones: Prisma.Sql[] = [Prisma.sql`g.tenantId = ${tenantId}`];

  if (p.estado === "activo") condiciones.push(Prisma.sql`g.active = 1`);
  if (p.estado === "oculto") condiciones.push(Prisma.sql`g.active = 0`);
  if (p.categoriaId) condiciones.push(Prisma.sql`g.categoryId = ${p.categoriaId}`);
  if (p.subcategoriaId) condiciones.push(Prisma.sql`g.subCategoryId = ${p.subcategoriaId}`);
  if (p.proveedorId) condiciones.push(Prisma.sql`g.supplierId = ${p.proveedorId}`);

  const busqueda = p.busqueda?.trim();
  if (busqueda) {
    const patron = `%${busqueda}%`;
    condiciones.push(
      Prisma.sql`(${Prisma.join(
        [
          Prisma.sql`g.name LIKE ${patron}`,
          Prisma.sql`EXISTS (SELECT 1 FROM GarmentVariant v_busqueda WHERE v_busqueda.garmentId = g.id AND v_busqueda.sku LIKE ${patron})`,
          Prisma.sql`c.name LIKE ${patron}`,
          Prisma.sql`sc.name LIKE ${patron}`,
        ],
        " OR "
      )})`
    );
  }

  return Prisma.join(condiciones, " AND ");
}

function construirHaving(stock?: FiltroStock): Prisma.Sql {
  const porStock: Prisma.Sql[] = [];
  if (stock === "en-stock") porStock.push(Prisma.sql`${TOTAL_STOCK} > 0`);
  if (stock === "sin-stock") porStock.push(Prisma.sql`${TOTAL_STOCK} = 0`);
  if (stock === "bajo-stock") {
    porStock.push(Prisma.sql`${TOTAL_STOCK} > 0 AND ${TOTAL_STOCK} <= ${UMBRAL_STOCK_BAJO}`);
  }
  return porStock.length > 0 ? Prisma.join(porStock, " AND ") : Prisma.sql`1 = 1`;
}

const COLUMNAS_SELECT = Prisma.sql`
  g.id, g.name, g.price, g.maxPrice, g.active, g.createdAt,
  g.categoryId, g.subCategoryId, g.supplierId,
  c.name AS categoriaNombre, sc.name AS subcategoriaNombre, p.name AS proveedorNombre,
  ${TOTAL_STOCK} AS stockTotal, COUNT(v.id) AS cantidadVariantes
`;

const SELECT_BASE = Prisma.sql`
  SELECT ${COLUMNAS_SELECT}
  FROM Garment g
  LEFT JOIN Category c ON c.id = g.categoryId
  LEFT JOIN SubCategory sc ON sc.id = g.subCategoryId
  LEFT JOIN Provider p ON p.id = g.supplierId
  LEFT JOIN GarmentVariant v ON v.garmentId = g.id AND v.tenantId = g.tenantId
`;

const GROUP_BY = Prisma.raw(
  "GROUP BY g.id, g.name, g.price, g.maxPrice, g.active, g.createdAt, g.categoryId, g.subCategoryId, g.supplierId, c.name, sc.name, p.name"
);

export async function obtenerProductosAdmin(
  tenantId: string,
  p: ParametrosConsultaProductos
): Promise<{ filas: ProductoAdminRow[]; total: number; pagina: number; totalPaginas: number }> {
  const pagina = Math.min(100, Math.max(1, Math.trunc(p.pagina) || 1));
  const limite = Math.min(LIMITE_MAXIMO_ADMIN, Math.max(1, Math.trunc(p.limite) || 20));
  const skip = (pagina - 1) * limite;

  const donde = construirCondiciones(tenantId, p);
  const teniendo = construirHaving(p.stock);
  const orden = ORDENES_SQL[p.orden ?? "recientes"];

  const consultaFilas = Prisma.sql`
    ${SELECT_BASE}
    WHERE ${donde}
    ${GROUP_BY}
    HAVING ${teniendo}
    ORDER BY ${orden}
    LIMIT ${limite} OFFSET ${skip}
  `;

  const consultaTotal = Prisma.sql`
    SELECT COUNT(*) AS total
    FROM (
      SELECT g.id
      FROM Garment g
      LEFT JOIN Category c ON c.id = g.categoryId
      LEFT JOIN SubCategory sc ON sc.id = g.subCategoryId
      LEFT JOIN Provider p ON p.id = g.supplierId
      LEFT JOIN GarmentVariant v ON v.garmentId = g.id AND v.tenantId = g.tenantId
      WHERE ${donde}
      GROUP BY g.id
      HAVING ${teniendo}
    ) AS subconsulta
  `;

  const [filasCrudas, conteo] = await Promise.all([
    prisma.$queryRaw<FilaCrudaConsulta[]>(consultaFilas),
    prisma.$queryRaw<Array<{ total: string | number }>>(consultaTotal),
  ]);

  const total = Number(conteo[0]?.total ?? 0);

  const ids = filasCrudas.map((fila) => fila.id);
  const imagenPorId = new Map<string, string>();
  if (ids.length > 0) {
    const imagenes = await prisma.garmentImage.findMany({
      where: { garmentId: { in: ids }, tenantId },
      orderBy: { order: "asc" },
      select: { garmentId: true, srcImage: true },
    });
    for (const imagen of imagenes) {
      if (!imagenPorId.has(imagen.garmentId)) {
        imagenPorId.set(imagen.garmentId, imagen.srcImage);
      }
    }
  }

  const variantesPorProducto = new Map<string, VarianteAdminResumen[]>();
  if (ids.length > 0) {
    const variantes = await prisma.garmentVariant.findMany({
      where: { garmentId: { in: ids }, tenantId },
      include: {
        optionValues: {
          include: {
            optionValue: { include: { option: true } },
          },
        },
      },
    });
    for (const variante of variantes) {
      const opcionValores = variante.optionValues.map((ov) => ({
        opcion: ov.optionValue.option.name,
        valor: ov.optionValue.value,
      }));
      const resumen: VarianteAdminResumen = {
        id: variante.id,
        nombre: opcionValores.map((ov) => ov.valor).join(" / "),
        stock: Number(variante.stock),
        sku: variante.sku ?? null,
        precioOverride: variante.priceOverride == null ? null : Number(variante.priceOverride),
        opcionValores,
      };
      const actuales = variantesPorProducto.get(variante.garmentId) ?? [];
      actuales.push(resumen);
      variantesPorProducto.set(variante.garmentId, actuales);
    }
  }

  const filas: ProductoAdminRow[] = filasCrudas.map((fila) => {
    const variantes = variantesPorProducto.get(fila.id) ?? [];
    return {
      id: fila.id,
      nombre: fila.nombre,
      precio: Number(fila.precio),
      precioMaximo: fila.precioMaximo == null ? null : Number(fila.precioMaximo),
      activo: Boolean(fila.activo),
      stockTotal: Number(fila.stockTotal ?? 0),
      cantidadVariantes: Number(fila.cantidadVariantes ?? 0),
      imagenPrincipal: imagenPorId.get(fila.id) ?? null,
      categoria: fila.categoriaNombre
        ? { id: fila.categoriaId, nombre: fila.categoriaNombre }
        : null,
      subcategoria: fila.subcategoriaNombre
        ? { id: fila.subcategoriaId ?? "", nombre: fila.subcategoriaNombre }
        : null,
      proveedor: fila.proveedorNombre
        ? { id: fila.proveedorId ?? "", nombre: fila.proveedorNombre }
        : null,
      creadoEn: fila.creadoEn instanceof Date ? fila.creadoEn.toISOString() : String(fila.creadoEn),
      esConVariantes: variantes.some((v) => v.opcionValores.length > 0),
      variantes,
    };
  });

  return {
    filas,
    total,
    pagina,
    totalPaginas: Math.max(1, Math.ceil(total / limite)),
  };
}
