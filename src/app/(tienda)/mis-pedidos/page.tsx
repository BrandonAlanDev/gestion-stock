import Link from "next/link";
import { redirect } from "next/navigation";
import { conPrismaTenant } from "@/lib/prisma";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";
import BotonInformarTransferencia from "@/components/pedidos/BotonInformarTransferencia";

function obtenerInstrucciones(pagos: Array<{ metadata: unknown }>): string | null {
  const metadata = pagos[0]?.metadata;
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) return null;
  const instrucciones = (metadata as Record<string, unknown>).instrucciones;
  return typeof instrucciones === "string" && instrucciones.trim()
    ? instrucciones.trim()
    : null;
}

function urlSeguimientoSegura(valor: string | null): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
}

export default async function MisPedidos() {
  let contexto: Awaited<ReturnType<typeof requiereUsuarioTenant>>;
  try { contexto = await requiereUsuarioTenant(); }
  catch { redirect("/login?callbackUrl=%2Fmis-pedidos"); }
  const pedidos = await conPrismaTenant(contexto.tenantId, (prisma) => prisma.pedido.findMany({
    where: { userId: contexto.usuarioId },
    include: {
      items: true,
      envio: true,
      payments: {
        where: { proveedor: "transferencia" },
        select: { metadata: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      eventos: {
        where: { tipo: "PAGO_EN_ACREDITACION" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  }));
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8" style={{ color: "var(--texto-sobre-fondo)" }}>
    <div><h1 className="text-2xl font-bold">Mis pedidos</h1><p className="mt-1 text-sm opacity-70">Consultá el estado de tus compras y envíos.</p></div>
    {pedidos.length === 0 ? <div className="rounded-xl border p-8 text-center"><p>Todavía no tenés pedidos.</p><Link href="/productos" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>Ver productos</Link></div> : pedidos.map((pedido) => {
      const url = urlSeguimientoSegura(pedido.envio?.trackingUrl ?? null);
      const ahora = new Date();
      const vencido = pedido.estadoPago === "PENDIENTE" &&
        pedido.reservaExpiraEn !== null && pedido.reservaExpiraEn <= ahora;
      const instrucciones = pedido.metodoPago === "transferencia" &&
        (pedido.estadoPago === "PENDIENTE" || pedido.estadoPago === "EN_ACREDITACION")
        ? obtenerInstrucciones(pedido.payments)
        : null;
      const fechaLimite = pedido.reservaExpiraEn?.toLocaleString("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Argentina/Buenos_Aires",
      });
      const pasos = pedido.metodoEntrega === "DOMICILIO"
        ? ["PENDIENTE", "PREPARANDO", "DESPACHADO", "ENTREGADO"]
        : ["PENDIENTE", "PREPARANDO", "ENTREGADO"];
      const etiquetas: Record<string, string> = { PENDIENTE: "Pendiente", PREPARANDO: "Preparando", DESPACHADO: "Despachado", ENTREGADO: "Entregado" };
      return <article key={pedido.id} className="rounded-xl border p-5" style={{ borderColor: "var(--color-primario)" }}>
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">Pedido #{pedido.numero ?? pedido.id.slice(-8).toUpperCase()}</h2><p className="text-xs opacity-70">{pedido.createdAt.toLocaleDateString("es-AR")}</p></div><strong>{new Intl.NumberFormat("es-AR", { style: "currency", currency: pedido.moneda }).format(Number(pedido.total))}</strong></div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full border px-3 py-1">Pedido: {pedido.estado}</span><span className="rounded-full border px-3 py-1">Pago: {pedido.estadoPago === "EN_ACREDITACION" && pedido.metodoPago === "transferencia" ? "Pago informado, pendiente de verificación" : pedido.estadoPago === "RECHAZADO" ? "Pago rechazado" : pedido.estadoPago}</span><span className="rounded-full border px-3 py-1">Entrega: {pedido.estadoEnvio}</span></div>
        <ul className="mt-4 space-y-1 text-sm">{pedido.items.map((item) => <li key={item.id}>{item.cantidad} × {item.nombre}{item.varianteNombre ? ` · ${item.varianteNombre}` : ""}</li>)}</ul>
        <p className="mt-4 text-sm">{pedido.metodoEntrega === "DOMICILIO" ? `Envío a ${pedido.envio?.localidad ?? "domicilio"}` : "Retiro en tienda"}</p>
        {pedido.estadoPago === "PENDIENTE" && pedido.reservaExpiraEn && (
          <p className="mt-2 text-sm">
            {vencido ? "El plazo de reserva venció" : "Fecha límite de la reserva"}: {fechaLimite}
          </p>
        )}
        {pedido.metodoPago === "efectivo" && pedido.estadoPago === "PENDIENTE" && (
          <p className="mt-2 text-sm opacity-75">El pago en efectivo se realiza al retirar el pedido en la tienda.</p>
        )}
        {pedido.estadoPago === "EN_ACREDITACION" && pedido.metodoPago === "transferencia" && (
          <p className="mt-2 text-sm">Informaste el pago el {pedido.eventos[0]?.createdAt.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" }) ?? "fecha no disponible"}. La reserva se mantiene mientras el comercio verifica la transferencia.</p>
        )}
        {instrucciones ? (
          <div className="mt-4 rounded-lg border p-3 text-sm">
            <p className="mb-1 font-semibold">Instrucciones de transferencia</p>
            <p className="whitespace-pre-wrap">{instrucciones}</p>
          </div>
        ) : pedido.metodoPago === "transferencia" && pedido.estadoPago === "PENDIENTE" ? (
          <p className="mt-3 text-sm opacity-75">No hay instrucciones bancarias guardadas para este pedido. Consultá con la tienda antes de transferir.</p>
        ) : null}
        {pedido.estado === "PENDIENTE" && pedido.estadoPago === "PENDIENTE" &&
          pedido.metodoPago === "transferencia" && !vencido && (
            <BotonInformarTransferencia pedidoId={pedido.id} />
          )}
        {vencido && pedido.estado !== "CANCELADO" && (
          <p className="mt-3 text-sm text-amber-700">La reserva venció. El pedido no puede reactivarse desde esta página.</p>
        )}
        {pedido.estado !== "CANCELADO" && <ol aria-label="Progreso de entrega" className="mt-3 grid gap-2 text-xs" style={{ gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))` }}>{pasos.map((paso, indice) => <li key={paso} aria-current={pedido.estadoEnvio === paso ? "step" : undefined} className="rounded-lg border px-2 py-2 text-center" style={{ borderColor: "var(--color-primario)", opacity: indice <= pasos.indexOf(pedido.estadoEnvio) ? 1 : 0.45, backgroundColor: pedido.estadoEnvio === paso ? "var(--color-primario)" : "transparent", color: pedido.estadoEnvio === paso ? "var(--texto-sobre-primario)" : "inherit" }}>{etiquetas[paso]}</li>)}</ol>}
        {pedido.envio?.trackingNumero && <p className="mt-1 text-sm">{pedido.envio.transportista ?? "Transportista"}: {pedido.envio.trackingNumero}</p>}
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline" style={{ color: "var(--color-primario)" }}>Seguir envío</a>}
      </article>;
    })}
  </div>;
}
