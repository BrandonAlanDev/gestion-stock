import Link from "next/link";
import { notFound } from "next/navigation";
import AccionesPedido from "@/components/admin/pedidos/acciones-pedido";
import { conPrismaTenant } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export default async function DetallePedido({ params }: { params: Promise<{ id: string }> }) {
  const contexto = await requiereAdmin();
  const { id } = await params;
  if (!id || id.length > 191) notFound();
  const { pedido, transportistas } = await conPrismaTenant(contexto.tenantId, async (prisma) => ({
    pedido: await prisma.pedido.findUnique({ where: { id }, include: { items: true, envio: true, user: { select: { id: true, name: true, email: true } }, eventos: { orderBy: { createdAt: "desc" } }, payments: { orderBy: { createdAt: "desc" } } } }),
    transportistas: await prisma.transportista.findMany({ where: { activo: true }, orderBy: [{ orden: "asc" }, { nombre: "asc" }], select: { id: true, nombre: true } }),
  }));
  if (!pedido) notFound();
  const dinero = (monto: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: pedido.moneda }).format(monto);
  const eventoRevision = pedido.metodoPago === "transferencia"
    ? pedido.eventos.find((evento) => evento.tipo === "PAGO_EN_ACREDITACION" && evento.estadoNuevo === "EN_ACREDITACION")
    : undefined;
  const antiguedadRevision = eventoRevision
    ? Math.max(0, Date.now() - eventoRevision.createdAt.getTime())
    : 0;
  const textoAntiguedad = eventoRevision
    ? `${Math.floor(antiguedadRevision / 86_400_000)} días, ${Math.floor((antiguedadRevision % 86_400_000) / 3_600_000)} horas`
    : null;
  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
    <div><Link href="/admin/orders" className="text-sm text-[var(--admin-primario)]">← Pedidos</Link><h1 className="mt-3 text-2xl font-bold">Pedido #{pedido.numero ?? pedido.id.slice(-8).toUpperCase()}</h1><p className="text-sm text-[var(--admin-texto-suave)]">{pedido.createdAt.toLocaleString("es-AR")} · {pedido.id}</p></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <section className="admin-panel p-5"><h2 className="font-semibold">Productos</h2><div className="mt-4 divide-y divide-[var(--admin-borde)]">{pedido.items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-medium">{item.nombre}</p><p className="text-[var(--admin-texto-suave)]">{item.varianteNombre && `${item.varianteNombre} · `}{item.cantidad} × {dinero(Number(item.precioUnitario))}</p></div><strong>{dinero(Number(item.subtotal))}</strong></div>)}</div><div className="mt-4 space-y-1 border-t border-[var(--admin-borde)] pt-4 text-sm"><p>Subtotal: {dinero(Number(pedido.subtotal))}</p><p>Envío: {dinero(Number(pedido.costoEnvio))}</p><p className="text-base font-bold">Total: {dinero(Number(pedido.total))}</p></div></section>
        <section className="admin-panel p-5"><h2 className="font-semibold">Entrega</h2><p className="mt-3 text-sm">{pedido.metodoEntrega === "DOMICILIO" ? "Envío a domicilio" : "Retiro en tienda"} · {pedido.estadoEnvio}</p>{pedido.envio && <div className="mt-3 space-y-1 text-sm text-[var(--admin-texto-suave)]"><p>{pedido.envio.destinatario} · {pedido.envio.telefono}</p><p>{pedido.envio.calle} {pedido.envio.numero} {pedido.envio.piso} {pedido.envio.departamento}</p><p>{pedido.envio.codigoPostal} {pedido.envio.localidad}, {pedido.envio.provincia}</p>{pedido.envio.referencias && <p>Referencias: {pedido.envio.referencias}</p>}{pedido.envio.trackingNumero && <p>Seguimiento: {pedido.envio.transportista} · {pedido.envio.trackingNumero}</p>}{pedido.envio.trackingUrl && <a href={pedido.envio.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--admin-primario)]">Abrir seguimiento</a>}</div>}</section>
        <section className="admin-panel p-5"><h2 className="font-semibold">Historial</h2><ol className="mt-4 space-y-3 text-sm">{pedido.eventos.length === 0 ? <li className="text-[var(--admin-texto-suave)]">Sin eventos registrados.</li> : pedido.eventos.map((evento) => <li key={evento.id} className="border-l-2 border-[var(--admin-borde)] pl-3"><span>{evento.descripcion}</span><span className="ml-2 text-xs text-[var(--admin-texto-suave)]">{evento.createdAt.toLocaleString("es-AR")}</span>{evento.tipo === "PAGO_EN_ACREDITACION" && <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">Informó: {evento.usuarioId === pedido.user.id ? pedido.user.name ?? pedido.user.email ?? "cliente titular" : evento.usuarioId ? "Administración" : "Sistema"}{evento.metadata && typeof evento.metadata === "object" && !Array.isArray(evento.metadata) && "origen" in evento.metadata && evento.metadata.origen === "administracion" ? " (marcado por administración)" : ""}</p>}</li>)}</ol></section>
      </div>
      <div className="space-y-5">
        <section className="admin-panel space-y-2 p-5 text-sm"><h2 className="text-base font-semibold">Cliente y pago</h2><p>{pedido.nombreCliente} {pedido.apellidoCliente}</p><p>{pedido.emailCliente}</p><p>{pedido.telefonoCliente}</p><p>Pedido: <strong>{pedido.estado}</strong></p><p>Pago: <strong>{pedido.estadoPago === "EN_ACREDITACION" && pedido.metodoPago === "transferencia" ? "Pago informado, pendiente de verificación" : pedido.estadoPago}</strong> · {pedido.metodoPago ?? "Sin método"}</p>{eventoRevision && <p>Transferencia en revisión desde {eventoRevision.createdAt.toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" })} · hace {textoAntiguedad}</p>}</section>
        <AccionesPedido pedidoId={pedido.id} estado={pedido.estado} estadoPago={pedido.estadoPago} estadoEnvio={pedido.estadoEnvio} metodoPago={pedido.metodoPago} metodoEntrega={pedido.metodoEntrega} reservaExpiraEn={pedido.reservaExpiraEn?.toISOString() ?? null} transportistas={transportistas} seguimiento={pedido.envio ? { transportistaId: pedido.envio.transportistaId, trackingNumero: pedido.envio.trackingNumero, trackingUrl: pedido.envio.trackingUrl, fechaEstimada: pedido.envio.fechaEstimada?.toISOString().slice(0, 10) ?? null } : null} />
      </div>
    </div>
  </div>;
}
