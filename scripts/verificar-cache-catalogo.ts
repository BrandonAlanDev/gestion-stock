import assert from "node:assert/strict";
import {
  guardarCategoriasCatalogo,
  guardarPaginaCatalogo,
  guardarProductosCatalogo,
  leerCategoriasCatalogo,
  leerPaginaCatalogo,
  leerPaginaFiltradaCompleta,
  leerProductosCatalogo,
} from "../src/lib/productos/cache-cliente";
import type { ProductoCatalogo } from "../src/types/productos/catalogo-publico";
import { idsTarjetasFaltantes } from "../src/lib/productos/versiones-catalogo";

const almacenamiento = new Map<string, string>();
const ubicacion = { host: "tienda-uno.test" };
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    location: ubicacion,
    localStorage: {
      getItem: (clave: string) => almacenamiento.get(clave) ?? null,
      setItem: (clave: string, valor: string) => { almacenamiento.set(clave, valor); },
    },
  },
});

const fechaReal = Date.now;
let ahora = fechaReal();
Date.now = () => ahora;

function producto(numero: number, categoryId: string, subCategoryId: string | null = null): ProductoCatalogo {
  return {
    id: `producto-${numero}`,
    name: `Producto ${numero}`,
    slug: `producto-${numero}`,
    categoryId,
    subCategoryId,
    price: 100 + numero,
    createdAt: new Date(ahora - numero * 1000).toISOString(),
    updatedAt: new Date(ahora).toISOString(),
    images: [{ srcImage: `/imagen-${numero}.jpg` }],
  };
}

try {
  const tenantId = "cliente-uno";
  const primeros = [
    ...Array.from({ length: 6 }, (_, indice) => producto(indice + 1, "categoria-a", "sub-a")),
    ...Array.from({ length: 44 }, (_, indice) => producto(indice + 10, "categoria-b")),
  ];
  const faltantes = Array.from({ length: 3 }, (_, indice) => producto(indice + 7, "categoria-a", "sub-a"));
  guardarCategoriasCatalogo(tenantId, [{
    id: "categoria-a", name: "Categoría A", totalProductos: 9,
    subCategories: [{ id: "sub-a", name: "Subcategoría A", totalProductos: 9 }],
  }]);
  guardarPaginaCatalogo(tenantId, 1, 50, undefined, undefined, primeros, 53, ahora);

  assert.equal(leerCategoriasCatalogo(tenantId)?.datos[0].totalProductos, 9);
  assert.equal(leerPaginaCatalogo(tenantId, 1, 50)?.productos.length, 50);
  assert.equal(leerPaginaCatalogo(tenantId, 1, 20), null);
  assert.equal(leerPaginaFiltradaCompleta(tenantId, 1, 50, "categoria-a", undefined, 9), null);

  const manifiesto = [...primeros.slice(0, 6), ...faltantes].map((item) => ({
    id: item.id, updatedAt: String(item.updatedAt), slug: item.slug,
  }));
  const versionesConocidas = primeros.map((item) => ({
    id: item.id, updatedAt: String(item.updatedAt), slug: item.slug,
  }));
  assert.deepEqual(idsTarjetasFaltantes(manifiesto, versionesConocidas),
    ["producto-7", "producto-8", "producto-9"]);

  guardarProductosCatalogo(tenantId, faltantes);
  const completa = leerPaginaFiltradaCompleta(tenantId, 1, 50, "categoria-a", "sub-a", 9);
  assert.equal(completa?.productos.length, 9);
  assert.deepEqual(completa?.productos.map((item) => item.id),
    Array.from({ length: 9 }, (_, indice) => `producto-${indice + 1}`));

  ahora += 1000;
  guardarProductosCatalogo(tenantId, [{ ...primeros[0], price: 999 }], ahora);
  assert.equal(leerProductosCatalogo(tenantId).find(({ datos }) => datos.id === "producto-1")?.datos.price, "101");
  guardarProductosCatalogo(tenantId, [{
    ...primeros[0], price: 999, updatedAt: new Date(ahora).toISOString(),
  }], ahora);
  assert.equal(leerProductosCatalogo(tenantId).find(({ datos }) => datos.id === "producto-1")?.datos.price, "999");
  assert.equal(leerProductosCatalogo(tenantId).find(({ datos }) => datos.id === "producto-2")?.datos.price, "102");
  assert.deepEqual(idsTarjetasFaltantes([
    { ...manifiesto[0], updatedAt: new Date(ahora).toISOString() },
    { ...manifiesto[1], slug: "producto-2-nuevo" },
  ], versionesConocidas), ["producto-1", "producto-2"]);

  assert.equal(leerProductosCatalogo("cliente-dos").length, 0);
  ubicacion.host = "tienda-dos.test";
  assert.equal(leerProductosCatalogo(tenantId).length, 0);
  ubicacion.host = "tienda-uno.test";

  ahora += 6 * 60 * 1000;
  assert.equal(leerProductosCatalogo(tenantId).length, 53);
  assert.equal(leerPaginaFiltradaCompleta(tenantId, 1, 50, "categoria-a", undefined, 9), null);
  ahora += 2 * 24 * 60 * 60 * 1000;
  assert.equal(leerProductosCatalogo(tenantId).length, 0);

  console.log("Caché del catálogo verificada: faltantes, versiones, vencimiento y aislamiento.");
} finally {
  Date.now = fechaReal;
}
