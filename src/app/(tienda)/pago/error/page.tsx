import Link from "next/link";
import { XCircle } from "lucide-react";

interface ErrorPageProps {
  searchParams: Promise<{ pedidoId?: string }>;
}

export default async function PaginaPagoError({ searchParams }: ErrorPageProps) {
  const { pedidoId } = await searchParams;

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
              backgroundColor: "color-mix(in srgb, #ef4444 15%, transparent)",
              border: "2px solid color-mix(in srgb, #ef4444 40%, transparent)",
            }}
          >
            <XCircle className="w-12 h-12" style={{ color: "#ef4444" }} />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">
            Pago no completado
          </h1>
          <p className="opacity-70">
            No pudimos procesar el pago. Tu pedido sigue reservado; podés intentarlo de nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {pedidoId && (
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-black uppercase tracking-widest text-sm transition hover:opacity-90"
              style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
            >
              Intentar de nuevo
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition hover:opacity-80"
            style={{
              backgroundColor: "color-mix(in srgb, var(--texto-sobre-fondo) 8%, transparent)",
              color: "var(--texto-sobre-fondo)",
              border: "1px solid color-mix(in srgb, var(--texto-sobre-fondo) 20%, transparent)",
            }}
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
