import type { obtenerOpcionesTablasAdministrador } from "@/actions/personalizado/obtener-opciones-administrador";

export type DatosPersonalizado = NonNullable<
  Awaited<ReturnType<typeof obtenerOpcionesTablasAdministrador>>["data"]
>;

export type ModeloTabla = DatosPersonalizado["types"][number];
export type ColaTabla = DatosPersonalizado["tails"][number];
export type QuillaTabla = DatosPersonalizado["fins"][number];
export type ConfigQuillaTabla = DatosPersonalizado["configs"][number];
export type MaterialTabla = DatosPersonalizado["materials"][number];
export type EntregaTabla = DatosPersonalizado["deliveryOptions"][number];
