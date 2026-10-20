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
import { obtenerDatosCheckout } from "@/actions/perfil/gestionar-perfil";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import SelectorMetodoPago from "@/components/checkout/SelectorMetodoPago";
import ResumenPedido from "@/components/checkout/ResumenPedido";
import PanelInstruccionesPago from "@/components/checkout/PanelInstruccionesPago";
import { SkeletonTarjetas } from "@/components/ui/skeleton-vistas";

export interface MetodoPagoDisponible {
  id: string;
  nombre: string;
  descripcion: string;
}

type DireccionCheckout = NonNullable<Awaited<ReturnType<typeof obtenerDatosCheckout>>>["direcciones"][number];

export default function CheckoutCliente() {
  const { cartItems } = useCart();
  const { status } = useSession();
  const { pageConfig } = usePageConfig();
  const router = useRouter();

  const [metodos, setMetodos] = useState<MetodoPagoDisponible[]>([]);
  const [cargandoMetodos, setCargandoMetodos] = useState(true);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [numeroPedido, setNumeroPedido] = useState<number | null>(null);
  const [instrucciones, setInstrucciones] = useState<string | null>(null);
  const [esSandbox, setEsSandbox] = useState(false);
  const [metodoEntrega, setMetodoEntrega] = useState<"DOMICILIO" | "RETIRO_TIENDA">("DOMICILIO");
  const [entrega, setEntrega] = useState<Record<string, string>>({});
  const [direcciones, setDirecciones] = useState<DireccionCheckout[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState("");
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

  useEffect(() => {
    if (status !== "authenticated") return;
    let activo = true;
    obtenerDatosCheckout().then((datos) => {
      if (!activo || !datos) return;
      setDirecciones(datos.direcciones);
      const partes = (datos.nombre ?? "").trim().split(/\s+/);
      const principal = datos.direcciones[0];
      setEntrega((actual) => ({
        ...actual,
        nombre: actual.nombre ?? partes[0] ?? "",
        apellido: actual.apellido ?? partes.slice(1).join(" "),
        telefono: actual.telefono ?? datos.telefono ?? "",
        ...(principal ? {
          destinatario: principal.destinatario ?? datos.nombre ?? "",
          calle: principal.calle, numero: principal.numero, piso: principal.piso ?? "",
          departamento: principal.departamento ?? "", codigoPostal: principal.codigoPostal,
          localidad: principal.localidad, provincia: principal.provincia,
          referencias: principal.referencias ?? "",
        } : {}),
      }));
      if (principal) setDireccionSeleccionada(principal.id);
    });
    return () => { activo = false; };
  }, [status]);

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

    const camposObligatorios = metodoEntrega === "DOMICILIO"
      ? ["nombre", "apellido", "telefono", "destinatario", "calle", "numero", "codigoPostal", "localidad", "provincia"]
      : ["nombre", "apellido", "telefono"];
    if (camposObligatorios.some((campo) => !entrega[campo]?.trim())) {
      toast.error("Completá los datos de entrega.");
      return;
    }

    const datosEntrega = metodoEntrega === "DOMICILIO"
      ? { metodoEntrega, nombre: entrega.nombre, apellido: entrega.apellido, telefono: entrega.telefono,
          destinatario: entrega.destinatario, calle: entrega.calle, numero: entrega.numero,
          piso: entrega.piso, departamento: entrega.departamento, codigoPostal: entrega.codigoPostal,
          localidad: entrega.localidad, provincia: entrega.provincia, referencias: entrega.referencias }
      : { metodoEntrega, nombre: entrega.nombre, apellido: entrega.apellido, telefono: entrega.telefono };

    iniciarTransicion(async () => {
      const resultado = await iniciarPago(metodoSeleccionado as MetodoPagoId, items, datosEntrega);

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
        setNumeroPedido(resultado.numero ?? null);
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
          <section className="rounded-xl border p-5" style={{ borderColor: "var(--color-primario)" }}>
            <h2 className="text-lg font-semibold">Datos de entrega</h2>
            <p className="mt-1 text-sm opacity-70">Indicá cómo querés recibir tu pedido.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {([ ["DOMICILIO", "Envío a domicilio"], ["RETIRO_TIENDA", "Retiro en tienda"] ] as const).map(([valor, etiqueta]) => (
                <button key={valor} type="button" onClick={() => setMetodoEntrega(valor)}
                  aria-pressed={metodoEntrega === valor}
                  className="rounded-lg border px-4 py-2 text-sm font-medium"
                  style={{ borderColor: "var(--color-primario)", backgroundColor: metodoEntrega === valor ? "var(--color-primario)" : "transparent", color: metodoEntrega === valor ? "var(--texto-sobre-primario)" : "inherit" }}>
                  {etiqueta}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {metodoEntrega === "DOMICILIO" && direcciones.length > 0 && <label className="text-sm sm:col-span-2">Dirección guardada
                <select value={direccionSeleccionada} onChange={(evento) => {
                  const elegida = direcciones.find((direccion) => direccion.id === evento.target.value);
                  setDireccionSeleccionada(evento.target.value);
                  if (elegida) setEntrega((actual) => ({ ...actual, destinatario: elegida.destinatario ?? `${actual.nombre ?? ""} ${actual.apellido ?? ""}`.trim(), telefono: elegida.telefono ?? actual.telefono, calle: elegida.calle, numero: elegida.numero, piso: elegida.piso ?? "", departamento: elegida.departamento ?? "", codigoPostal: elegida.codigoPostal, localidad: elegida.localidad, provincia: elegida.provincia, referencias: elegida.referencias ?? "" }));
                }} className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2">
                  <option value="">Ingresar otra dirección</option>{direcciones.map((direccion) => <option key={direccion.id} value={direccion.id}>{direccion.alias ?? `${direccion.calle} ${direccion.numero}`}</option>)}
                </select>
              </label>}
              {([ ["nombre", "Nombre"], ["apellido", "Apellido"], ["telefono", "Teléfono"] ] as const).map(([campo, etiqueta]) => (
                <label key={campo} className="text-sm">{etiqueta} *
                  <input value={entrega[campo] ?? ""} onChange={(evento) => setEntrega((actual) => ({ ...actual, [campo]: evento.target.value }))}
                    autoComplete={campo === "telefono" ? "tel" : campo === "nombre" ? "given-name" : "family-name"}
                    className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2" required />
                </label>
              ))}
              {metodoEntrega === "DOMICILIO" && (
                <>
                  {([ ["destinatario", "Destinatario"], ["calle", "Calle"], ["numero", "Número"], ["piso", "Piso"], ["departamento", "Departamento"], ["codigoPostal", "Código postal"], ["localidad", "Localidad"], ["provincia", "Provincia"] ] as const).map(([campo, etiqueta]) => (
                    <label key={campo} className="text-sm">{etiqueta}{["piso", "departamento"].includes(campo) ? "" : " *"}
                      <input value={entrega[campo] ?? ""} onChange={(evento) => setEntrega((actual) => ({ ...actual, [campo]: evento.target.value }))}
                        className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2" required={!(["piso", "departamento"].includes(campo))} />
                    </label>
                  ))}
                  <label className="text-sm sm:col-span-2">Referencias
                    <textarea value={entrega.referencias ?? ""} onChange={(evento) => setEntrega((actual) => ({ ...actual, referencias: evento.target.value }))}
                      className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2" rows={2} />
                  </label>
                </>
              )}
            </div>
            {metodoEntrega === "DOMICILIO" && <p className="mt-3 text-xs opacity-70">El costo del envío se coordina con la tienda.</p>}
          </section>
          <div>
            <h1 className="text-2xl font-bold">Método de pago</h1>
            <p className="mt-1 opacity-70">Seleccioná cómo querés pagar.</p>
          </div>

          {cargandoMetodos ? (
            <SkeletonTarjetas cantidad={2} admin={false} tipo="pagos" />
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
                numeroPedido={numeroPedido}
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
