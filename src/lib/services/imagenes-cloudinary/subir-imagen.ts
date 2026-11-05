import cloudinary from "@/lib/cloudinary";
import type { UploadApiOptions } from "cloudinary";
import { randomUUID } from "node:crypto";
import { carpetaCloudinaryPerteneceTenant } from "@/lib/services/imagenes-cloudinary/public-id-pertenece-tenant";
import { validarArchivoImagen } from "@/lib/services/imagenes-cloudinary/validar-archivo-imagen";

type ImagenSubida = { url: string; publicId: string };

async function subirArchivo(archivo: File, opciones: UploadApiOptions): Promise<ImagenSubida> {
  await validarArchivoImagen(archivo);
  const contenido = Buffer.from(await archivo.arrayBuffer());
  return new Promise((resolver, rechazar) => {
    const flujo = cloudinary.uploader.upload_stream(opciones, (error, resultado) => {
      if (error) return rechazar(error);
      if (!resultado?.secure_url || !resultado.public_id) {
        return rechazar(new Error("Cloudinary no devolvió una imagen válida."));
      }
      resolver({ url: resultado.secure_url, publicId: resultado.public_id });
    });
    flujo.on("error", rechazar);
    flujo.end(contenido);
  });
}

export async function subirImagen(
  origen: File | string,
  carpeta: string,
  tenantId: string,
  prefijoNombre?: string
): Promise<ImagenSubida> {
  if (!carpetaCloudinaryPerteneceTenant(carpeta, tenantId)) {
    throw new Error("La carpeta de destino no pertenece a la tienda activa");
  }
  const opciones: UploadApiOptions = {
    transformation: [{ width: 2500, height: 2500, crop: "limit", quality: 90 }],
    overwrite: false,
    resource_type: "image",
  };
  if (prefijoNombre) opciones.public_id = `${carpeta}/${prefijoNombre}-${randomUUID()}`;
  else opciones.folder = carpeta;

  if (typeof origen === "string" && !/^https?:\/\//.test(origen)) {
    throw new Error("La imagen debe enviarse como archivo.");
  }
  const resultado = origen instanceof File
    ? await subirArchivo(origen, opciones)
    : await cloudinary.uploader.upload(origen, opciones).then((subida) => ({
      url: subida.secure_url,
      publicId: subida.public_id,
    }));
  if (!resultado.publicId.startsWith(`${carpeta}/`)) {
    throw new Error("Cloudinary devolvió una imagen fuera de la carpeta esperada.");
  }
  console.log(`[CLOUDINARY][SUBIDA] carpeta=${carpeta} public_id=${resultado.publicId}`);
  return resultado;
}
