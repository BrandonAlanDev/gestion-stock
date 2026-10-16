import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { cifrarRegistroLocal } from "../src/lib/tenants/registry/cifrado-registro-local";
import { obtenerPuertoPublicadoLoopback } from "./tenants/puerto-compose";

const TENANT_IDS = ["tenant-silo-a", "tenant-silo-b"] as const;
const RUTA_COMPOSE = path.join(process.cwd(), "scripts", "fixtures", "silos-test", "compose.yaml");

interface TenantFixture {
  id: string;
  nombre: string;
  slug: string;
  dominio: string;
  dominios: string[];
  estado: "PROVISIONING" | "ACTIVO";
  referenciaBase: string;
  versionCredenciales: string;
}

interface ConexionFixture {
  host: string;
  puerto: number;
  usuario: string;
  contrasena: string;
  base: string;
  ssl: false;
}

function ejecutar(
  comando: string,
  argumentos: string[],
  entorno: NodeJS.ProcessEnv,
): string {
  const resultado = spawnSync(comando, argumentos, {
    cwd: process.cwd(),
    env: entorno,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  });
  const salida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`;
  if (salida) process.stdout.write(salida);
  if (resultado.error || resultado.status !== 0) {
    const detalle = resultado.error instanceof Error
      ? resultado.error.message
      : `código de salida ${String(resultado.status)}`;
    throw new Error(`Falló ${comando} ${argumentos[0] ?? ""}: ${detalle}`);
  }
  return salida;
}

function argumentosCompose(
  proyecto: string,
  archivoEntorno: string,
  ...argumentos: string[]
): string[] {
  return [
    "compose",
    "--env-file",
    archivoEntorno,
    "--project-name",
    proyecto,
    "--file",
    RUTA_COMPOSE,
    ...argumentos,
  ];
}

function crearRegistro(
  estado: TenantFixture["estado"],
  puertoA: number,
  puertoB: number,
  usuario: string,
  contrasena: string,
): string {
  const tenants: TenantFixture[] = TENANT_IDS.map((id, indice) => {
    const sufijo = indice === 0 ? "a" : "b";
    const dominio = `tenant-${sufijo}.example.test`;
    return {
      id,
      nombre: `Silo descartable ${sufijo.toUpperCase()}`,
      slug: `silo-${sufijo}`,
      dominio,
      dominios: [dominio],
      estado,
      referenciaBase: `mysql/${id}`,
      versionCredenciales: "v1",
    };
  });
  const conexiones: Record<string, ConexionFixture> = {
    "mysql/tenant-silo-a": {
      host: "127.0.0.1",
      puerto: puertoA,
      usuario,
      contrasena,
      base: "silo_a_test",
      ssl: false,
    },
    "mysql/tenant-silo-b": {
      host: "127.0.0.1",
      puerto: puertoB,
      usuario,
      contrasena,
      base: "silo_b_test",
      ssl: false,
    },
  };
  return JSON.stringify({ version: 1, tenants, conexiones });
}

async function guardarRegistroCifrado(
  ruta: string,
  clave: string,
  estado: TenantFixture["estado"],
  puertoA: number,
  puertoB: number,
  usuario: string,
  contrasena: string,
): Promise<void> {
  await writeFile(
    ruta,
    `${cifrarRegistroLocal(crearRegistro(estado, puertoA, puertoB, usuario, contrasena), clave)}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("La verificación real de silos no se ejecuta con NODE_ENV=production");
  }
  ejecutar("docker", ["compose", "version"], process.env);

  const temporal = await mkdtemp(path.join(os.tmpdir(), "gestion-stock-silos-"));
  const archivoVacio = path.join(temporal, "dotenv-vacio");
  const rutaRegistro = path.join(temporal, "tenant-registry.enc.json");
  const proyecto = `gestion-stock-silos-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  const claveRegistro = randomBytes(32).toString("hex");
  const usuario = "silo_test";
  const contrasena = randomBytes(32).toString("base64url");
  const contrasenaRoot = randomBytes(32).toString("base64url");
  let composeIniciado = false;
  let errorFinal: unknown;

  const entorno: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "development",
    DATABASE_URL: "mysql://disabled:disabled@127.0.0.1:1/no_database_selected",
    DOTENV_CONFIG_PATH: archivoVacio,
    TENANT_REGISTRY_FILE: rutaRegistro,
    TENANT_REGISTRY_ENCRYPTION_KEY: claveRegistro,
    SILO_TEST_ROOT_PASSWORD: contrasenaRoot,
    SILO_TEST_USER: usuario,
    SILO_TEST_PASSWORD: contrasena,
    TENANT_MIGRATION_MODE: "1",
    TENANT_MIGRATION_IDS: TENANT_IDS.join(","),
    TENANT_MIGRATION_CONFIRM: TENANT_IDS.join(","),
    TENANT_MIGRATION_BASELINE_RECONCILED: "1",
    // Aprobación acotada a las bases vacías creadas por este ensayo descartable.
    TENANT_MIGRATION_ACK_DESTRUCTIVE: [
      "20260715030342_add_carousel_limits_to_pageconfig",
      "20260830020000_multitenancy_paso2",
      "20260910000000_eliminar_tablas_surf_y_flags",
    ].join(","),
    TENANT_SILO_TEST_MODE: "1",
    TENANT_SILO_TEST_IDS: TENANT_IDS.join(","),
    TENANT_SILO_ISOLATION_TEST_MODE: "1",
    TENANT_SILO_ISOLATION_TEST_IDS: TENANT_IDS.join(","),
  };

  try {
    await writeFile(archivoVacio, "", { encoding: "utf8", flag: "wx" });
    console.log(`Proyecto Compose descartable: ${proyecto}`);
    composeIniciado = true;
    ejecutar("docker", argumentosCompose(
      proyecto,
      archivoVacio,
      "up",
      "--detach",
      "--wait",
      "--wait-timeout",
      "180",
    ), entorno);

    const puertoA = obtenerPuertoPublicadoLoopback(ejecutar(
      "docker",
      argumentosCompose(proyecto, archivoVacio, "port", "mysql-a", "3306"),
      entorno,
    ));
    const puertoB = obtenerPuertoPublicadoLoopback(ejecutar(
      "docker",
      argumentosCompose(proyecto, archivoVacio, "port", "mysql-b", "3306"),
      entorno,
    ));
    if (puertoA === puertoB) throw new Error("Compose publicó ambos MySQL en el mismo puerto");
    await guardarRegistroCifrado(
      rutaRegistro,
      claveRegistro,
      "PROVISIONING",
      puertoA,
      puertoB,
      usuario,
      contrasena,
    );

    const cli = [
      "--conditions=react-server",
      "./node_modules/ts-node/dist/bin.js",
      "--project",
      "tsconfig.scripts.json",
    ];
    const scriptMigracion = "scripts/migrar-silos-tenant.ts";
    const plan = ejecutar(process.execPath, [...cli, scriptMigracion, "--planificar"], entorno);
    const confirmacion = plan.match(/^Destinos resueltos \(sin credenciales\):\s*(.+)$/m)?.[1]?.trim();
    if (!confirmacion) throw new Error("El plan de migración no imprimió la confirmación de destinos esperada");

    const entornoMigracion: NodeJS.ProcessEnv = {
      ...entorno,
      TENANT_MIGRATION_CONFIRM_TARGETS: confirmacion,
    };
    ejecutar(process.execPath, [...cli, scriptMigracion], entornoMigracion);

    await guardarRegistroCifrado(
      rutaRegistro,
      claveRegistro,
      "ACTIVO",
      puertoA,
      puertoB,
      usuario,
      contrasena,
    );
    ejecutar(process.execPath, [...cli, "scripts/verificar-silos.ts"], entorno);
    ejecutar(process.execPath, [...cli, "scripts/verificar-aislamiento-silos.ts"], entorno);
    console.log("Prueba real completa: dos contenedores MySQL independientes, migraciones idénticas y aislamiento funcional verificados.");
  } catch (error) {
    errorFinal = error;
  } finally {
    if (composeIniciado) {
      try {
        ejecutar("docker", argumentosCompose(
          proyecto,
          archivoVacio,
          "down",
          "--remove-orphans",
        ), entorno);
      } catch (error) {
        if (errorFinal) {
          console.error("También falló la limpieza del proyecto Compose temporal.");
        } else {
          errorFinal = error;
        }
      }
    }
    try {
      await rm(temporal, { recursive: true, force: true });
    } catch (error) {
      if (errorFinal) {
        console.error("También falló la limpieza de los archivos temporales de la prueba.");
      } else {
        errorFinal = error;
      }
    }
  }

  if (errorFinal) throw errorFinal;
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
