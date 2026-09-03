import assert from "node:assert/strict";
import { reasignarContenidoFila } from "./reasignar-contenido-fila";
import { reasignarEnlaceContenido } from "./reasignar-enlace-contenido";
import type { MapaIds } from "./tipos-migracion";

const mapas: MapaIds = new Map([
  ["Category", new Map([["categoria-vieja", "categoria-nueva"]])],
  ["SubCategory", new Map([["subcategoria-vieja", "subcategoria-nueva"]])],
  ["Garment", new Map([["producto-viejo", "producto-nuevo"]])],
  ["Carousel", new Map([["carrusel-viejo", "carrusel-nuevo"]])],
]);
const nombres = new Map([["Category", new Set(["tablas de surf"])] ]);
assert.equal(reasignarEnlaceContenido("categoria-vieja", mapas, "CATEGORY"), "categoria-nueva");
assert.equal(reasignarEnlaceContenido("producto-viejo", mapas, "PRODUCT"), "producto-nuevo");
assert.equal(reasignarEnlaceContenido("/productos/item/producto-viejo?origen=home#detalle", mapas),
  "/productos/item/producto-nuevo?origen=home#detalle");
assert.equal(reasignarEnlaceContenido("/productos?categoria=categoria-vieja&subcategoria=subcategoria-vieja", mapas),
  "/productos?categoria=categoria-nueva&subcategoria=subcategoria-nueva");
assert.equal(reasignarEnlaceContenido("/productos?categoria=Tablas%20de%20surf", mapas, undefined, nombres),
  "/productos?categoria=Tablas+de+surf");
assert.equal(reasignarEnlaceContenido("https://otra.tienda/productos/item/producto-viejo", mapas),
  "https://otra.tienda/productos/item/producto-viejo");
assert.deepEqual(reasignarContenidoFila("PageConfig", {
  sectionOrder: '["hero","carousel_carrusel-viejo","location"]',
}, mapas), { sectionOrder: '["hero","carousel_carrusel-nuevo","location"]' });
assert.deepEqual(reasignarContenidoFila("CarouselSlide", {
  url: "producto-viejo", config: '{"linkType":"PRODUCT"}', image: "producto-viejo", publicId: "producto-viejo",
}, mapas), { url: "producto-nuevo" });
assert.deepEqual(reasignarContenidoFila("CustomPageSections", {
  config: { buttonLink: "/productos/item/producto-viejo", description: "producto-viejo", image: "producto-viejo" },
}, mapas), {
  config: '{"buttonLink":"/productos/item/producto-nuevo","description":"producto-viejo","image":"producto-viejo"}',
});
assert.throws(() => reasignarContenidoFila("PageConfig", { sectionOrder: '["carousel_ausente"]' }, mapas), /inexistente/);
assert.throws(() => reasignarEnlaceContenido("ausente", mapas, "PRODUCT"), /inexistente/);
assert.throws(() => reasignarEnlaceContenido("/productos?categoria=ausente", mapas), /inexistente/);
console.log("Referencias de contenido verificadas sin conexiones ni escrituras en bases de datos.");
