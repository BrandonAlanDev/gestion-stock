import cloudinary from "@/lib/cloudinary";
import { publicIdPerteneceTenant } from "@/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";

export async function eliminarImagen(publicId: string, tenantId: string): Promise<boolean> {
  if (!publicIdPerteneceTenant(publicId, tenantId)) {
    console.error(`[CLOUDINARY][ELIMINACION] public_id fuera del tenant=${tenantId}`);
    return false;
  }

  try {
    const resultado = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    if (resultado.result === "ok" || resultado.result === "not found") {
      console.log(`[CLOUDINARY][ELIMINACION] public_id=${publicId} resultado=${resultado.result}`);
      return true;
    }
    console.error(`[CLOUDINARY][ELIMINACION] resultado inesperado public_id=${publicId}`, resultado);
    return false;
  } catch (error) {
    console.error(`[CLOUDINARY][ELIMINACION] public_id=${publicId}`, error);
    return false;
  }
}
