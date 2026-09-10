interface PreferenciaConUrls {
  init_point?: string;
  sandbox_init_point?: string;
}

export type ResultadoUrlCheckout = {
  url: string;
  esSandbox: boolean;
};

/**
 * Devuelve la URL correcta del checkout según el tipo de token de acceso.
 * Con credenciales de prueba (token `TEST-...`) MP devuelve `sandbox_init_point`;
 * con credenciales de producción devuelve `init_point`.
 */
export function obtenerUrlCheckout(
  preferencia: PreferenciaConUrls,
  tokenAcceso: string,
): ResultadoUrlCheckout {
  const esSandbox = tokenAcceso.startsWith("TEST-");
  if (esSandbox) {
    return {
      url: preferencia.sandbox_init_point ?? preferencia.init_point ?? "",
      esSandbox: true,
    };
  }
  return {
    url: preferencia.init_point ?? preferencia.sandbox_init_point ?? "",
    esSandbox: false,
  };
}
