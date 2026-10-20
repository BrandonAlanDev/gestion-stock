"use client";

import Link from "next/link";
import { Info } from "lucide-react";

interface PropiedadesPanelInstruccionesPago {
  instrucciones: string;
  pedidoId: string | null;
  numeroPedido?: number | null;
  moneda: string;
}

export default function PanelInstruccionesPago({
  instrucciones,
  pedidoId,
  numeroPedido,
}: PropiedadesPanelInstruccionesPago) {
  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-fondo) 12%, transparent)" }}
    >
      <div className="flex items-center gap-2 font-bold">
        <Info size={18} style={{ color: "var(--color-primario)" }} />
        Instrucciones de pago
      </div>
      <p className="whitespace-pre-wrap text-sm opacity-80">{instrucciones}</p>
      <p className="text-sm opacity-70">
        Tu pedido queda pendiente hasta que acreditemos la transferencia.
      </p>
      {pedidoId && (
        <p className="text-sm font-medium">
          Pedido: <span className="font-mono">#{numeroPedido ?? pedidoId}</span>
        </p>
      )}
      <Link
        href="/mis-pedidos"
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
      >
        Ver mis pedidos
      </Link>
    </div>
  );
}
