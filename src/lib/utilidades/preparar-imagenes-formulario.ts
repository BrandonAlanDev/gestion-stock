const TAMANIO_MAXIMO_IMAGEN_BYTES = 5 * 1024 * 1024;

export async function prepararImagenesFormulario(imagenes: Array<string | File>): Promise<FormData> {
  const formulario = new FormData();

  for (const imagen of imagenes) {
    if (imagen instanceof File) {
      formulario.append("imagenes", imagen);
      continue;
    }
    if (!imagen.startsWith("data:")) {
      formulario.append("imagenes", imagen);
      continue;
    }

    const respuesta = await fetch(imagen);
    const contenido = await respuesta.blob();
    if (!respuesta.ok || !contenido.type.startsWith("image/")) {
      throw new Error("No se pudo preparar la imagen para subirla.");
    }
    if (!contenido.size || contenido.size > TAMANIO_MAXIMO_IMAGEN_BYTES) {
      throw new Error("Cada imagen puede pesar hasta 5 MB.");
    }
    const extension = contenido.type === "image/jpeg" ? "jpg" : contenido.type.split("/")[1];
    formulario.append("imagenes", new File([contenido], `imagen.${extension}`, { type: contenido.type }));
  }

  return formulario;
}
