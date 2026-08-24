import type { AreaRecorte, FormaRecorte } from "./tipos";

function cargarImagen(origen: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () =>
      reject(new Error("No se pudo cargar la imagen para el recorte"));
    imagen.src = origen;
  });
}

function esImagenPng(origen: string): boolean {
  return (
    origen.startsWith("data:image/png") || /\.png(\?.*)?$/i.test(origen)
  );
}

export async function generarImagenRecortada(
  imagen: string,
  area: AreaRecorte,
  formaRecorte: FormaRecorte
): Promise<string> {
  const fuente = await cargarImagen(imagen);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    throw new Error("No se pudo generar la imagen recortada");
  }

  if (formaRecorte === "redondeada") {
    contexto.save();
    contexto.beginPath();
    contexto.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
    contexto.clip();
  }

  contexto.drawImage(fuente, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);

  if (formaRecorte === "redondeada") contexto.restore();

  if (formaRecorte === "redondeada" || esImagenPng(imagen)) {
    return canvas.toDataURL("image/png");
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}
