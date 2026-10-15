import "server-only";

/** Exige una clave privada para firmar el estado OAuth. */
export function obtenerSecretoFirma(): string {
  const secreto = process.env.AUTH_SECRET;
  if (!secreto) throw new Error("AUTH_SECRET no está configurado");
  return secreto;
}
