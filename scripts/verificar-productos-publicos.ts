import assert from "node:assert/strict";
import { crearIndiceProductosPublicos, normalizarNombreProducto, resolverIdProductoPorSegmento } from "../src/lib/productos/slugs-producto";
import { calcularDisponibilidad } from "../src/lib/productos/disponibilidad-producto";

const primero = { id: "producto-1", name: "LESS DÚO GIGI DOTS", createdAt: "2026-01-01" };
const segundo = { id: "producto-2", name: "Less Duo Gigi Dots", createdAt: "2026-02-01" };
const unico = { id: "producto-3", name: "Vestido Lino" };
const categoria = { id: "producto-4", name: "Accesorios" };
const constructor = { id: "producto-5", name: "Constructor" };
const item = { id: "producto-6", name: "Item" };

assert.equal(normalizarNombreProducto(primero.name), "less-duo-gigi-dots");
const indice = crearIndiceProductosPublicos([segundo, unico, primero, categoria, constructor, item], ["Accesorios"]);
assert.equal(indice.porId[unico.id].slug, "vestido-lino");
assert.match(indice.porId[primero.id].slug, /^less-duo-gigi-dots-[a-f0-9]{8,}$/);
assert.notEqual(indice.porId[primero.id].slug, indice.porId[segundo.id].slug);
assert.equal(indice.porSlug[indice.porId[segundo.id].slug], segundo.id);
assert.equal(indice.porBase["less-duo-gigi-dots"], primero.id);
assert.match(indice.porId[categoria.id].slug, /^accesorios-[a-f0-9]{8,}$/);
assert.equal(indice.porBase.constructor, constructor.id);
assert.match(indice.porId[item.id].slug, /^item-[a-f0-9]{8,}$/);
assert.equal(resolverIdProductoPorSegmento("less-duo-gigi-dots", indice), primero.id);
assert.equal(resolverIdProductoPorSegmento("toString", indice), null);
assert.equal(
  resolverIdProductoPorSegmento(indice.porId[primero.id].slug, crearIndiceProductosPublicos([primero], [])),
  primero.id,
);
assert.deepEqual(
  crearIndiceProductosPublicos([primero, segundo, categoria, unico, constructor, item], ["Accesorios"]).porId,
  indice.porId,
);

const modelo = {
  grupos: [
    { name: "Talle", values: [{ id: "M", value: "M" }, { id: "L", value: "L" }] },
    { name: "Color", values: [{ id: "Rojo", value: "Rojo" }, { id: "Azul", value: "Azul" }] },
  ],
  variantes: [
    { id: "variante-1", stock: 0, sku: null, priceOverride: null, combinacion: { Talle: "M", Color: "Rojo" } },
    { id: "variante-2", stock: 0, sku: null, priceOverride: null, combinacion: { Talle: "L", Color: "Azul" } },
  ],
};
assert.equal(calcularDisponibilidad(modelo, { Talle: "M" }, false).disponiblePorGrupo.Color.Rojo, true);
assert.equal(calcularDisponibilidad(modelo, { Talle: "M" }, false).disponiblePorGrupo.Color.Azul, false);
assert.equal(calcularDisponibilidad(modelo, { Talle: "M", Color: "Rojo" }, false).comboValido, true);
assert.equal(calcularDisponibilidad(modelo, { Talle: "M", Color: "Azul" }, false).comboValido, false);

console.log("Slugs, nombres repetidos, categorías y selección de variantes verificados.");
