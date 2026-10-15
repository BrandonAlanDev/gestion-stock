export type RespuestaTokenMP = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  user_id?: number;
  refresh_token?: string;
  public_key?: string;
  live_mode?: boolean;
  message?: string;
  error_description?: string;
};

export type OpcionesGuardarCuentaMP = {
  /** Si true (por defecto), marca la conexión como lista para cobrar. */
  conectado?: boolean;
};

export type EstadoConexionMP = {
  conectada: boolean;
  nombreCuenta: string | null;
  actualizadaEn: string | null;
};

export type EstadoOAuthMP = {
  clientIdConfigurado: boolean;
  clientSecretConfigurado: boolean;
  uriRedireccion: string | null;
};
