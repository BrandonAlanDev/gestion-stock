import { access, mkdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { cifrarRegistroLocal } from "../src/lib/tenants/registry/cifrado-registro-local";

const ARGUMENTOS = process.argv.slice(2);
const SALIDA = ARGUMENTOS.find((argumento) => argumento !== "--sobrescribir") ?? process.env.TENANT_REGISTRY_FILE ??
  path.join(process.cwd(), ".local", "tenant-registry.enc.json");
const SOBREESCRIBIR = ARGUMENTOS.includes("--sobrescribir");

async function yaExiste(ruta: string): Promise<boolean> {
  try {
    await access(ruta);
    return true;
  } catch {
    return false;
  }
}

async function cifrarDesdeEntrada(): Promise<void> {
  const clave = process.env.TENANT_REGISTRY_ENCRYPTION_KEY ?? "";
  if (!clave) throw new Error("Definí TENANT_REGISTRY_ENCRYPTION_KEY antes de cifrar el registro");
  if (!process.stdin.isTTY) {
    // La entrada se recibe por pipe para no guardar un JSON plano en el repositorio.
  } else {
    throw new Error("Enviá el JSON del registro por stdin; no se aceptan secretos como argumento");
  }

  const fragmentos: string[] = [];
  process.stdin.setEncoding("utf8");
  for await (const fragmento of process.stdin) fragmentos.push(fragmento);
  const contenido = fragmentos.join("").trim();
  if (!contenido) throw new Error("No se recibió contenido JSON por stdin");

  const ruta = path.resolve(SALIDA);
  if (!SOBREESCRIBIR && await yaExiste(ruta)) {
    throw new Error("El archivo ya existe; usá --sobrescribir si querés reemplazarlo");
  }

  const contenidoCifrado = cifrarRegistroLocal(contenido, clave);
  await mkdir(path.dirname(ruta), { recursive: true });
  const temporal = `${ruta}.${process.pid}.tmp`;
  await writeFile(temporal, `${contenidoCifrado}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
  await rename(temporal, ruta);
  console.log(`Registro cifrado guardado en ${ruta}`);
}

void cifrarDesdeEntrada().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "No se pudo cifrar el registro");
  process.exitCode = 1;
});
