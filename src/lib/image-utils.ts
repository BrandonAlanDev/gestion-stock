export function compressImage(
  file: File,
  maxWidth = 2500,
  maxHeight = 2500,
  quality = 0.95
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Si la imagen no supera el límite, se devuelve el original sin tocar (cero pérdida)
      if (img.naturalWidth <= maxWidth && img.naturalHeight <= maxHeight) {
        URL.revokeObjectURL(img.src);
        resolve(file);
        return;
      }

      // Calcular nuevas dimensiones manteniendo la proporción
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      // Dibujar en canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        reject(new Error("No se pudo obtener el contexto del canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(img.src);

      // Convertir a blob comprimido en WebP (conserva transparencia)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Error al comprimir la imagen"));
            return;
          }
          // Crear un nuevo File con el blob comprimido
          const compressedFile = new File([blob], file.name, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => reject(new Error("Error al cargar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}
