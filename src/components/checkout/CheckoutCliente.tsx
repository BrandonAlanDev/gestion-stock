"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCart } from "@/contextos/carrito/use-carrito";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { obtenerMetodosCheckout } from "@/actions/pagos/obtener-metodos-checkout";
import { iniciarPago } from "@/actions/pago/iniciar-pago";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import SelectorMetodoPago from "@/components/checkout/SelectorMetodoPago";
import ResumenPedido from "@/components/checkout/ResumenPedido";
import PanelInstruccionesPago from "@/components/checkout/PanelInstruccionesPago";

export interface MetodoPagoDisponible {
  id: string;
  nombre: string;
  descripcion: string;
}

export default function CheckoutCliente() {
  const { cartItems } = useCart();
  const { status } = useSession();
  const { pageConfig } = usePageConfig();
  const router = useRouter();

  const [metodos, setMetodos] = useState<MetodoPagoDisponible[]>([]);
  const [cargandoMetodos, setCargandoMetodos] = useState(true);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [instrucciones, setInstrucciones] = useState<string | null>(null);
  const [esSandbox, setEsSandbox] = useState(false);
  const [pendiente, iniciarTransicion] = useTransition();

  const moneda =
    typeof pageConfig?.currency === "string" && pageConfig.currency
      ? pageConfig.currency
      : "ARS";

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
    [cartItems],
  );

  useEffect(() => {
    let activo = true;

    obtenerMetodosCheckout().then((resultado) => {
      if (!activo) return;

      if (resultado.ok) {
        setMetodos(resultado.metodos);
        if (resultado.metodos.length > 0) {
          setMetodoSeleccionado(resultado.metodos[0].id);
        }
      } else {
        toast.error(resultado.error);
      }
      setCargandoMetodos(false);
    });

    return () => {
      activo = false;
    };
  }, []);

  const manejarContinuarCompra = () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
      return;
    }

    const items = cartItems
      .filter((item) => item.variantId)
      .map((item) => ({
        productId: item.id,
        variantId: item.variantId as string,
        cantidad: item.qty,
      }));

    if (items.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    if (!metodoSeleccionado) {
      toast.error("Seleccioná un método de pago");
      return;
    }

    iniciarTransicion(async () => {
      const resultado = await iniciarPago(metodoSeleccionado as MetodoPagoId, items);

      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }

      if (resultado.checkoutUrl) {
        window.location.href = resultado.checkoutUrl;
        return;
      }

      if (resultado.instrucciones) {
        setPedidoId(resultado.pedidoId);
        setInstrucciones(resultado.instrucciones);
        setEsSandbox(resultado.esSandbox);
        toast.success("Pedido registrado. Completá la transferencia.");
        return;
      }

      toast.error("No se pudo iniciar el pago.");
    });
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center gap-4"
        style={{ backgroundColor: "var(--color-fondo-sitio)", color: "var(--texto-sobre-fondo)" }}
      >
        <h1 className="text-xl font-bold">Tu carrito está vacío</h1>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-8"
      style={{ backgroundColor: "var(--color-fondo-sitio)", color: "var(--texto-sobre-fondo)" }}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Método de pago</h1>
            <p className="mt-1 opacity-70">Seleccioná cómo querés pagar.</p>
          </div>

          {cargandoMetodos ? (
            <p className="inline-flex items-center gap-2 text-sm opacity-70">
              <Loader2 className="animate-spin" size={16} />
              Cargando métodos de pago...
            </p>
          ) : metodos.length === 0 ? (
            <p className="text-sm opacity-70">
              No hay métodos de pago disponibles en este momento.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {metodos.map((metodo) => (
                <SelectorMetodoPago
                  key={metodo.id}
                  metodo={metodo}
                  seleccionado={metodoSeleccionado === metodo.id}
                  alSeleccionar={setMetodoSeleccionado}
                />
              ))}
            </div>
          )}

          {instrucciones && (
            <>
              <PanelInstruccionesPago
                instrucciones={instrucciones}
                pedidoId={pedidoId}
                moneda={moneda}
              />
              {esSandbox && (
                <p className="text-xs opacity-60">Estás operando en modo de prueba.</p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <ResumenPedido items={cartItems} subtotal={subtotal} moneda={moneda} />

          <button
            onClick={manejarContinuarCompra}
            disabled={pendiente || !metodoSeleccionado || cartItems.length === 0}
            className="w-full py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
          >
            {pendiente && <Loader2 className="animate-spin" size={18} />}
            {pendiente ? "Procesando..." : "Continuar con el pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
