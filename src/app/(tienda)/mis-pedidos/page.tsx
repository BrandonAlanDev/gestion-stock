import Link from "next/link";
import { redirect } from "next/navigation";
import { conPrisma } from "@/lib/prisma";
import { requiereUsuarioTenant } from "@/lib/tenants/requerir-usuario-tenant";

function urlSeguimientoSegura(valor: string | null): string | null {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch { return null; }
}

export default async function MisPedidos() {
  let usuarioId: string;
  try { usuarioId = (await requiereUsuarioTenant()).usuarioId; }
  catch { redirect("/login?callbackUrl=%2Fmis-pedidos"); }
  const pedidos = await conPrisma((prisma) => prisma.pedido.findMany({
    where: { userId: usuarioId }, include: { items: true, envio: true }, orderBy: { createdAt: "desc" }, take: 50,
  }));
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8" style={{ color: "var(--texto-sobre-fondo)" }}>
    <div><h1 className="text-2xl font-bold">Mis pedidos</h1><p className="mt-1 text-sm opacity-70">Consultá el estado de tus compras y envíos.</p></div>
    {pedidos.length === 0 ? <div className="rounded-xl border p-8 text-center"><p>Todavía no tenés pedidos.</p><Link href="/productos" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>Ver productos</Link></div> : pedidos.map((pedido) => {
      const url = urlSeguimientoSegura(pedido.envio?.trackingUrl ?? null);
      const pasos = pedido.metodoEntrega === "DOMICILIO"
        ? ["PENDIENTE", "PREPARANDO", "DESPACHADO", "ENTREGADO"]
        : ["PENDIENTE", "PREPARANDO", "ENTREGADO"];
      const etiquetas: Record<string, string> = { PENDIENTE: "Pendiente", PREPARANDO: "Preparando", DESPACHADO: "Despachado", ENTREGADO: "Entregado" };
      return <article key={pedido.id} className="rounded-xl border p-5" style={{ borderColor: "var(--color-primario)" }}>
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">Pedido #{pedido.numero ?? pedido.id.slice(-8).toUpperCase()}</h2><p className="text-xs opacity-70">{pedido.createdAt.toLocaleDateString("es-AR")}</p></div><strong>{new Intl.NumberFormat("es-AR", { style: "currency", currency: pedido.moneda }).format(Number(pedido.total))}</strong></div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full border px-3 py-1">Pedido: {pedido.estado}</span><span className="rounded-full border px-3 py-1">Pago: {pedido.estadoPago}</span><span className="rounded-full border px-3 py-1">Entrega: {pedido.estadoEnvio}</span></div>
        <ul className="mt-4 space-y-1 text-sm">{pedido.items.map((item) => <li key={item.id}>{item.cantidad} × {item.nombre}{item.varianteNombre ? ` · ${item.varianteNombre}` : ""}</li>)}</ul>
        <p className="mt-4 text-sm">{pedido.metodoEntrega === "DOMICILIO" ? `Envío a ${pedido.envio?.localidad ?? "domicilio"}` : "Retiro en tienda"}</p>
        {pedido.estado !== "CANCELADO" && <ol aria-label="Progreso de entrega" className="mt-3 grid gap-2 text-xs" style={{ gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))` }}>{pasos.map((paso, indice) => <li key={paso} aria-current={pedido.estadoEnvio === paso ? "step" : undefined} className="rounded-lg border px-2 py-2 text-center" style={{ borderColor: "var(--color-primario)", opacity: indice <= pasos.indexOf(pedido.estadoEnvio) ? 1 : 0.45, backgroundColor: pedido.estadoEnvio === paso ? "var(--color-primario)" : "transparent", color: pedido.estadoEnvio === paso ? "var(--texto-sobre-primario)" : "inherit" }}>{etiquetas[paso]}</li>)}</ol>}
        {pedido.envio?.trackingNumero && <p className="mt-1 text-sm">{pedido.envio.transportista ?? "Transportista"}: {pedido.envio.trackingNumero}</p>}
        {url && <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline" style={{ color: "var(--color-primario)" }}>Seguir envío</a>}
      </article>;
    })}
  </div>;
}
