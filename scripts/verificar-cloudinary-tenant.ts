import assert from "node:assert/strict";
import {
  carpetaCloudinaryPerteneceTenant,
  publicIdPerteneceTenant,
} from "../src/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";
import { obtenerCarpetaPrenda } from "../src/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { obtenerCarpetaCarrusel } from "../src/lib/services/imagenes-cloudinary/obtener-carpeta-carrusel";
import { obtenerCarpetaGrids } from "../src/lib/services/imagenes-cloudinary/obtener-carpeta-grids";
import { obtenerCarpetaIdentidad } from "../src/lib/services/imagenes-cloudinary/obtener-carpeta-identidad";
import { obtenerRaizCloudinary } from "../src/lib/services/imagenes-cloudinary/obtener-raiz-cloudinary";

const carpetaNombrada = obtenerCarpetaPrenda(
  "tenant-a", "Tienda Álamo", "categoria-1", "Remeras", "producto-1", "Remera Azul",
);
assert.match(carpetaNombrada, /^tienda-alamo-[a-f0-9]{16}\/productos\/remeras-[a-f0-9]{16}\/remera-azul-[a-f0-9]{16}$/);
assert.notEqual(obtenerRaizCloudinary("tenant-a", "Tienda Álamo"), obtenerRaizCloudinary("tenant-b", "Tienda Álamo"));
assert.notEqual(
  obtenerCarpetaPrenda("tenant-a", "Tienda Álamo", "categoria-1", "Remeras", "producto-1", "Remera Azul"),
  obtenerCarpetaPrenda("tenant-a", "Tienda Álamo", "categoria-1", "Remeras", "producto-2", "Remera Azul"),
);
assert.equal(publicIdPerteneceTenant(`${carpetaNombrada}/imagen`, "tenant-a"), true);
assert.equal(publicIdPerteneceTenant(`${carpetaNombrada}/imagen`, "tenant-b"), false);
assert.equal(carpetaCloudinaryPerteneceTenant(carpetaNombrada, "tenant-a"), true);
assert.equal(carpetaCloudinaryPerteneceTenant(carpetaNombrada, "tenant-b"), false);
assert.equal(publicIdPerteneceTenant(`${obtenerRaizCloudinary("tenant-a", "Nombre anterior")}/imagen`, "tenant-a"), true);
assert.match(obtenerCarpetaCarrusel("tenant-a", "Tienda Álamo", "carrusel-1", "Ofertas"), /\/carruseles\/ofertas-[a-f0-9]{16}$/);
assert.match(obtenerCarpetaGrids("tenant-a", "Tienda Álamo", "grilla-1", "Destacados"), /\/configuracion\/grillas\/destacados-[a-f0-9]{16}$/);
assert.match(obtenerCarpetaIdentidad("tenant-a", "Tienda Álamo"), /\/configuracion\/identidad$/);

assert.equal(
  publicIdPerteneceTenant("tenant-a/garments/category/product/image", "tenant-a"),
  true,
);
assert.equal(
  publicIdPerteneceTenant("tenant-b/garments/category/product/image", "tenant-a"),
  false,
);
assert.equal(
  publicIdPerteneceTenant("gestion-stock/tenants/tenant-a/product/image", "tenant-a"),
  true,
);
assert.equal(
  publicIdPerteneceTenant("gestion-stock/producto-historico", "tenant-a"),
  false,
);
assert.equal(
  publicIdPerteneceTenant("otro/tenants/tenant-a/product/image", "tenant-a"),
  false,
);
assert.equal(publicIdPerteneceTenant("tenant-a/../tenant-b/image", "tenant-a"), false);
assert.equal(publicIdPerteneceTenant("tienda-alamo-0000000000000000/productos/imagen", "tenant-a"), false);

assert.equal(
  carpetaCloudinaryPerteneceTenant("tenant-a/page-config/identidad", "tenant-a"),
  false,
);
assert.equal(
  carpetaCloudinaryPerteneceTenant("tenant-b/page-config/identidad", "tenant-a"),
  false,
);
assert.equal(
  carpetaCloudinaryPerteneceTenant("tenant-a/../tenant-b", "tenant-a"),
  false,
);

console.log("Aislamiento Cloudinary: propietario, destino y rutas históricas verificados.");
