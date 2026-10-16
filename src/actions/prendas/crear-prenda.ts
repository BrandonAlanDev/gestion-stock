"use server";

import { obtenerPublicIdDesdeUrl } from "@/lib/services/imagenes-cloudinary/obtener-public-id-desde-url";
import { obtenerCarpetaPrenda } from "@/lib/services/imagenes-cloudinary/obtener-carpeta-prenda";
import { eliminarImagenes } from "@/lib/services/imagenes-cloudinary/eliminar-imagenes";
import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";
import { crearRegistroPrenda } from "@/lib/services/prendas/crear-registro-prenda";
import { eliminarRegistroPrenda } from "@/lib/services/prendas/eliminar-registro-prenda";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { conPrismaTenant } from "@/lib/tenants/prisma-factory";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";
import { garmentSchema } from "@/lib/validaciones/esquemas";
import { crearAccionPrenda } from "@/lib/actions/prendas/crear-accion-prenda";
import { revalidateTag } from "next/cache";
import type { z } from "zod";

const ejecutarCrearPrenda = crearAccionPrenda({
  requiereAdmin,
  validar: (datos) => garmentSchema.safeParse(datos),
  conPrismaTenant,
  crearRegistroPrenda,
  eliminarRegistroPrenda,
  obtenerCarpetaPrenda,
  obtenerPublicIdDesdeUrl,
  eliminarImagenes,
  subirImagen,
  serializarDatos,
  revalidateTag,
  registrarError: (mensaje, error) => console.error(mensaje, error),
});

export async function crearPrenda(datos: z.input<typeof garmentSchema>) {
  return ejecutarCrearPrenda(datos);
}
