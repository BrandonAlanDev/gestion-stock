export type MetodoEntregaCheckout = "DOMICILIO" | "RETIRO_TIENDA";

export interface OpcionesEntregaCheckout {
  domicilioDisponible: boolean;
  retiroTiendaDisponible: boolean;
  direccionRetiro: string | null;
}

export interface ConfiguracionEntregaTienda {
  checkoutEnabled?: boolean | null;
  locationEnabled?: boolean | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
}

/** Calcula las modalidades usando únicamente la configuración del comercio. */
export function calcularOpcionesEntregaCheckout(
  configuracion: ConfiguracionEntregaTienda | null | undefined,
): OpcionesEntregaCheckout {
  const domicilioDisponible = configuracion?.checkoutEnabled === true;
  const [direccion, codigoPostal, ciudad, provincia, pais] = [
    configuracion?.address,
    configuracion?.postalCode,
    configuracion?.city,
    configuracion?.province,
    configuracion?.country,
  ].map((valor) => (typeof valor === "string" ? valor.trim() : ""));

  const direccionCompleta = [
    direccion,
    codigoPostal,
    ciudad,
    provincia,
    pais,
  ].every(Boolean);
  const retiroTiendaDisponible =
    domicilioDisponible &&
    configuracion?.locationEnabled === true &&
    direccionCompleta;

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
