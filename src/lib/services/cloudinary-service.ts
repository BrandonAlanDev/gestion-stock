import cloudinary from "@/lib/cloudinary";
import type { UploadApiOptions } from "cloudinary";

export function obtenerRaizCloudinary(): string {
  return process.env.CLOUDINARY_UPLOAD_PROJECT_NAME?.trim() || "gestion-stock";
}

export function obtenerCarpetaPrenda(categoryId: string, garmentId: string): string {
  return `${obtenerRaizCloudinary()}/garments/${categoryId}/${garmentId}`;
}

export function obtenerCarpetaCarrusel(carouselId: string): string {
  return `${obtenerRaizCloudinary()}/carousels/${carouselId}`;
}

export function obtenerCarpetaGrids(homegridId: string): string {
  return `${obtenerRaizCloudinary()}/page-config/home-grids/${homegridId}`;
}

export function obtenerCarpetaIdentidad(): string {
  return `${obtenerRaizCloudinary()}/page-config/identidad`;
}

export async function subirImagen(
  origen: string,
  carpeta: string,
  prefijoNombre?: string
): Promise<{ url: string; publicId: string }> {
  const opciones: UploadApiOptions = {
    transformation: [
      { width: 2500, height: 2500, crop: "limit", quality: 90 },
    ],
  };
  if (prefijoNombre) {
    opciones.public_id = `${carpeta}/${prefijoNombre}`;
  } else {
    opciones.folder = carpeta;
  }
  const resultado = await cloudinary.uploader.upload(origen, opciones);
  console.log(`[CLOUDINARY][SUBIDA] carpeta=${carpeta} public_id=${resultado.public_id}`);
  return { url: resultado.secure_url, publicId: resultado.public_id };
}

export async function subirImagenes(
  origenes: string[],
  carpeta: string,
  prefijoBase = "imagen"
): Promise<Array<{ url: string; publicId: string; indice: number }>> {
  return Promise.all(
    origenes.map(async (origen, indice) => {
      const subida = await subirImagen(origen, carpeta, `${prefijoBase}-${indice + 1}`);
      return { url: subida.url, publicId: subida.publicId, indice };
    })
  );
}

export async function eliminarImagen(publicId: string): Promise<boolean> {
  try {
    const resultado = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    if (resultado.result === "ok" || resultado.result === "not found") {
      console.log(`[CLOUDINARY][ELIMINACION] public_id=${publicId} resultado=${resultado.result}`);
      return true;
    }
    console.error(
      `[CLOUDINARY][ELIMINACION] resultado inesperado public_id=${publicId}`,
      resultado
    );
    return false;
  } catch (error) {
    console.error(`[CLOUDINARY][ELIMINACION] public_id=${publicId}`, error);
    return false;
  }
}

export async function eliminarImagenes(
  publicIds: Array<string | null | undefined>
): Promise<boolean[]> {
  return Promise.all(
    publicIds.filter(Boolean).map((id) => eliminarImagen(id as string))
  );
}

export async function moverImagen(
  publicIdViejo: string,
  carpetaNueva: string
): Promise<{ url: string; publicId: string }> {
  const nombre = publicIdViejo.split("/").pop() || "imagen";
  const publicIdNuevo = `${carpetaNueva}/${nombre}`;
  const resultado = await cloudinary.uploader.rename(publicIdViejo, publicIdNuevo, {
    type: "upload",
    overwrite: true,
  });
  console.log(`[CLOUDINARY][MOVIMIENTO] ${publicIdViejo} -> ${publicIdNuevo}`);
  return { url: resultado.secure_url, publicId: resultado.public_id };
}

export function obtenerPublicIdDesdeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("cloudinary.com")) return null;

    const segmentos = parsed.pathname.split("/").filter(Boolean);
    const indiceUpload = segmentos.indexOf("upload");
    if (indiceUpload === -1) return null;

    const resto = segmentos.slice(indiceUpload + 1);
    if (resto.length === 0) return null;

    while (
      resto.length > 0 &&
      (resto[0].includes(",") || /^(v\d+|s--.*--|[a-z]_)/.test(resto[0]))
    ) {
      resto.shift();
    }
    if (resto.length === 0) return null;

    resto[resto.length - 1] = resto[resto.length - 1].replace(
      /\.(webp|png|jpe?g|gif|svg|avif|bmp|tiff?|ico|heic)$/i,
      ""
    );
    return resto.join("/");
  } catch {
    return null;
  }
}
