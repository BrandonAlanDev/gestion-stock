import { createHash } from "node:crypto";

export function sufijoCarpeta(id: string): string {
  if (!id.trim()) throw new Error("La identidad de la carpeta es obligatoria");
  return createHash("sha256").update(id).digest("hex").slice(0, 16);
}

/** El nombre queda legible y el sufijo mantiene la identidad ante duplicados o renombres. */
export function segmentoCarpeta(nombre: string, id: string, respaldo: string): string {
  const base = nombre.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-AR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .replace(/-$/g, "") || respaldo;
  return `${base}-${sufijoCarpeta(id)}`;
}
