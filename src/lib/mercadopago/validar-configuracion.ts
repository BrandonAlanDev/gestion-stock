import "server-only";

/**
 * Valida que las variables de entorno necesarias para el OAuth de Mercado Pago
 * estén presentes. Lanza un error descriptivo si falta alguna.
 */
export function validarConfiguracionOAuthMP(): void {
  const errores: string[] = [];

  if (!process.env.MP_CLIENT_ID) {
    errores.push("MP_CLIENT_ID no está definido en el .env");
  }
  if (!process.env.MP_CLIENT_SECRET) {
    errores.push("MP_CLIENT_SECRET no está definido en el .env");
  }

  if (errores.length > 0) {
    throw new Error(
      `Configuración incompleta para Mercado Pago OAuth:\n${errores.join("\n")}`,
    );
  }
}
