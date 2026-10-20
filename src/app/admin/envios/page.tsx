import Link from "next/link";
import { conPrisma } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

export default async function PaginaEnvios({ searchParams }: { searchParams: Promise<{ estado?: string; pagina?: string }> }) {
  await requiereAdmin();
  const { estado, pagina: paginaTexto } = await searchParams;
  const estados = ["PENDIENTE", "PREPARANDO", "DESPACHADO", "ENTREGADO"] as const;
  const filtro = estados.find((valor) => valor === estado);
  const numeroPagina = Number(paginaTexto);
  const pagina = Number.isInteger(numeroPagina) && numeroPagina > 0 ? Math.min(10000, numeroPagina) : 1;
  const { pedidos, total } = await conPrisma(async (prisma) => {
    const where = { metodoEntrega: "DOMICILIO" as const, estado: { not: "CANCELADO" as const }, ...(filtro ? { estadoEnvio: filtro } : {}) };
    const [pedidos, total] = await prisma.$transaction([
      prisma.pedido.findMany({ where, include: { envio: true }, orderBy: { createdAt: "desc" }, skip: (pagina - 1) * 30, take: 30 }),
      prisma.pedido.count({ where }),
    ]);
    return { pedidos, total };
  });
  const enlace = (numero: number) => `/admin/envios?${new URLSearchParams({ ...(filtro ? { estado: filtro } : {}), pagina: String(numero) })}`;
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
    <div><h1 className="text-2xl font-bold">Envíos</h1><p className="mt-1 text-sm text-[var(--admin-texto-suave)]">Pedidos con entrega a domicilio</p></div>
    <nav className="flex flex-wrap gap-2 text-sm"><Link href="/admin/envios" className="rounded-lg border border-[var(--admin-borde)] px-3 py-2">Todos</Link>{estados.map((valor) => <Link key={valor} href={`/admin/envios?estado=${valor}`} className="rounded-lg border border-[var(--admin-borde)] px-3 py-2">{valor}</Link>)}</nav>
    <div className="admin-panel divide-y divide-[var(--admin-borde)]">{pedidos.length === 0 ? <p className="p-8 text-center text-sm text-[var(--admin-texto-suave)]">No hay envíos para este filtro.</p> : pedidos.map((pedido) => <Link key={pedido.id} href={`/admin/orders/${pedido.id}`} className="grid gap-2 p-4 text-sm hover:bg-[var(--admin-fondo-hover)] sm:grid-cols-4 sm:items-center"><strong>#{pedido.numero ?? pedido.id.slice(-8).toUpperCase()}</strong><span>{pedido.nombreCliente} {pedido.apellidoCliente}</span><span>{pedido.envio?.localidad ?? "Dirección pendiente"}, {pedido.envio?.provincia}</span><span>{pedido.estadoEnvio} · {pedido.envio?.transportista ?? "Sin transportista"}</span></Link>)}</div>
    <nav aria-label="Paginación" className="flex justify-end gap-3 text-sm">{pagina > 1 && <Link href={enlace(pagina - 1)} className="rounded-lg border border-[var(--admin-borde)] px-4 py-2">Anterior</Link>}{pagina * 30 < total && <Link href={enlace(pagina + 1)} className="rounded-lg border border-[var(--admin-borde)] px-4 py-2">Siguiente</Link>}</nav>
  </div>;
}
