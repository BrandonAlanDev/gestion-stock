"use client";

import { useProductDetail } from "@/hooks/useProductDetail";
import ProductoView from "@/components/providers/products/views/ProductoView";
import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import type { getGarmentById } from "@/actions/garments";

interface Props {
  id: string;
  initialProduct: NonNullable<Awaited<ReturnType<typeof getGarmentById>>>;
}

export default function ProductDetailClient({ id, initialProduct }: Props) {
  const { data: product, isLoading, isError } = useProductDetail(id, initialProduct);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-primario)] animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    notFound();
  }

  return <ProductoView product={product} />;
}
