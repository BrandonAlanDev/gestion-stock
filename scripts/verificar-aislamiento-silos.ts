import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { crearAdaptadorTenant } from "../src/lib/autenticacion/crear-adaptador-tenant";
import { crearHandlerWebhookMP } from "../src/lib/pagos/proveedores/mercadopago/crear-handler-webhook-mp";
import {
  conPrismaTenant,
  invalidarClientesPrismaTenant,
} from "../src/lib/tenants/prisma-factory";
import { resolverContextoSesionTenant } from "../src/lib/tenants/resolver-contexto-sesion";
import { obtenerProveedorRegistroTenant } from "../src/lib/tenants/registry/proveedor-registro";
import { resolverTenantPorHost } from "../src/lib/tenants/resolver-tenant-host";
import type {
  CredencialesBaseTenant,
  TenantRegistryEntry,
} from "../src/lib/tenants/registry/types";
import { validarDestinoLocalDescartable } from "./tenants/validar-destino-aislamiento";

interface TenantPrueba {
  entry: TenantRegistryEntry;
  credenciales: CredencialesBaseTenant;
}

interface DestinoFisico {
  servidor: string;
  puerto: number;
  base: string;
}

async function cargarTenantsPrueba(tenantIds: string[]): Promise<TenantPrueba[]> {
  const registro = obtenerProveedorRegistroTenant();
  const tenants = await Promise.all(tenantIds.map(async (tenantId) => {
    const entry = await registro.resolverPorId(tenantId);
    if (!entry || entry.tenant.estado !== "ACTIVO") {
      throw new Error(`El tenant de prueba ${tenantId} no está activo en el registro`);
    }
    const credenciales = await registro.resolverCredenciales(
      entry.referenciaBase,
      entry.versionCredenciales,
      entry.tenant.id,
    );
    validarDestinoLocalDescartable(tenantId, credenciales);
    return { entry, credenciales };
  }));

  const referencias = new Set(tenants.map(({ entry }) => entry.referenciaBase));
  if (referencias.size !== tenants.length) {
    throw new Error("Cada tenant de prueba debe tener una referencia de conexión propia");
  }
  return tenants;
}

async function inspeccionarDestino(
  tenantId: string,
  baseEsperada: string,
): Promise<DestinoFisico> {
  return conPrismaTenant(tenantId, async (prisma) => {
    const [fila] = await prisma.$queryRaw<Array<{
      servidor: string;
      puerto: number;
      base: string | null;
    }>>`
      SELECT @@hostname AS servidor, @@port AS puerto, DATABASE() AS base
    `;
    if (!fila?.base || fila.base.toLowerCase() !== baseEsperada.toLowerCase()) {
      throw new Error(`No se pudo confirmar una base descartable para el tenant ${tenantId}`);
    }
    return {
      servidor: fila.servidor.toLowerCase(),
      puerto: Number(fila.puerto),
      base: fila.base.toLowerCase(),
    };
  });
}

