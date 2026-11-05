import assert from "node:assert/strict";
import type { PrismaClient } from "../generated/prisma/client";
import { crearAccionPrenda, type DependenciasCrearAccionPrenda } from "../src/lib/actions/prendas/crear-accion-prenda";
import { leerImagenesFormulario } from "../src/lib/services/imagenes-cloudinary/leer-imagenes-formulario";
import { validarArchivoImagen } from "../src/lib/services/imagenes-cloudinary/validar-archivo-imagen";
import { obtenerCarpetaPrenda } from "../src/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { segmentoCarpeta } from "../src/lib/services/imagenes-cloudinary/segmento-carpeta";
import { carpetaCloudinaryPerteneceTenant } from "../src/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";
import { prepararImagenesFormulario } from "../src/lib/utilidades/preparar-imagenes-formulario";
import { garmentSchema } from "../src/lib/validaciones/esquemas";

const cabeceraPng = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const imagenValida = new File([cabeceraPng], "imagen.png", { type: "image/png" });

async function verificar() {
  await validarArchivoImagen(imagenValida);
  await assert.rejects(
    validarArchivoImagen(new File([cabeceraPng], "falsa.jpg", { type: "image/jpeg" })),
    /contenido del archivo/,
  );

  const formulario = new FormData();
  for (let indice = 0; indice < 5; indice++) formulario.append("imagenes", imagenValida);
  assert.equal((await leerImagenesFormulario(formulario, 5, 5)).length, 5);
  formulario.append("imagenes", imagenValida);
  await assert.rejects(leerImagenesFormulario(formulario, undefined, 5), /máximo es 5/);

  const convertido = await prepararImagenesFormulario([
    `data:image/png;base64,${Buffer.from(cabeceraPng).toString("base64")}`,
  ]);
  assert.ok(convertido.get("imagenes") instanceof File);

  const producto = {
    name: "Producto de prueba",
    price: 100,
    categoryId: "categoria-1",
    variants: [{ stock: 1 }],
    images: Array.from({ length: 5 }, (_, indice) => `https://example.com/${indice}.png`),
  };
  assert.equal(garmentSchema.safeParse(producto).success, true);
  assert.equal(garmentSchema.safeParse({ ...producto, images: [...producto.images, "https://example.com/6.png"] }).success, false);

  const carpeta = obtenerCarpetaPrenda(
    "tenant-a", "Tienda Álamo", "categoria-1", "Remeras", "producto-1", "Remera Azul",
  );
  assert.equal(carpeta, [
    segmentoCarpeta("Tienda Álamo", "tenant-a", "cliente"),
    "productos",
    segmentoCarpeta("Remeras", "categoria-1", "categoria"),
    segmentoCarpeta("Remera Azul", "producto-1", "producto"),
  ].join("/"));
  assert.equal(carpetaCloudinaryPerteneceTenant(carpeta, "tenant-a"), true);
  assert.equal(carpetaCloudinaryPerteneceTenant(carpeta, "tenant-b"), false);

  const filas: Array<{ srcImage: string; order: number }> = [];
  let carpetaSubida = "";
  const prismaFalso = {
    category: {
      findUniqueOrThrow: async () => ({ name: "Remeras" }),
    },
    garmentImage: {
      createMany: async ({ data }: { data: Array<{ srcImage: string; order: number }> }) => {
        filas.push(...data);
        return { count: data.length };
      },
    },
  } as unknown as PrismaClient;
  const dependencias: DependenciasCrearAccionPrenda = {
    requiereAdmin: async () => ({ tenantId: "tenant-a", tenantNombre: "Tienda Álamo" }),
    validar: (datos) => garmentSchema.safeParse(datos),
    conPrisma: async (operacion) => operacion(prismaFalso),
    crearRegistroPrenda: async () => ({ id: "producto-1" }),
    eliminarRegistroPrenda: async () => ({ count: 1 }),
    obtenerCarpetaPrenda,
    obtenerPublicIdDesdeUrl: () => null,
    eliminarImagenes: async () => [],
    subirImagen: async (_origen, destino) => {
      carpetaSubida = destino;
      return { url: "https://example.com/subida.png", publicId: `${destino}/imagen` };
    },
    serializarDatos: (datos) => datos,
    revalidateTag: () => undefined,
    registrarError: (_mensaje, error) => { throw error; },
  };
  const orden = new FormData();
  orden.append("imagenes", "https://example.com/portada.png");
  orden.append("imagenes", "https://example.com/detalle.png");
  const resultado = await crearAccionPrenda(dependencias)({
    name: producto.name,
    price: producto.price,
    categoryId: producto.categoryId,
    variants: producto.variants,
  }, orden);
  assert.equal(resultado.success, true);
  assert.deepEqual(filas.map(({ srcImage, order }) => [srcImage, order]), [
    ["https://example.com/portada.png", 0],
    ["https://example.com/detalle.png", 1],
  ]);
  const formularioArchivo = new FormData();
  formularioArchivo.append("imagenes", imagenValida);
  const resultadoArchivo = await crearAccionPrenda(dependencias)({
    name: "Remera Azul",
    price: producto.price,
    categoryId: producto.categoryId,
    variants: producto.variants,
  }, formularioArchivo);
  assert.equal(resultadoArchivo.success, true);
  assert.equal(carpetaSubida, carpeta);
  console.log("Archivos, límite, aislamiento y orden de portada verificados.");
}

verificar().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
