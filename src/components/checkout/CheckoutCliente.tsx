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
import { obtenerOpcionesEntregaCheckout } from "@/actions/pedidos/obtener-opciones-entrega-checkout";
import { iniciarPago } from "@/actions/pago/iniciar-pago";
import { obtenerDatosCheckout } from "@/actions/perfil/gestionar-perfil";
import type { MetodoPagoId } from "@/lib/pagos/tipos";
import { esMetodoPagoCompatibleConEntrega } from "@/lib/pagos/es-metodo-pago-compatible-entrega";
import {
  calcularOpcionesEntregaCheckout,
  conservarMetodoEntregaDisponible,
  estaDisponibleMetodoEntrega,
  type MetodoEntregaCheckout,
  type OpcionesEntregaCheckout,
} from "@/lib/pedidos/opciones-entrega";
import type { ItemResumenCheckout, ResumenCheckout } from "@/lib/pedidos/tipos-resumen-checkout";
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
  const { cartItems, openCart } = useCart();
  const { status } = useSession();
  const { pageConfig } = usePageConfig();
  const router = useRouter();

  const [metodos, setMetodos] = useState<MetodoPagoDisponible[]>([]);
  const [cargandoMetodos, setCargandoMetodos] = useState(true);
  const [avisoMetodos, setAvisoMetodos] = useState<string | null>(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<string | null>(null);
  const [numeroPedido, setNumeroPedido] = useState<number | null>(null);
  const [instrucciones, setInstrucciones] = useState<string | null>(null);
  const [reservaExpiraEn, setReservaExpiraEn] = useState<string | null>(null);
  const [esSandbox, setEsSandbox] = useState(false);
  const opcionesEntregaIniciales = useMemo(
    () => calcularOpcionesEntregaCheckout(pageConfig),
    [pageConfig],
  );
  const [opcionesEntregaActualizadas, setOpcionesEntregaActualizadas] =
    useState<OpcionesEntregaCheckout | null>(null);
  const opcionesEntrega = opcionesEntregaActualizadas ?? opcionesEntregaIniciales;
  const [errorCargaEntrega, setErrorCargaEntrega] = useState<string | null>(null);
  const [avisoEntrega, setAvisoEntrega] = useState<string | null>(null);
  const [metodoEntrega, setMetodoEntrega] = useState<MetodoEntregaCheckout | null>(() =>
    opcionesEntregaIniciales.domicilioDisponible
      ? "DOMICILIO"
      : opcionesEntregaIniciales.retiroTiendaDisponible
        ? "RETIRO_TIENDA"
        : null,
  );
  const [entrega, setEntrega] = useState<Record<string, string>>({});
  const [direcciones, setDirecciones] = useState<DireccionCheckout[]>([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();
  const [resumenServidor, setResumenServidor] = useState<{
    clave: string;
    resumen: ResumenCheckout;
  } | null>(null);
  const [errorResumenServidor, setErrorResumenServidor] = useState<{
    clave: string;
    error: string;
  } | null>(null);
  const [avisoPrecio, setAvisoPrecio] = useState<{
    clave: string;
    mensaje: string;
  } | null>(null);

  const moneda =
    typeof pageConfig?.currency === "string" && pageConfig.currency
      ? pageConfig.currency
      : "ARS";

  const itemsParaResumen = useMemo(
    () => cartItems.map((item, indice) => ({
      clave: `${item.uid}-${indice}`,
      productId: item.id,
      variantId: item.variantId ?? "",
      cantidad: item.qty,
    })),
    [cartItems],
  );
  const claveItemsParaResumen = useMemo(
    () => JSON.stringify(itemsParaResumen),
    [itemsParaResumen],
  );
  const resumenLocal = useMemo<ResumenCheckout>(() => {
    const items: ItemResumenCheckout[] = cartItems.map((item, indice) => ({
      clave: `${item.uid}-${indice}`,
      productId: String(item.id),
      variantId: String(item.variantId ?? ""),
      nombre: item.name,
      variante: item.varianteInfo ? Object.values(item.varianteInfo).join(" · ") : null,
      imagen: item.image ?? null,
      cantidad: item.qty,
      precioUnitario: item.price,
      precioAnterior: null,
      subtotal: item.price * item.qty,
    }));
    return {
      items,
      subtotal: items.reduce((total, item) => total + item.subtotal, 0),
      moneda,
    };
  }, [cartItems, moneda]);
  const resumenMostrado = resumenServidor?.clave === claveItemsParaResumen
    ? resumenServidor.resumen
    : resumenLocal;
  const errorResumen = cartItems.some((item) => !item.variantId)
    ? "Hay un producto sin una variante válida. Revisá el carrito antes de continuar."
    : cartItems.some((item) =>
      !Number.isFinite(item.price) || item.price < 0 ||
      !Number.isInteger(item.qty) || item.qty < 1,
    ) || !Number.isFinite(resumenMostrado.subtotal)
      ? "El carrito tiene datos inválidos. Revisalo antes de continuar."
      : errorResumenServidor?.clave === claveItemsParaResumen
        ? errorResumenServidor.error
        : null;
  const avisoPrecioVisible = avisoPrecio?.clave === claveItemsParaResumen
    ? avisoPrecio.mensaje
    : null;

  useEffect(() => {
    setResumenServidor(null);
    setErrorResumenServidor(null);
    setAvisoPrecio(null);
  }, [claveItemsParaResumen]);

  const modalidadesEntrega = [
    ...(opcionesEntrega.domicilioDisponible
      ? [["DOMICILIO", "Envío a domicilio"] as const]
      : []),
    ...(opcionesEntrega.retiroTiendaDisponible
      ? [["RETIRO_TIENDA", "Retiro en tienda"] as const]
      : []),
  ];

  const metodosParaEntrega = useMemo(
    () => metodoEntrega
      ? metodos.filter((metodo) => esMetodoPagoCompatibleConEntrega(metodo.id, metodoEntrega))
      : [],
    [metodoEntrega, metodos],
  );

  useEffect(() => {
    let activo = true;

    obtenerMetodosCheckout().then((resultado) => {
      if (!activo) return;

      if (resultado.ok) {
        setMetodos(resultado.metodos);
        setAvisoMetodos(resultado.aviso ?? null);
      } else {
        setAvisoMetodos("No pudimos cargar las opciones de pago. Actualizá la página o intentá nuevamente.");
        toast.error(resultado.error);
      }
      setCargandoMetodos(false);
    }).catch(() => {
      if (!activo) return;
      setAvisoMetodos("No pudimos cargar las opciones de pago. Actualizá la página o intentá nuevamente.");
      setCargandoMetodos(false);
    });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (metodosParaEntrega.some((metodo) => metodo.id === metodoSeleccionado)) return;
    setMetodoSeleccionado(metodosParaEntrega[0]?.id ?? null);
  }, [metodoSeleccionado, metodosParaEntrega]);

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

    if (cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    if (errorResumen) {
      toast.error(errorResumen);
      return;
    }

    if (!Number.isFinite(resumenMostrado.subtotal) || resumenMostrado.subtotal < 0) {
      toast.error("El carrito tiene un precio inválido. Revisalo antes de continuar.");
      return;
    }

    if (!metodoSeleccionado || !metodosParaEntrega.some((metodo) => metodo.id === metodoSeleccionado)) {
      toast.error("Seleccioná un método de pago disponible para esta modalidad de entrega.");
      return;
    }

    if (
      !metodoEntrega ||
      !estaDisponibleMetodoEntrega(opcionesEntrega, metodoEntrega)
    ) {
      toast.error("Elegí una modalidad de entrega disponible para continuar.");
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
      const resultado = await iniciarPago(
        metodoSeleccionado as MetodoPagoId,
        itemsParaResumen,
        datosEntrega,
        resumenMostrado.subtotal,
      );

      if (!resultado.ok) {
        if (resultado.codigo === "PRECIOS_CAMBIARON" && resultado.resumen) {
          setResumenServidor({ clave: claveItemsParaResumen, resumen: resultado.resumen });
          setErrorResumenServidor(null);
          setAvisoPrecio({
            clave: claveItemsParaResumen,
            mensaje: "Los precios cambiaron mientras completabas la compra. Revisá el nuevo total y volvé a confirmar para continuar.",
          });
          toast.info("Actualizamos los precios. Revisá el nuevo total antes de confirmar.");
          return;
        }

        if (
          resultado.codigo === "PRODUCTO_NO_DISPONIBLE" ||
          resultado.codigo === "STOCK_INSUFICIENTE"
        ) {
          setErrorResumenServidor({ clave: claveItemsParaResumen, error: resultado.error });
          toast.error(resultado.error);
          return;
        }

        toast.error(resultado.error);
        if (
          resultado.codigo === "MODALIDAD_ENTREGA_NO_DISPONIBLE" ||
          resultado.codigo === "SIN_MODALIDADES_ENTREGA"
        ) {
          setAvisoEntrega("La configuración de entrega cambió. Verificá la opción seleccionada o elegí una modalidad disponible.");
          try {
            const opcionesActualizadas = await obtenerOpcionesEntregaCheckout();
            if (opcionesActualizadas.ok) {
              setOpcionesEntregaActualizadas(opcionesActualizadas.opciones);
              setErrorCargaEntrega(null);
              setMetodoEntrega((actual) =>
                conservarMetodoEntregaDisponible(opcionesActualizadas.opciones, actual),
              );
            } else {
              setOpcionesEntregaActualizadas(null);
              setMetodoEntrega(null);
              setErrorCargaEntrega(opcionesActualizadas.error);
            }
          } catch {
            setOpcionesEntregaActualizadas(null);
            setMetodoEntrega(null);
            setErrorCargaEntrega("No se pudieron validar las modalidades de entrega.");
          }
        }
        return;
      }

      setAvisoPrecio(null);

      if (resultado.checkoutUrl) {
        window.location.href = resultado.checkoutUrl;
        return;
      }

      if (resultado.instrucciones) {
        setPedidoId(resultado.pedidoId);
        setNumeroPedido(resultado.numero ?? null);
        setInstrucciones(resultado.instrucciones);
        setReservaExpiraEn(resultado.reservaExpiraEn);
        setEsSandbox(resultado.esSandbox);
        toast.success(
          metodoSeleccionado === "efectivo"
            ? "Pedido registrado. Pagá en efectivo al retirar en tienda."
            : "Pedido registrado. Completá las instrucciones de pago.",
        );
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="w-full min-w-0 rounded-xl border p-5" style={{ borderColor: "var(--color-primario)" }}>
            <h2 className="text-lg font-semibold">Datos de entrega</h2>
            <p className="mt-1 text-sm opacity-70">Indicá cómo querés recibir tu pedido.</p>
            {errorCargaEntrega ? (
              <p className="mt-4 text-sm text-red-500" role="alert">
                {errorCargaEntrega}
              </p>
            ) : modalidadesEntrega.length === 0 ? (
              <p className="mt-4 text-sm text-red-500" role="alert">
                La tienda no tiene modalidades de entrega disponibles. Contactá a la tienda para continuar.
              </p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-3">
                {modalidadesEntrega.map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => {
                      setMetodoEntrega(valor);
                      setAvisoEntrega(null);
                    }}
                    aria-pressed={metodoEntrega === valor}
                    className="rounded-lg border px-4 py-2 text-sm font-medium"
                    style={{ borderColor: "var(--color-primario)", backgroundColor: metodoEntrega === valor ? "var(--color-primario)" : "transparent", color: metodoEntrega === valor ? "var(--texto-sobre-primario)" : "inherit" }}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>
            )}
            {avisoEntrega && (
              <p className="mt-3 text-sm text-amber-500" role="alert">
                {avisoEntrega}
              </p>
            )}
            {opcionesEntrega.retiroTiendaDisponible && opcionesEntrega.direccionRetiro && (
              <p className="mt-3 text-sm opacity-80">
                Dirección de retiro: <span className="font-medium">{opcionesEntrega.direccionRetiro}</span>
              </p>
            )}
            <div className="mt-4 grid w-full min-w-0 gap-3 sm:grid-cols-2">
              {metodoEntrega === "DOMICILIO" && direcciones.length > 0 && <label className="min-w-0 text-sm">Dirección guardada (opcional)
                <select value={direccionSeleccionada} onChange={(evento) => {
                  const elegida = direcciones.find((direccion) => direccion.id === evento.target.value);
                  setDireccionSeleccionada(evento.target.value);
                  if (elegida) setEntrega((actual) => ({ ...actual, destinatario: elegida.destinatario ?? `${actual.nombre ?? ""} ${actual.apellido ?? ""}`.trim(), telefono: elegida.telefono ?? actual.telefono, calle: elegida.calle, numero: elegida.numero, piso: elegida.piso ?? "", departamento: elegida.departamento ?? "", codigoPostal: elegida.codigoPostal, localidad: elegida.localidad, provincia: elegida.provincia, referencias: elegida.referencias ?? "" }));
                }} className="mt-1 w-full min-w-0 rounded-lg border bg-transparent px-3 py-2">
                  <option value="">Ingresar otra dirección</option>{direcciones.map((direccion) => <option key={direccion.id} value={direccion.id}>{direccion.alias ?? `${direccion.calle} ${direccion.numero}`}</option>)}
                </select>
              </label>}
              {([ ["nombre", "Nombre"], ["apellido", "Apellido"], ["telefono", "Teléfono"] ] as const).map(([campo, etiqueta]) => (
                <label key={campo} className="min-w-0 text-sm">{etiqueta}
                  <input value={entrega[campo] ?? ""} onChange={(evento) => setEntrega((actual) => ({ ...actual, [campo]: evento.target.value }))}
                    autoComplete={campo === "telefono" ? "tel" : campo === "nombre" ? "given-name" : "family-name"}
                    className="mt-1 w-full min-w-0 rounded-lg border bg-transparent px-3 py-2" required />
                </label>
              ))}
              {metodoEntrega === "DOMICILIO" && (
                <>
                  {([ ["destinatario", "Destinatario"], ["calle", "Calle"], ["numero", "Número"], ["piso", "Piso"], ["departamento", "Departamento"], ["codigoPostal", "Código postal"], ["localidad", "Localidad"], ["provincia", "Provincia"] ] as const).map(([campo, etiqueta]) => {
                    const esOpcional = campo === "piso" || campo === "departamento";
                    return (
                      <label key={campo} className="min-w-0 text-sm">{etiqueta}{esOpcional ? " (opcional)" : ""}
                        <input value={entrega[campo] ?? ""} onChange={(evento) => setEntrega((actual) => ({ ...actual, [campo]: evento.target.value }))}
                          className="mt-1 w-full min-w-0 rounded-lg border bg-transparent px-3 py-2" required={!esOpcional} />
                      </label>
                    );
                  })}
                  <label className="min-w-0 text-sm">Referencias (opcional)
                    <textarea value={entrega.referencias ?? ""} onChange={(evento) => setEntrega((actual) => ({ ...actual, referencias: evento.target.value }))}
                      className="mt-1 w-full min-w-0 rounded-lg border bg-transparent px-3 py-2" rows={2} />
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
          ) : metodosParaEntrega.length === 0 ? (
            <p className="text-sm opacity-70">
              {avisoMetodos ?? "No hay métodos de pago disponibles en este momento."}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {avisoMetodos && <p role="status" className="text-sm opacity-70">{avisoMetodos}</p>}
              {metodosParaEntrega.map((metodo) => (
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
                reservaExpiraEn={reservaExpiraEn}
              />
              {esSandbox && (
                <p className="text-xs opacity-60">Estás operando en modo de prueba.</p>
              )}
            </>
          )}
        </div>

        <aside className="lg:sticky lg:top-20">
          <ResumenPedido
            items={resumenMostrado.items}
            subtotal={resumenMostrado.subtotal}
            moneda={resumenMostrado.moneda}
            modalidadEntrega={metodoEntrega}
            error={errorResumen}
            avisoPrecio={avisoPrecioVisible}
            alRevisarCarrito={openCart}
          >
            <button
              onClick={manejarContinuarCompra}
              disabled={
                pendiente ||
                Boolean(errorResumen) ||
                Boolean(errorCargaEntrega) ||
                modalidadesEntrega.length === 0 ||
                !metodoEntrega ||
                !metodoSeleccionado ||
                !metodosParaEntrega.some((metodo) => metodo.id === metodoSeleccionado) ||
                cartItems.length === 0
              }
              className="w-full rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
            >
              {pendiente && <Loader2 className="animate-spin" size={18} />}
              {pendiente ? "Procesando..." : "Continuar con el pago"}
            </button>
          </ResumenPedido>
        </aside>
      </div>
    </div>
  );
}
