import { obtenerPrendaPorId } from "@/lib/services/prendas/obtener-prenda-por-id";
import { serializarDatos } from "@/lib/utilidades/serializar-datos";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { requiereTenantActivo } from "@/lib/tenants/requiere-tenant-activo";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const tenant = await requiereTenantActivo();
  const product = serializarDatos(await obtenerPrendaPorId(tenant.id, id)) as unknown as ProductoDetalleSerializado | null;

  if (!product) {
    notFound();
  }

  return <ProductDetailClient tenantId={tenant.id} initialProduct={product} />;
}
