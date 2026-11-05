import { validarArchivoImagen } from "@/lib/services/imagenes-cloudinary/validar-archivo-imagen";

export async function leerImagenesFormulario(
  formulario: FormData,
  cantidadEsperada?: number,
  maximo?: number,
): Promise<Array<string | File>> {
  const imagenes = formulario.getAll("imagenes");
  if ((maximo !== undefined && imagenes.length > maximo) ||
    (cantidadEsperada !== undefined && imagenes.length !== cantidadEsperada)) {
    throw new Error(maximo === undefined
      ? "La cantidad de imágenes no coincide con los datos enviados."
      : `La cantidad de imágenes no es válida. El máximo es ${maximo}.`);
  }

  for (const imagen of imagenes) {
    if (imagen instanceof File) {
      await validarArchivoImagen(imagen);
    } else if (typeof imagen !== "string" || !imagen.trim() || imagen.startsWith("data:")) {
      throw new Error("La referencia de una imagen no es válida.");
    }
  }

  return imagenes;
}
