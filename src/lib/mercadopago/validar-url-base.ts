import "server-only";

/**
 * Valida que la URL base usada en back_urls y notification_url sea una URL
 * absoluta y apta para el entorno. En producción exige HTTPS y rechaza
 * localhost, porque Mercado Pago no acepta esas URLs para cobros reales.
 */
export function validarUrlBase(baseUrl: string): void {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error(`La URL base "${baseUrl}" no es una URL absoluta válida`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("La URL base de Mercado Pago debe usar http o https");
  }

  if (process.env.NODE_ENV !== "production") return;

  const host = url.hostname;
  const esLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";
  if (url.protocol !== "https:" || esLocal) {
    throw new Error(
      "En producción la URL base de Mercado Pago debe ser HTTPS y no puede apuntar a localhost",
    );
  }
}
