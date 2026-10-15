import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CalendarCheck2 } from "lucide-react";
import { confirmarPago } from "@/actions/pago/confirmar-pago";

interface SearchParams {
  pedidoId?: string;
  payment_id?: string;
  collection_id?: string;
  status?: string;
}

interface ExitoPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function PaginaPagoExito({ searchParams }: ExitoPageProps) {
  const { pedidoId, payment_id, collection_id } = await searchParams;
  const paymentId = payment_id || collection_id;

  if (!pedidoId) redirect("/");

  const resultado = await confirmarPago(pedidoId, paymentId);
  const pedido = resultado.ok ? resultado.pedido : null;
  const aprobado =
    pedido?.estado === "CONFIRMADO" || pedido?.estadoPago === "APROBADO";

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
              backgroundColor: aprobado
                ? "color-mix(in srgb, #22c55e 18%, transparent)"
                : "color-mix(in srgb, #f59e0b 18%, transparent)",
              border: "2px solid color-mix(in srgb, #22c55e 40%, transparent)",
            }}
          >
            {aprobado ? (
              <CheckCircle2 className="w-12 h-12" style={{ color: "#22c55e" }} />
            ) : (
              <CalendarCheck2 className="w-12 h-12" style={{ color: "#f59e0b" }} />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            {aprobado ? "¡Pago confirmado!" : "Estamos verificando tu pago"}
          </h1>
          <p className="opacity-70">
            {aprobado
              ? "Tu pedido quedó confirmado. Te contactaremos por WhatsApp para coordinar la entrega."
              : "Tu pago está en proceso. Te avisaremos cuando se confirme."}
          </p>
        </div>

        {pedido && (
          <div
            className="rounded-2xl border border-[color-mix(in_srgb,var(--texto-sobre-fondo)_12%,transparent)] p-4 text-left space-y-2"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-fondo-sitio) 80%, transparent)" }}
          >
            <p className="text-xs uppercase tracking-widest font-bold opacity-60">
              Comprobante
            </p>
            <p className="text-sm">
              <span className="opacity-60">Pedido:</span>{" "}
              <span className="font-mono">{pedido.id.slice(0, 10)}...</span>
            </p>
            <p className="text-sm">
              <span className="opacity-60">Total:</span>{" "}
              <span className="font-semibold">
                ${pedido.total.toLocaleString()} {pedido.moneda}
              </span>
            </p>
            <p className="text-sm">
              <span className="opacity-60">Ítems:</span>{" "}
              <span>{pedido.items.length}</span>
            </p>
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