async function main(): Promise<void> {
  if (
    process.env.TENANT_SILO_ISOLATION_TEST_MODE !== "1" ||
    process.env.NODE_ENV === "production"
  ) {
    throw new Error(
      "La prueba requiere TENANT_SILO_ISOLATION_TEST_MODE=1 en un entorno descartable",
    );
  }

  const tenantIds = [...new Set(
    (process.env.TENANT_SILO_ISOLATION_TEST_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  )];
  if (tenantIds.length < 2) {
    throw new Error("Definí al menos dos tenants descartables en TENANT_SILO_ISOLATION_TEST_IDS");
  }

  const idPrueba = `silo-isolation-${randomUUID()}`;
  const idRollback = `silo-rollback-${randomUUID()}`;
  const idUsuarioCompartido = `usuario-silo-${randomUUID()}`;
  const emailCompartido = `usuario-${randomUUID()}@example.test`;
  const creados: string[] = [];
  const tenantsCreados: string[] = [];

  try {
    // Validar todos los destinos antes de abrir conexiones o escribir filas.
    const tenants = await cargarTenantsPrueba(tenantIds);

    const destinos = await Promise.all(tenants.map(({ entry, credenciales }) =>
      inspeccionarDestino(entry.tenant.id, credenciales.base),
    ));
    const clavesDestino = new Set(destinos.map(({ servidor, puerto, base }) =>
      `${servidor}:${puerto}/${base}`,
    ));
    if (clavesDestino.size !== tenantIds.length) {
      throw new Error("Dos tenants de prueba resuelven a la misma base MySQL");
    }
    creados.push(...tenantIds);

    for (const tenantId of tenantIds) {
      await assert.rejects(
        conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (transaccion) => {
          await transaccion.color.create({
            data: {
              id: idRollback,
              tenantId,
              name: `${idRollback}-${tenantId}`,
            },
          });
          throw new Error("prueba de rollback de transacción tenant");
        })),
        /prueba de rollback de transacción tenant/,
      );

      const filaRevertida = await conPrismaTenant(tenantId, (prisma) =>
        prisma.color.findUnique({ where: { id: idRollback } }),
      );
      assert.equal(filaRevertida, null, `El tenant ${tenantId} conservó una fila de una transacción revertida`);
    }

    for (const [indice, tenantId] of tenantIds.entries()) {
      await conPrismaTenant(tenantId, (prisma) => prisma.$transaction(async (transaccion) => {
        const fila = await transaccion.color.create({
          data: {
            id: idPrueba,
            tenantId,
            name: `${idPrueba}-${indice}`,
          },
        });
        assert.equal(fila.tenantId, tenantId);
      }));
    }

    for (const { entry } of tenants) {
      const dominio = entry.dominios[0];
      if (!dominio) throw new Error(`El tenant ${entry.tenant.id} no tiene un dominio de prueba`);
      const resuelto = await resolverTenantPorHost(dominio);
      if (resuelto?.id !== entry.tenant.id) {
        throw new Error(`El Host ${dominio} no resolvió al tenant esperado`);
      }

      await conPrismaTenant(entry.tenant.id, async (prisma) => {
        const tenantExistente = await prisma.tenant.findUnique({
          where: { id: entry.tenant.id },
          select: { id: true },
        });
        if (!tenantExistente) {
          await prisma.tenant.create({
            data: {
              id: entry.tenant.id,
              nombre: entry.tenant.nombre,
              slug: entry.tenant.slug,
              dominio,
              estado: "ACTIVO",
            },
          });
          tenantsCreados.push(entry.tenant.id);
        }
        await prisma.user.create({
          data: {
            id: idUsuarioCompartido,
            tenantId: entry.tenant.id,
            name: `Usuario ${entry.tenant.id}`,
            email: emailCompartido,
          },
        });
      });
    }

    for (const [indice, tenantId] of tenantIds.entries()) {
      const fila = await conPrismaTenant(tenantId, (prisma) =>
        prisma.color.findUnique({ where: { id: idPrueba } }),
      );
      if (fila?.tenantId !== tenantId || fila.name !== `${idPrueba}-${indice}`) {
        throw new Error(`El tenant ${tenantId} no leyó exclusivamente la fila de su silo`);
      }

      for (const otroTenantId of tenantIds) {
        if (otroTenantId === tenantId) continue;
        const consultaCruzada = await conPrismaTenant(tenantId, (prisma) =>
          prisma.color.findFirst({
            where: { id: idPrueba, tenantId: otroTenantId },
            select: { id: true },
          }),
        );
        if (consultaCruzada !== null) {
          throw new Error(`El tenant ${tenantId} leyó una fila asignada a ${otroTenantId}`);
        }
      }
    }

    const usuariosPorHost = await Promise.all(tenants.map(async ({ entry }) => {
      const dominio = entry.dominios[0];
      if (!dominio) throw new Error(`El tenant ${entry.tenant.id} no tiene un dominio de prueba`);
      const adaptador = crearAdaptadorTenant({
        async obtenerTenantAutenticacion() {
          const tenant = await resolverTenantPorHost(dominio);
          if (!tenant) throw new Error(`No se pudo resolver el dominio ${dominio}`);
          return tenant;
        },
        conPrismaTenant,
      });
      const usuario = await adaptador.getUser?.(idUsuarioCompartido);
      if (!usuario) throw new Error(`Auth.js no encontró el usuario del silo ${entry.tenant.id}`);
      return { tenantId: entry.tenant.id, nombre: usuario.name };
    }));
    for (const { entry } of tenants) {
      const usuario = usuariosPorHost.find((resultado) => resultado.tenantId === entry.tenant.id);
      if (usuario?.nombre !== `Usuario ${entry.tenant.id}`) {
        throw new Error(`Auth.js leyó el usuario de otro silo para ${entry.tenant.id}`);
      }
    }

    const tenantA = tenants[0]?.entry.tenant;
    const tenantB = tenants[1]?.entry.tenant;
    const identidadA = { id: idUsuarioCompartido, tenantId: tenantA?.id };
    let consultasDeSesionCruzada = 0;
    const sesionCruzada = await resolverContextoSesionTenant(
      tenantB ?? null,
      identidadA,
      async (tenantId, usuarioId) => {
        consultasDeSesionCruzada += 1;
        return conPrismaTenant(tenantId, (prisma) => prisma.user.findFirst({
          where: { id: usuarioId, tenantId },
          select: { id: true, tenantId: true, role: true },
        }));
      },
    );
    assert.equal(sesionCruzada, null, "Auth.js debe rechazar una sesión de A presentada en el host de B");
    assert.equal(consultasDeSesionCruzada, 0, "La sesión cruzada no debe consultar ningún silo");

    const despachosWebhook: Array<{ tenantId: string; nombreFila: string | null }> = [];
    const handlerWebhook = crearHandlerWebhookMP({
      resolverTenant: resolverTenantPorHost,
      async procesarWebhook() {
        return {
          tipo: "pago",
          pago: {
            externalId: `mp-${idPrueba}`,
            pedidoId: idPrueba,
            estadoExterno: "approved",
            montoPago: 1,
            monedaPago: "ARS",
          },
        };
      },
      async aplicarPago(tenantId) {
        const fila = await conPrismaTenant(tenantId, (prisma) =>
          prisma.color.findUnique({
            where: { id: idPrueba },
            select: { tenantId: true, name: true },
          }),
        );
        if (fila?.tenantId !== tenantId) {
          throw new Error(`El webhook no encontró la fila del silo ${tenantId}`);
        }
        despachosWebhook.push({ tenantId, nombreFila: fila.name });
      },
    });

    for (const { entry } of tenants) {
      const dominio = entry.dominios[0];
      if (!dominio) throw new Error(`El tenant ${entry.tenant.id} no tiene un dominio de prueba`);
      const request = new NextRequest(
        `https://${dominio}/api/mercadopago/webhook?tenantId=${encodeURIComponent(entry.tenant.id)}`,
        { method: "POST", headers: { host: dominio }, body: "{}" },
      );
      const respuesta = await handlerWebhook(request);
      assert.equal(respuesta.status, 200);
    }
    assert.equal(despachosWebhook.length, tenants.length);
    for (const { entry } of tenants) {
      const despacho = despachosWebhook.find((resultado) => resultado.tenantId === entry.tenant.id);
      if (despacho?.nombreFila !== `${idPrueba}-${tenants.findIndex(({ entry: candidato }) => candidato.tenant.id === entry.tenant.id)}`) {
        throw new Error(`El webhook del tenant ${entry.tenant.id} accedió al silo incorrecto`);
      }
    }

    const dominioA = tenants[0]?.entry.dominios[0];
    const idTenantB = tenants[1]?.entry.tenant.id;
    if (!dominioA || !idTenantB) throw new Error("La prueba real requiere al menos dos tenants configurados");
    const webhookCruzado = await handlerWebhook(new NextRequest(
      `https://${dominioA}/api/mercadopago/webhook?tenantId=${encodeURIComponent(idTenantB)}`,
      { method: "POST", headers: { host: dominioA }, body: "{}" },
    ));
    assert.equal(webhookCruzado.status, 401, "El webhook debe rechazar un tenantId distinto del Host");
    assert.equal(despachosWebhook.length, tenants.length, "El webhook cruzado no debe consultar una base");

    console.log(`Aislamiento funcional correcto: ${tenantIds.length} silos distintos aceptan IDs iguales, resuelven Host, Auth.js y webhooks al silo correcto, rechazan sesiones/webhooks cruzados y confirman/revierten transacciones.`);
  } finally {
    await Promise.all(creados.map(async (tenantId) => {
      try {
        await conPrismaTenant(tenantId, (prisma) =>
          prisma.$transaction(async (tx) => {
            await tx.color.deleteMany({ where: { id: { in: [idPrueba, idRollback] }, tenantId } });
            await tx.user.deleteMany({ where: { id: idUsuarioCompartido, tenantId } });
            if (tenantsCreados.includes(tenantId)) {
              await tx.tenant.deleteMany({ where: { id: tenantId } });
            }
          }),
        );
      } catch {
        // El fixture usa un ID aleatorio; un fallo de limpieza no debe ocultar el resultado original.
      }
    }));
    await Promise.all(tenantIds.map(invalidarClientesPrismaTenant));
  }
}

void main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error(`FATAL: ${mensaje}`);
  process.exitCode = 1;
});
