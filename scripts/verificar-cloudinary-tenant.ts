import assert from "node:assert/strict";
import {
  carpetaCloudinaryPerteneceTenant,
  publicIdPerteneceTenant,
} from "../src/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";

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

assert.equal(
  carpetaCloudinaryPerteneceTenant("tenant-a/page-config/identidad", "tenant-a"),
  true,
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
