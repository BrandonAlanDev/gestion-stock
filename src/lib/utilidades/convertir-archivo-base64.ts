export function convertirArchivoBase64(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result as string);
    lector.onerror = rechazar;
    lector.readAsDataURL(archivo);
  });
}
