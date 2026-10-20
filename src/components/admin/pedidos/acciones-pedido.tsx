"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aprobarPagoManual, cambiarEstadoEnvio, cambiarEstadoPedido, guardarSeguimiento } from "@/actions/pedidos/gestionar-pedidos";

type Props = {
  pedidoId: string;
  estado: string;
  estadoPago: string;
  estadoEnvio: string;
  metodoPago: string | null;
  metodoEntrega: string;
  seguimiento?: { transportistaId: string | null; trackingNumero: string | null; trackingUrl: string | null; fechaEstimada: string | null } | null;
  transportistas: { id: string; nombre: string }[];
};

const estados = ["CONFIRMADO", "EN_PREPARACION", "LISTO", "ENVIADO", "ENTREGADO"];
const estadosEnvio = ["PENDIENTE", "PREPARANDO", "DESPACHADO", "ENTREGADO"];
const etiquetas: Record<string, string> = { EN_PREPARACION: "En preparación", LISTO: "Listo", ENVIADO: "Enviado", ENTREGADO: "Entregado", PREPARANDO: "Preparando", DESPACHADO: "Despachado" };

export default function AccionesPedido({ pedidoId, estado, estadoPago, estadoEnvio, metodoPago, metodoEntrega, seguimiento, transportistas }: Props) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [transportistaId, setTransportistaId] = useState(seguimiento?.transportistaId ?? "");
  const [trackingNumero, setTrackingNumero] = useState(seguimiento?.trackingNumero ?? "");
  const [trackingUrl, setTrackingUrl] = useState(seguimiento?.trackingUrl ?? "");
  const [fechaEstimada, setFechaEstimada] = useState(seguimiento?.fechaEstimada ?? "");
  const ordenPedido = metodoEntrega === "DOMICILIO" ? estados : estados.filter((valor) => valor !== "ENVIADO");
  const ordenEnvio = metodoEntrega === "DOMICILIO" ? estadosEnvio : estadosEnvio.filter((valor) => valor !== "DESPACHADO");
  const siguiente = ordenPedido[ordenPedido.indexOf(estado) + 1];
  const siguienteEnvio = ordenEnvio[ordenEnvio.indexOf(estadoEnvio) + 1];

  function ejecutar(operacion: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    iniciar(async () => {
      const resultado = await operacion();
      if (!resultado.ok) setError(resultado.error ?? "No se pudo guardar el cambio");
      else router.refresh();
    });
  }

  return (
    <div className="admin-panel space-y-5 p-5">
      <h2 className="text-lg font-semibold">Gestionar pedido</h2>
      {error && <p role="alert" className="rounded-lg bg-[var(--admin-peligro-suave)] p-3 text-sm text-[var(--admin-peligro)]">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {estado === "PENDIENTE" && metodoPago === "transferencia" && <button disabled={pendiente} onClick={() => ejecutar(() => aprobarPagoManual(pedidoId))} className="rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm text-[var(--admin-primario-texto)] disabled:opacity-50">Aprobar transferencia</button>}
        {estado === "PENDIENTE" && estadoPago !== "APROBADO" && <button disabled={pendiente} onClick={() => ejecutar(() => cambiarEstadoPedido({ pedidoId, estado: "CANCELADO" }))} className="rounded-lg border border-[var(--admin-peligro)] px-4 py-2 text-sm text-[var(--admin-peligro)] disabled:opacity-50">Cancelar pedido</button>}
        {estadoPago === "APROBADO" && siguiente && (metodoEntrega !== "DOMICILIO" || !["ENVIADO", "ENTREGADO"].includes(siguiente) || estadoEnvio === "DESPACHADO") && <button disabled={pendiente} onClick={() => ejecutar(() => cambiarEstadoPedido({ pedidoId, estado: siguiente }))} className="rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm text-[var(--admin-primario-texto)] disabled:opacity-50">Pasar a {etiquetas[siguiente]}</button>}
        {estadoPago === "APROBADO" && siguienteEnvio && (siguienteEnvio === "PREPARANDO" || (siguienteEnvio === "DESPACHADO" && ["LISTO", "ENVIADO"].includes(estado)) || (siguienteEnvio === "ENTREGADO" && estado === (metodoEntrega === "DOMICILIO" ? "ENVIADO" : "LISTO"))) && <button disabled={pendiente} onClick={() => ejecutar(() => cambiarEstadoEnvio({ pedidoId, estadoEnvio: siguienteEnvio }))} className="rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm disabled:opacity-50">Envío: {etiquetas[siguienteEnvio]}</button>}
      </div>
      {metodoEntrega === "DOMICILIO" && estadoPago === "APROBADO" && (
        <form onSubmit={(evento) => { evento.preventDefault(); ejecutar(() => guardarSeguimiento({ pedidoId, transportistaId, trackingNumero, trackingUrl, fechaEstimada })); }} className="space-y-3 border-t border-[var(--admin-borde)] pt-4">
          <h3 className="font-medium">Seguimiento</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">Transportista
              <select value={transportistaId} onChange={(evento) => setTransportistaId(evento.target.value)} required className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2">
                <option value="">Seleccionar</option>{transportistas.map((transportista) => <option key={transportista.id} value={transportista.id}>{transportista.nombre}</option>)}
              </select>
            </label>
            <label className="text-sm">Código de seguimiento
              <input value={trackingNumero} onChange={(evento) => setTrackingNumero(evento.target.value)} required maxLength={120} className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2" />
            </label>
            <label className="text-sm">URL de seguimiento (opcional)
              <input value={trackingUrl} onChange={(evento) => setTrackingUrl(evento.target.value)} type="url" className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2" />
            </label>
            <label className="text-sm">Entrega estimada (opcional)
              <input value={fechaEstimada} onChange={(evento) => setFechaEstimada(evento.target.value)} type="date" className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2" />
            </label>
          </div>
          <button disabled={pendiente || transportistas.length === 0} className="rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm text-[var(--admin-primario-texto)] disabled:opacity-50">Guardar seguimiento</button>
        </form>
      )}
    </div>
  );
}
