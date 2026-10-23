export type MetodoEntregaCheckout = "DOMICILIO" | "RETIRO_TIENDA";

export interface OpcionesEntregaCheckout {
  domicilioDisponible: boolean;
  retiroTiendaDisponible: boolean;
  direccionRetiro: string | null;
}

export interface ConfiguracionEntregaTienda {
  checkoutEnabled?: boolean | null;
  envioDomicilioEnabled?: boolean | null;
  retiroTiendaEnabled?: boolean | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
}

const CAMPOS_DIRECCION_RETIRO = [
  ["address", "dirección"],
  ["postalCode", "código postal"],
  ["city", "ciudad"],
  ["province", "provincia"],
  ["country", "país"],
] as const;

function normalizarCampo(valor: string | null | undefined): string {
  return typeof valor === "string" ? valor.trim() : "";
}

/** Devuelve los datos de dirección que faltan para ofrecer retiro en tienda. */
export function obtenerDatosFaltantesRetiro(
  configuracion: ConfiguracionEntregaTienda | null | undefined,
): string[] {
  return CAMPOS_DIRECCION_RETIRO
    .filter(([campo]) => !normalizarCampo(configuracion?.[campo]))
    .map(([, etiqueta]) => etiqueta);
}

/** Calcula las modalidades usando únicamente la configuración del comercio. */
export function calcularOpcionesEntregaCheckout(
  configuracion: ConfiguracionEntregaTienda | null | undefined,
): OpcionesEntregaCheckout {
  const checkoutHabilitado = configuracion?.checkoutEnabled === true;
  const domicilioDisponible =
    checkoutHabilitado && configuracion?.envioDomicilioEnabled === true;
  const retiroTiendaDisponible =
    checkoutHabilitado &&
    configuracion?.retiroTiendaEnabled === true &&
    obtenerDatosFaltantesRetiro(configuracion).length === 0;

  const [direccion, codigoPostal, ciudad, provincia, pais] =
    CAMPOS_DIRECCION_RETIRO.map(([campo]) => normalizarCampo(configuracion?.[campo]));

  return {
    domicilioDisponible,
    retiroTiendaDisponible,
    direccionRetiro: retiroTiendaDisponible
      ? `${direccion}, ${codigoPostal} ${ciudad}, ${provincia}, ${pais}`
      : null,
  };
}

export function estaDisponibleMetodoEntrega(
  opciones: OpcionesEntregaCheckout,
  metodo: MetodoEntregaCheckout,
): boolean {
  return metodo === "DOMICILIO"
    ? opciones.domicilioDisponible
    : opciones.retiroTiendaDisponible;
}
