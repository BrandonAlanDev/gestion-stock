import assert from "node:assert/strict";
import type { PrismaClient } from "../generated/prisma/client";
import {
  crearAccionPrenda,
  type DependenciasCrearAccionPrenda,
} from "../src/lib/actions/prendas/crear-accion-prenda";
import { garmentSchema } from "../src/lib/validaciones/esquemas";

const clienteFalso = {} as PrismaClient;
const entrada = {
  name: "Remera de prueba",
  price: 1500,
  categoryId: "categoria-b",
  variants: [{ stock: 2, opcionValores: [] }],
  tenantId: "tenant-b",
};

function crearDependencias(
  requiereAdmin: DependenciasCrearAccionPrenda["requiereAdmin"],
  categoriaDisponibleEnTenantA: boolean,
) {
  const tenantsConsultados: string[] = [];
  const escrituras: Array<{ tenantId: string; categoryId: string }> = [];
  const tagsInvalidados: string[] = [];
  const dependencias: DependenciasCrearAccionPrenda = {
    requiereAdmin,
    validar: (datos) => garmentSchema.safeParse(datos),
    conPrismaTenant: async (tenantId, operacion) => {
      tenantsConsultados.push(tenantId);
      return operacion(clienteFalso);
    },
    crearRegistroPrenda: async (_prisma, tenantId, datos) => {
      escrituras.push({ tenantId, categoryId: datos.categoryId });
      if (datos.categoryId === "categoria-b" && !categoriaDisponibleEnTenantA) {
        throw new Error("Categoría no encontrada");
      }
      return { id: "prenda-nueva" };
    },
    eliminarRegistroPrenda: async () => ({ count: 1 }),
    obtenerCarpetaPrenda: (tenantId, categoryId, garmentId) =>
      `tiendas/${tenantId}/categorias/${categoryId}/prendas/${garmentId}`,
    obtenerPublicIdDesdeUrl: () => null,
    eliminarImagenes: async () => [],
    subirImagen: async () => ({ url: "https://example.com/image.jpg", publicId: "fixture" }),
    serializarDatos: (datos) => datos,
    revalidateTag: (tag) => tagsInvalidados.push(tag),
    registrarError: () => undefined,
  };
  return { dependencias, tenantsConsultados, escrituras, tagsInvalidados };
}

async function verificarAccesoNoAutorizado() {
  const estado = crearDependencias(async () => {
    throw new Error("No autorizado");
  }, true);
  const accion = crearAccionPrenda(estado.dependencias);
  await assert.rejects(accion(entrada), /No autorizado/);
  assert.deepEqual(estado.tenantsConsultados, []);
  assert.deepEqual(estado.escrituras, []);
}

async function verificarResolucionYSilo() {
  const estado = crearDependencias(async () => ({ tenantId: "tenant-a" }), false);
  const accion = crearAccionPrenda(estado.dependencias);
  const resultado = await accion(entrada);

  assert.deepEqual(resultado, {
    error: "No se pudo crear el producto. Revisá los datos e intentá nuevamente.",
  });
  assert.deepEqual(estado.tenantsConsultados, ["tenant-a"]);
  assert.deepEqual(estado.escrituras, [{ tenantId: "tenant-a", categoryId: "categoria-b" }]);
  assert.deepEqual(estado.tagsInvalidados, []);
}

async function verificarCreacionEnTenantAutorizado() {
  const estado = crearDependencias(async () => ({ tenantId: "tenant-a" }), true);
  const accion = crearAccionPrenda(estado.dependencias);
  const resultado = await accion({ ...entrada, categoryId: "categoria-a" });

  assert.equal(resultado.success, true);
  assert.deepEqual(estado.tenantsConsultados, ["tenant-a"]);
  assert.deepEqual(estado.escrituras, [{ tenantId: "tenant-a", categoryId: "categoria-a" }]);
  assert.deepEqual(estado.tagsInvalidados, ["tenant:tenant-a:products"]);
}

async function main() {
  await verificarAccesoNoAutorizado();
  await verificarResolucionYSilo();
  await verificarCreacionEnTenantAutorizado();
  console.log("Aislamiento de la acción de creación de prendas verificado.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
