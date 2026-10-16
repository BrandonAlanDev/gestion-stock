import cloudinary from "@/lib/cloudinary";
import type { UploadApiOptions } from "cloudinary";
import { carpetaCloudinaryPerteneceTenant } from "@/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";

export async function subirImagen(
  origen: string,
  carpeta: string,
  tenantId: string,
  prefijoNombre?: string
): Promise<{ url: string; publicId: string }> {
  if (!carpetaCloudinaryPerteneceTenant(carpeta, tenantId)) {
    throw new Error("La carpeta de destino no pertenece a la tienda activa");
  }
  const opciones: UploadApiOptions = {
    transformation: [{ width: 2500, height: 2500, crop: "limit", quality: 90 }],
  };
  if (prefijoNombre) opciones.public_id = `${carpeta}/${prefijoNombre}`;
  else opciones.folder = carpeta;

  const resultado = await cloudinary.uploader.upload(origen, opciones);
  console.log(`[CLOUDINARY][SUBIDA] carpeta=${carpeta} public_id=${resultado.public_id}`);
  return { url: resultado.secure_url, publicId: resultado.public_id };
}
