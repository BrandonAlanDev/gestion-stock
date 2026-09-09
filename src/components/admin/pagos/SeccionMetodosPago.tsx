"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { obtenerMetodosPago } from "@/actions/pagos/obtener-metodos-pago";
import type { MetodoPagoAdmin } from "@/actions/pagos/obtener-metodos-pago";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import { activarMetodo } from "@/actions/pagos/activar-metodo";
import { guardarConfigMetodo } from "@/actions/pagos/guardar-config-metodo";
import { desconectarMetodo } from "@/actions/pagos/desconectar-metodo";
import TarjetaMercadoPago from "./TarjetaMercadoPago";
import TarjetaTransferencia from "./TarjetaTransferencia";

export default function SeccionMetodosPago() {
  const [metodosPago, setMetodosPago] = useState<MetodoPagoAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciarTransicion] = useTransition();

  useEffect(() => {
    let activo = true;
    void obtenerMetodosPago().then((resultado) => {
      if (!activo) return;
      if (resultado.ok) {
        setMetodosPago(resultado.metodos);
      } else {
        setError(resultado.error);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  const actualizarMetodo = (id: MetodoPagoId, parcial: Partial<MetodoPagoAdmin>) => {
    setMetodosPago((previos) =>
      previos ? previos.map((metodo) => (metodo.id === id ? { ...metodo, ...parcial } : metodo)) : previos,
    );
  };

  const manejarCambioActivo = (id: MetodoPagoId, valor: boolean) => {
    iniciarTransicion(async () => {
      const resultado = await activarMetodo(id, valor);
      if (resultado.success) {
        actualizarMetodo(id, { activo: valor });
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
        actualizarMetodo("mercadopago", { conectado: false, activo: false });
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
        actualizarMetodo("transferencia", {
          instrucciones: instrucciones.trim() || null,
        });
        toast.success("Instrucciones guardadas");
      } else {
        toast.error("No se pudo guardar la configuración", {
          description: resultado.error,
        });
      }
    });
  };

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
        <AlertTriangle size={16} className="shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!metodosPago) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--admin-texto-suave)]">
        <Loader2 size={16} className="animate-spin" />
        Cargando métodos de pago...
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
        {metodosPago.map((metodo) =>
          metodo.id === "mercadopago" ? (
            <TarjetaMercadoPago
              key={metodo.id}
              metodo={metodo}
              activo={metodo.activo}
              alCambiarActivo={(valor) => manejarCambioActivo("mercadopago", valor)}
              alDesconectar={manejarDesconexionMercadoPago}
            />
          ) : (
            <TarjetaTransferencia
              key={metodo.id}
              metodo={metodo}
              activo={metodo.activo}
              alCambiarActivo={(valor) => manejarCambioActivo("transferencia", valor)}
              alGuardarConfig={manejarGuardarConfig}
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
