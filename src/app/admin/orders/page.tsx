import Link from "next/link";
import type { Prisma } from "@/../generated/prisma/client";
import { conPrismaTenant } from "@/lib/prisma";
import { requiereAdmin } from "@/lib/tenants/requiere-admin";

type Parametros = { searchParams: Promise<{ q?: string; estado?: string; revision?: string; pagina?: string }> };
const estados = ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "LISTO", "ENVIADO", "ENTREGADO", "CANCELADO"] as const;

export default async function PaginaPedidos({ searchParams }: Parametros) {
  const contexto = await requiereAdmin();
  const filtros = await searchParams;
  const q = filtros.q?.trim().slice(0, 100) ?? "";
  const estado = estados.find((valor) => valor === filtros.estado);
  const revisionTransferencias = filtros.revision === "transferencias";
  const numeroPagina = Number(filtros.pagina);
  const pagina = Number.isInteger(numeroPagina) && numeroPagina > 0 ? Math.min(10000, numeroPagina) : 1;
  const { pedidos, total } = await conPrismaTenant(contexto.tenantId, async (prisma) => {
    const numeroBuscado = /^\d+$/.test(q) ? Number(q) : null;
    const where: Prisma.PedidoWhereInput = {
      ...(estado ? { estado } : {}),
      ...(revisionTransferencias ? { metodoPago: "transferencia", estadoPago: "EN_ACREDITACION" } : {}),
      ...(q ? { OR: [{ id: { contains: q } }, { nombreCliente: { contains: q } }, { emailCliente: { contains: q } }, ...(numeroBuscado !== null && Number.isSafeInteger(numeroBuscado) ? [{ numero: numeroBuscado }] : [])] } : {}),
    };
    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({ where, orderBy: { createdAt: "desc" }, skip: (pagina - 1) * 20, take: 20, include: {
        envio: { select: { trackingNumero: true } },
        eventos: {
          where: { tipo: "PAGO_EN_ACREDITACION", estadoNuevo: "EN_ACREDITACION" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      } }),
      prisma.pedido.count({ where }),
    ]);
    return { pedidos, total };
  });
  const enlace = (numero: number) => `/admin/orders?${new URLSearchParams({ ...(q ? { q } : {}), ...(estado ? { estado } : {}), ...(revisionTransferencias ? { revision: "transferencias" } : {}), pagina: String(numero) })}`;
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
    <div><h1 className="text-2xl font-bold">Pedidos</h1><p className="mt-1 text-sm text-[var(--admin-texto-suave)]">{total} pedidos encontrados</p></div>
    <form className="admin-panel flex flex-wrap gap-3 p-4">
      <input name="q" defaultValue={q} placeholder="Buscar por ID, cliente o correo" className="min-w-56 flex-1 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2 text-sm" />
      <select name="estado" defaultValue={estado ?? ""} className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2 text-sm"><option value="">Todos los estados</option>{estados.map((valor) => <option key={valor}>{valor}</option>)}</select>
      <select name="revision" defaultValue={revisionTransferencias ? "transferencias" : ""} className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2 text-sm"><option value="">Todas las revisiones</option><option value="transferencias">Transferencias informadas</option></select>
      <button className="rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm text-[var(--admin-primario-texto)]">Filtrar</button>
    </form>
    <div className="admin-panel divide-y divide-[var(--admin-borde)] overflow-hidden">
      {pedidos.length === 0 ? <p className="p-8 text-center text-sm text-[var(--admin-texto-suave)]">No hay pedidos para estos filtros.</p> : pedidos.map((pedido) => <Link key={pedido.id} href={`/admin/orders/${pedido.id}`} className="grid gap-2 p-4 text-sm hover:bg-[var(--admin-fondo-hover)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
        <div><span className="font-semibold">#{pedido.numero ?? pedido.id.slice(-8).toUpperCase()}</span><p className="text-xs text-[var(--admin-texto-suave)]">{pedido.createdAt.toLocaleDateString("es-AR")}</p></div>
        <div><p>{pedido.nombreCliente || pedido.emailCliente || "Cliente"}</p><p className="truncate text-xs text-[var(--admin-texto-suave)]">{pedido.emailCliente}</p></div>
        <div><p>{pedido.estado}</p><p className="text-xs text-[var(--admin-texto-suave)]">Pago: {pedido.estadoPago === "EN_ACREDITACION" && pedido.metodoPago === "transferencia" ? "Informado, pendiente de verificación" : pedido.estadoPago} · Envío: {pedido.estadoEnvio}</p>{pedido.eventos[0] && <p className="text-xs text-[var(--admin-texto-suave)]">En revisión hace {Math.floor(Math.max(0, Date.now() - pedido.eventos[0].createdAt.getTime()) / 3_600_000)} horas</p>}</div>
        <strong>{new Intl.NumberFormat("es-AR", { style: "currency", currency: pedido.moneda }).format(Number(pedido.total))}</strong>
      </Link>)}
    </div>
    <nav aria-label="Paginación" className="flex justify-end gap-3 text-sm">
      {pagina > 1 && <Link href={enlace(pagina - 1)} className="rounded-lg border border-[var(--admin-borde)] px-4 py-2">Anterior</Link>}
      {pagina * 20 < total && <Link href={enlace(pagina + 1)} className="rounded-lg border border-[var(--admin-borde)] px-4 py-2">Siguiente</Link>}
    </nav>
  </div>;
}
