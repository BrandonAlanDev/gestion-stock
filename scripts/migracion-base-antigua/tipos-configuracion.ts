export interface VariablesMigracion extends NodeJS.ProcessEnv {
  DATABASE_URL?: string;
  DATABASE_URL_ORIGEN?: string;
  TENANT_NOMBRE?: string;
  TENANT_SLUG?: string;
  TENANT_DOMINIO?: string;
}

export interface ConfiguracionTenantMigracion {
  nombre: string;
  slug: string;
  dominio: string | null;
}

export interface ConfiguracionMigracion {
  urlDestino: string;
  urlOrigen: string;
  tenant: ConfiguracionTenantMigracion;
  confirmar: boolean;
  omitirRelacionesHuerfanas: boolean;
}
