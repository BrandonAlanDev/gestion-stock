"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { informarTransferencia } from "@/actions/pedidos/informar-transferencia";

export default function BotonInformarTransferencia({ pedidoId }: { pedidoId: string }) {
  const router = useRouter();
  const [pendiente, iniciarTransicion] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function informar() {
    setError(null);
    iniciarTransicion(async () => {
      const resultado = await informarTransferencia(pedidoId);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        disabled={pendiente}
        onClick={informar}
        className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
      >
        {pendiente ? "Registrando aviso..." : "Ya realicé la transferencia"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
