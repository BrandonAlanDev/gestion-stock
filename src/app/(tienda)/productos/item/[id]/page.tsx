import { notFound, redirect } from "next/navigation";
import { obtenerIndiceProductosPublicos } from "@/lib/services/prendas/obtener-indice-productos-publicos";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const tenant = await requiereTenantActivo();
  const indice = await obtenerIndiceProductosPublicos(tenant.id);
  const slug = indice.porId[id]?.slug;
  if (!slug) notFound();
  redirect(`/productos/${slug}`);
}
