"use server";

import "server-only";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";
import { obtenerMetodosPagoDisponibles } from "@/lib/pagos/obtener-metodos-disponibles";
import type { EstadoConfiguracionMetodoPago, RegistroMetodoPago } from "@/lib/pagos/obtener-metodos-disponibles";
import { registrarErrorPagoSeguro } from "@/lib/pagos/registro-error-seguro";
import type { EstadoProveedor, MetodoPagoId } from "@/lib/pagos/tipos";
import { resumirEstadoCuentaMP } from "@/lib/mercadopago/obtener-estado-cuenta";
import { conPrismaTenant } from "@/lib/prisma";
import { leerPoliticaVencimientoReserva } from "@/lib/pedidos/politica-reserva-stock";
import type { EstadoConexionMP } from "@/types/mercadopago";

export interface MetodoPagoAdmin {
  id: MetodoPagoId;
  nombre: string;
  descripcion: string;
  activo: boolean;
  requiereConexion: boolean;
  requiereConfiguracion: boolean;
  conectado: boolean;
  estadoConfiguracion: EstadoConfiguracionMetodoPago;
  instrucciones: string | null;
  vencimiento: { habilitado: boolean; horas: number };
}

export type ResultadoMetodosPago =
  | { ok: true; metodos: MetodoPagoAdmin[]; estadoMercadoPago: EstadoConexionMP }
  | { ok: false; error: string };

/**
 * Devuelve el estado administrativo de todos los métodos de pago y la
 * configuración bancaria. La conexión se lee de los metadatos guardados sin
 * consultar proveedores externos ni exponer credenciales.
 */
export async function obtenerMetodosPago(): Promise<ResultadoMetodosPago> {
  let fase: "autenticacion" | "lectura_tenant" | "estado_proveedores" | "preparacion_respuesta" = "autenticacion";
  try {
    const contexto = await requiereAdmin();

    fase = "lectura_tenant";
    const { registros, estadoMercadoPago } = await conPrismaTenant(
      contexto.tenantId,
      async (prisma) => {
        const [registros, cuentaMercadoPago] = await Promise.all([
          prisma.metodoPago.findMany({ where: {} }),
          prisma.cuentaMercadoPago.findUnique({
            where: { clave: "principal" },
            select: {
              conectado: true,
              nombreNegocio: true,
              updatedAt: true,
              accessToken: true,
              refreshToken: true,
              expiraEn: true,
            },
          }),
        ]);
        return {
          registros: registros as RegistroMetodoPago[],
          estadoMercadoPago: resumirEstadoCuentaMP(cuentaMercadoPago),
        };
      },
    );

    fase = "estado_proveedores";
    const estadoMP: EstadoProveedor = estadoMercadoPago;
    const disponibles = await obtenerMetodosPagoDisponibles(
      contexto.tenantId,
      registros,
      { mercadopago: estadoMP },
    );

    fase = "preparacion_respuesta";
    const porMetodo = new Map<string, { config: unknown }>();
    for (const registro of registros) {
      porMetodo.set(registro.metodo, { config: registro.config });
    }

    const metodos: MetodoPagoAdmin[] = disponibles.map((metodo) => {
      const registro = porMetodo.get(metodo.id);
      const config = registro?.config as Record<string, unknown> | null;
      const instrucciones = config?.instrucciones;
      return {
        id: metodo.id,
        nombre: metodo.nombre,
        descripcion: metodo.descripcion,
        activo: metodo.activo,
        requiereConexion: metodo.requiereConexion,
        requiereConfiguracion: metodo.requiereConfiguracion,
        conectado: metodo.conectado,
        estadoConfiguracion: metodo.estadoConfiguracion,
        instrucciones:
          typeof instrucciones === "string" && instrucciones.trim()
            ? instrucciones.trim()
            : null,
        vencimiento: leerPoliticaVencimientoReserva(registro?.config),
      };
    });

    return {
      ok: true,
      metodos,
      estadoMercadoPago: {
        conectada: estadoMercadoPago.conectado,
        nombreCuenta: estadoMercadoPago.nombreCuenta,
        actualizadaEn: estadoMercadoPago.actualizadoEn,
      },
    };
  } catch (error) {
    registrarErrorPagoSeguro("Error obteniendo métodos de pago", error, undefined, fase);
    return { ok: false, error: "No se pudieron cargar los métodos de pago" };
  }
}
