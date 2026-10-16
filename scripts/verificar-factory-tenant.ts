import assert from "node:assert/strict";
import { GestorClientesTenant } from "../src/lib/tenants/gestor-clientes-tenant";
import { crearOpcionesPoolTenant } from "../src/lib/tenants/opciones-pool-tenant";
import type { TenantRegistryEntry } from "../src/lib/tenants/registry/types";

interface ClienteFalso {
  id: number;
  desconectado: boolean;
}

function crearEntrada(
  id: string,
  referenciaBase = `mysql/${id}`,
  versionCredenciales = "v1",
): TenantRegistryEntry {
  return {
    tenant: {
      id,
      nombre: id,
      slug: id,
      dominio: `${id}.example.com`,
      estado: "ACTIVO",
    },
    dominios: [`${id}.example.com`],
    referenciaBase,
    versionCredenciales,
  };
}

function diferida<T>() {
  let resolver!: (valor: T) => void;
  const promesa = new Promise<T>((resolve) => { resolver = resolve; });
  return { promesa, resolver };
}

function crearGestor(
  opciones: {
    limite?: number;
    ttl?: number;
    ahora?: () => number;
    crear?: (entrada: TenantRegistryEntry) => Promise<ClienteFalso>;
  } = {},
) {
  let siguienteId = 0;
  const creados: ClienteFalso[] = [];
  const gestor = new GestorClientesTenant<ClienteFalso>({
    limiteClientes: opciones.limite ?? 10,
    ttlInactividadMs: opciones.ttl ?? 100,
    ahora: opciones.ahora,
    async crearCliente(entrada) {
      const cliente = opciones.crear
        ? await opciones.crear(entrada)
        : { id: ++siguienteId, desconectado: false };
      creados.push(cliente);
      return cliente;
    },
    async desconectarCliente(cliente) {
      cliente.desconectado = true;
    },
  });
  return { gestor, creados };
}

async function verificarCreacionConcurrenteUnica(): Promise<void> {
  const conectar = diferida<ClienteFalso>();
  const inicio = diferida<void>();
  let llamadasCrear = 0;
  const { gestor } = crearGestor({
    crear: async () => {
      llamadasCrear += 1;
      inicio.resolver();
      return conectar.promesa;
    },
  });
  const entrada = crearEntrada("tenant-concurrente");
  const operaciones = Array.from({ length: 20 }, () =>
    gestor.ejecutar(entrada, async (cliente) => cliente.id),
  );

  await inicio.promesa;
  conectar.resolver({ id: 1, desconectado: false });
  assert.deepEqual(await Promise.all(operaciones), Array(20).fill(1));
  assert.equal(llamadasCrear, 1, "Las solicitudes concurrentes deben compartir un solo cliente");
}

async function verificarReferenciaDuplicada(): Promise<void> {
  const { gestor } = crearGestor();
  await gestor.ejecutar(crearEntrada("tenant-a", "mysql/compartida"), async () => undefined);
  await assert.rejects(
    gestor.ejecutar(crearEntrada("tenant-b", "mysql/compartida"), async () => undefined),
    /asociada a otro tenant/,
  );
}

async function verificarLimiteYLease(): Promise<void> {
  const { gestor, creados } = crearGestor({ limite: 1 });
  const operacionA = diferida<void>();
  const startedA = diferida<void>();
  const tareaA = gestor.ejecutar(crearEntrada("tenant-a"), async () => {
    startedA.resolver();
    await operacionA.promesa;
  });
  await startedA.promesa;

  await assert.rejects(
    gestor.ejecutar(crearEntrada("tenant-b"), async () => undefined),
    /límite de conexiones/,
  );
  assert.equal(creados[0]?.desconectado, false, "Un cliente con lease no debe ser desalojado");

  operacionA.resolver();
  await tareaA;
  await gestor.ejecutar(crearEntrada("tenant-b"), async () => undefined);
  assert.equal(creados[0]?.desconectado, true, "El cliente ocioso debe desalojarse al alcanzar el límite");
}

async function verificarExpiracionYRotacion(): Promise<void> {
  let ahora = 0;
  const { gestor, creados } = crearGestor({ ahora: () => ahora, ttl: 50 });
  const tenant = crearEntrada("tenant-ttl");
  await gestor.ejecutar(tenant, async () => undefined);
  ahora = 51;
  await gestor.ejecutar(tenant, async () => undefined);
  assert.equal(creados.length, 2, "El TTL debe crear un cliente nuevo después de expirar");
  assert.equal(creados[0]?.desconectado, true);

  const tenantRotado = crearEntrada("tenant-ttl", "mysql/tenant-ttl", "v2");
  await gestor.ejecutar(tenantRotado, async () => undefined);
  assert.equal(creados.length, 3, "Una versión nueva de credenciales no debe reutilizar el cliente anterior");
  assert.equal(creados[1]?.desconectado, true);
}

