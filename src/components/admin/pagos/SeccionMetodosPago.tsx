"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { MetodoPagoAdmin, ResultadoMetodosPago } from "@/actions/pagos/obtener-metodos-pago";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import { activarMetodo } from "@/actions/pagos/activar-metodo";
import { guardarConfigMetodo } from "@/actions/pagos/guardar-config-metodo";
import { desconectarMetodo } from "@/actions/pagos/desconectar-metodo";
import TarjetaMercadoPago from "./TarjetaMercadoPago";
import TarjetaTransferencia from "./TarjetaTransferencia";
import TarjetaEfectivo from "./TarjetaEfectivo";

export default function SeccionMetodosPago({
  resultado,
  alActualizarMetodo,
}: {
  resultado: ResultadoMetodosPago;
  alActualizarMetodo: (id: MetodoPagoId, parcial: Partial<MetodoPagoAdmin>) => void;
}) {
  const [pendiente, iniciarTransicion] = useTransition();

  const manejarCambioActivo = (id: MetodoPagoId, valor: boolean) => {
    iniciarTransicion(async () => {
      const resultado = await activarMetodo(id, valor);
      if (resultado.success) {
        alActualizarMetodo(id, { activo: valor });
        toast.success(valor ? "Método activado" : "Método desactivado");
      } else {
        toast.error("No se pudo actualizar el método", {
          description: resultado.error,
        });
      }
    });
  };

  const manejarDesconexionMercadoPago = () => {
    iniciarTransicion(async () => {
      const resultado = await desconectarMetodo("mercadopago");
      if (resultado.success) {
        alActualizarMetodo("mercadopago", { conectado: false, activo: false });
        toast.success("Mercado Pago desconectado");
      } else {
        toast.error("No se pudo desconectar", {
          description: resultado.error,
        });
      }
    });
  };

  const manejarGuardarConfig = (instrucciones: string) => {
    iniciarTransicion(async () => {
      const resultado = await guardarConfigMetodo({
        metodo: "transferencia",
        instrucciones,
      });
      if (resultado.success) {
        const configuracionCompleta = Boolean(instrucciones.trim());
        alActualizarMetodo("transferencia", {
          instrucciones: instrucciones.trim() || null,
          conectado: configuracionCompleta,
          estadoConfiguracion: configuracionCompleta ? "COMPLETA" : "INCOMPLETA",
        });
        toast.success("Instrucciones guardadas");
      } else {
        toast.error("No se pudo guardar la configuración", {
          description: resultado.error,
        });
      }
    });
  };

  const manejarGuardarVencimiento = async (
    id: MetodoPagoId,
    vencimiento: MetodoPagoAdmin["vencimiento"],
  ): Promise<boolean> => {
    const resultado = await guardarConfigMetodo({ metodo: id, vencimiento });
    if (!resultado.success) {
      toast.error("No se pudo guardar el vencimiento", { description: resultado.error });
      return false;
    }
    alActualizarMetodo(id, { vencimiento });
    toast.success("Vencimiento guardado para pedidos nuevos");
    return true;
  };

  if (!resultado.ok) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-[var(--admin-peligro)] bg-[var(--admin-peligro-suave)] p-3 text-sm text-[var(--admin-peligro)]">
        <AlertTriangle size={16} className="shrink-0" />
        <span>{resultado.error}</span>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="border-b border-[var(--admin-borde)] pb-4">
        <h2 className="text-xl font-semibold text-[var(--admin-texto)]">Métodos de pago</h2>
        <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">
          Configurá cómo tus clientes pueden pagar sus compras.
        </p>
      </div>

      <div className="space-y-6">
        {resultado.metodos.map((metodo) =>
          metodo.id === "mercadopago" ? (
            <TarjetaMercadoPago
              key={metodo.id}
              metodo={metodo}
              activo={metodo.activo}
              alCambiarActivo={(valor) => manejarCambioActivo("mercadopago", valor)}
              alDesconectar={manejarDesconexionMercadoPago}
            />
          ) : metodo.id === "transferencia" ? (
            <TarjetaTransferencia
              key={metodo.id}
              metodo={metodo}
              activo={metodo.activo}
              alCambiarActivo={(valor) => manejarCambioActivo("transferencia", valor)}
              alGuardarConfig={manejarGuardarConfig}
              alGuardarVencimiento={(valor) => manejarGuardarVencimiento("transferencia", valor)}
            />
          ) : (
            <TarjetaEfectivo
              key={metodo.id}
              metodo={metodo}
              activo={metodo.activo}
              alCambiarActivo={(valor) => manejarCambioActivo("efectivo", valor)}
              alGuardarVencimiento={(valor) => manejarGuardarVencimiento("efectivo", valor)}
            />
          ),
        )}
      </div>

      {pendiente && (
        <p className="inline-flex items-center gap-2 text-xs text-[var(--admin-texto-suave)]">
          <Loader2 size={13} className="animate-spin" />
          Aplicando cambios...
        </p>
      )}
    </section>
  );
}
