import { eliminarImagen } from "@/lib/services/imagenes-cloudinary/eliminar-imagen";

export async function eliminarImagenes(
  publicIds: Array<string | null | undefined>,
  tenantId: string
): Promise<boolean[]> {
  const idsValidos = publicIds.filter((id): id is string => Boolean(id));
  return Promise.all(idsValidos.map((id) => eliminarImagen(id, tenantId)));
}
