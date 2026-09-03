import cloudinary from "@/lib/cloudinary";
import { publicIdPerteneceTenant } from "@/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";

export async function moverImagen(
  publicIdViejo: string,
  carpetaNueva: string,
  tenantId: string
): Promise<{ url: string; publicId: string }> {
  if (!publicIdPerteneceTenant(publicIdViejo, tenantId)) {
    throw new Error("La imagen no pertenece a la tienda activa");
  }

  const nombre = publicIdViejo.split("/").pop() || "imagen";
  const publicIdNuevo = `${carpetaNueva}/${nombre}`;
  const resultado = await cloudinary.uploader.rename(publicIdViejo, publicIdNuevo, {
    type: "upload",
    overwrite: true,
  });
  console.log(`[CLOUDINARY][MOVIMIENTO] ${publicIdViejo} -> ${publicIdNuevo}`);
  return { url: resultado.secure_url, publicId: resultado.public_id };
}
