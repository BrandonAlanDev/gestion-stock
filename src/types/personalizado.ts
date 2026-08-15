import type { getBoardAdminOptions } from "@/actions/admin-personalizado";

export type DatosPersonalizado = NonNullable<
  Awaited<ReturnType<typeof getBoardAdminOptions>>["data"]
>;

export type ModeloTabla = DatosPersonalizado["types"][number];
export type ColaTabla = DatosPersonalizado["tails"][number];
export type QuillaTabla = DatosPersonalizado["fins"][number];
export type ConfigQuillaTabla = DatosPersonalizado["configs"][number];
export type MaterialTabla = DatosPersonalizado["materials"][number];
export type EntregaTabla = DatosPersonalizado["deliveryOptions"][number];
