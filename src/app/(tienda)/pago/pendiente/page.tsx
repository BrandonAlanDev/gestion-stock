import Link from "next/link";
import { Clock } from "lucide-react";

interface PendientePageProps {
  searchParams: Promise<{ pedidoId?: string; payment_id?: string }>;
}

export default async function PaginaPagoPendiente({ searchParams }: PendientePageProps) {
  const { payment_id } = await searchParams;
  const paymentId = payment_id;

  return (
    <div
      className="min-h-[70vh] flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--color-fondo-sitio)", color: "var(--texto-sobre-fondo)" }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in srgb, #f59e0b 18%, transparent)",
              border: "2px solid color-mix(in srgb, #f59e0b 40%, transparent)",
            }}
          >
            <Clock className="w-12 h-12" style={{ color: "#f59e0b" }} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Pago pendiente
          </h1>
          <p className="opacity-70">
            Tu pago está siendo procesado. Te notificaremos cuando se acredite.
            El pedido se confirmará automáticamente.
          </p>
        </div>

        {paymentId && (
          <div
            className="rounded-2xl border border-[color-mix(in_srgb,var(--texto-sobre-fondo)_12%,transparent)] p-4 text-left"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-fondo-sitio) 80%, transparent)" }}
          >
            <p className="text-xs uppercase tracking-widest font-bold opacity-60 mb-1">
              Referencia
            </p>
            <p className="font-mono text-sm" style={{ color: "#f59e0b" }}>{paymentId}</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-black uppercase tracking-widest text-sm transition hover:opacity-90"
          style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
        >
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
