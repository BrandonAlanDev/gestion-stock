"use client";

import { useProductDetail } from "@/hooks/useProductDetail";
import ProductoView from "@/components/providers/products/views/ProductoView";
import { SkeletonTienda } from "@/components/ui/skeleton-vistas";
import { notFound } from "next/navigation";
import type { obtenerPrendaPorId } from "@/actions/prendas/obtener-prenda-por-id";

interface Props {
  id: string;
  initialProduct: NonNullable<Awaited<ReturnType<typeof obtenerPrendaPorId>>>;
}

export default function ProductDetailClient({ id, initialProduct }: Props) {
  const { data: product, isLoading, isError } = useProductDetail(id, initialProduct);

  if (isLoading && !product) {
    return <SkeletonTienda tipo="producto" />;
  }

  if (isError || !product) {
    notFound();
  }

  return <ProductoView product={product} />;
}