async function verificarRotacionConLeaseActivo(): Promise<void> {
  const { gestor, creados } = crearGestor();
  const operacionVieja = diferida<void>();
  const inicioViejo = diferida<void>();
  const tenantV1 = crearEntrada("tenant-rotado", "mysql/rotado", "v1");
  const tareaVieja = gestor.ejecutar(tenantV1, async () => {
    inicioViejo.resolver();
    await operacionVieja.promesa;
  });
  await inicioViejo.promesa;

  await gestor.ejecutar(
    crearEntrada("tenant-rotado", "mysql/rotado", "v2"),
    async () => undefined,
  );
  assert.equal(creados[0]?.desconectado, false, "La rotación no debe cortar una operación en curso");

  operacionVieja.resolver();
  await tareaVieja;
  assert.equal(creados[0]?.desconectado, true, "El cliente viejo debe cerrarse al liberar el último lease");
}

async function verificarInvalidacionConLeaseActivo(): Promise<void> {
  const { gestor, creados } = crearGestor();
  const operacionEnCurso = diferida<void>();
  const inicio = diferida<void>();
  const tenant = crearEntrada("tenant-invalidado");
  const tarea = gestor.ejecutar(tenant, async () => {
    inicio.resolver();
    await operacionEnCurso.promesa;
  });
  await inicio.promesa;

  await gestor.invalidar(tenant.tenant.id);
  await assert.rejects(
    gestor.ejecutar(tenant, async () => undefined),
    /fue invalidada; reintentá/,
    "Una nueva operación no debe reutilizar un cliente invalidado que aún tiene leases",
  );
  assert.equal(creados.length, 1, "La invalidación no debe abrir otra conexión antes de liberar el lease");

  operacionEnCurso.resolver();
  await tarea;
  assert.equal(creados[0]?.desconectado, true, "El cliente invalidado debe cerrarse al liberar el lease");

  await gestor.ejecutar(tenant, async () => undefined);
  assert.equal(creados.length, 2, "Un reintento posterior debe abrir un cliente nuevo");
}

async function verificarFalloDeConexion(): Promise<void> {
  let llamadasCrear = 0;
  const { gestor } = crearGestor({
    crear: async () => {
      llamadasCrear += 1;
      if (llamadasCrear === 1) throw new Error("detalle interno de conexión");
      return { id: 2, desconectado: false };
    },
  });
  let operaciones = 0;
  const entrada = crearEntrada("tenant-fallo");

  await assert.rejects(
    gestor.ejecutar(entrada, async () => { operaciones += 1; }),
    /No se pudo completar la operación/,
  );
  assert.equal(operaciones, 0, "Una conexión fallida no debe ejecutar la operación comercial");
  await gestor.ejecutar(entrada, async () => { operaciones += 1; });
  assert.equal(llamadasCrear, 2, "Un fallo debe permitir crear un cliente nuevo al reintentar");
  assert.equal(operaciones, 1);
}

function verificarExpiracionPoolMariaDb(): void {
  assert.deepEqual(crearOpcionesPoolTenant(60_000, 2), {
    connectionLimit: 2,
    idleTimeout: 60,
    minimumIdle: 1,
  });
  assert.equal(
    crearOpcionesPoolTenant(60_001, 4).idleTimeout,
    61,
    "El TTL debe redondearse hacia arriba a segundos para el driver MariaDB",
  );
  assert.throws(() => crearOpcionesPoolTenant(0, 2), /TTL.*positivo/);
  assert.throws(() => crearOpcionesPoolTenant(60_000, 0), /límite.*positivo/);
}

async function main(): Promise<void> {
  await verificarCreacionConcurrenteUnica();
  await verificarReferenciaDuplicada();
  await verificarLimiteYLease();
  await verificarExpiracionYRotacion();
  await verificarRotacionConLeaseActivo();
  await verificarInvalidacionConLeaseActivo();
  await verificarFalloDeConexion();
  verificarExpiracionPoolMariaDb();
  console.log("Fábrica tenant: concurrencia, referencias, límite, leases, TTL, rotación, invalidación y fallos verificados.");
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
