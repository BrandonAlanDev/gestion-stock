import { subirImagen } from "@/lib/services/imagenes-cloudinary/subir-imagen";

export async function subirImagenes(
  origenes: string[],
  carpeta: string,
  tenantId: string,
  prefijoBase = "imagen"
): Promise<Array<{ url: string; publicId: string; indice: number }>> {
  return Promise.all(
    origenes.map(async (origen, indice) => {
      const subida = await subirImagen(origen, carpeta, tenantId, `${prefijoBase}-${indice + 1}`);
      return { ...subida, indice };
    })
  );
}
