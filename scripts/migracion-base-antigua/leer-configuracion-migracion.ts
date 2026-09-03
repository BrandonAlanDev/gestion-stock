import type {
  ConfiguracionMigracion,
  VariablesMigracion,
} from "./tipos-configuracion";

const PATRON_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function leerConfiguracionMigracion(
  variables: VariablesMigracion = process.env,
  argumentos: readonly string[] = process.argv.slice(2),
): ConfiguracionMigracion {
  const urlDestino = exigirVariable(variables.DATABASE_URL, "DATABASE_URL");
  const urlOrigen = exigirVariable(
    variables.DATABASE_URL_ORIGEN,
    "DATABASE_URL_ORIGEN",
  );
  const nombre = exigirVariable(variables.TENANT_NOMBRE, "TENANT_NOMBRE");
  const slug = exigirVariable(variables.TENANT_SLUG, "TENANT_SLUG");
  const dominio = obtenerVariableOpcional(variables.TENANT_DOMINIO);

  if (!PATRON_SLUG.test(slug)) {
    throw new Error(
      "TENANT_SLUG debe contener solo minúsculas, números y guiones simples.",
    );
  }

  if (urlDestino === urlOrigen) {
    throw new Error(
      "DATABASE_URL_ORIGEN y DATABASE_URL deben apuntar a bases diferentes.",
    );
  }

  const argumentosDesconocidos = argumentos.filter(
    (argumento) => !["--confirmar", "--omitir-relaciones-huerfanas"].includes(argumento),
  );

  if (argumentosDesconocidos.length > 0) {
    throw new Error(
      `Argumento no reconocido: ${argumentosDesconocidos.join(", ")}.`,
    );
  }

  return {
    urlDestino,
    urlOrigen,
    tenant: {
      nombre,
      slug,
      dominio,
    },
    confirmar: argumentos.includes("--confirmar"),
    omitirRelacionesHuerfanas: argumentos.includes("--omitir-relaciones-huerfanas"),
  };
}

function exigirVariable(
  valor: string | undefined,
  nombreVariable: string,
): string {
  const valorLimpio = valor?.trim();

  if (!valorLimpio) {
    throw new Error(`Falta la variable obligatoria ${nombreVariable}.`);
  }

  return valorLimpio;
}

function obtenerVariableOpcional(valor: string | undefined): string | null {
  return valor?.trim() || null;
}
