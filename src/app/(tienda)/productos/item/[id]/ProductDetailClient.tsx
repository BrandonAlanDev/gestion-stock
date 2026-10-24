"use client";

import ProductoView from "@/components/providers/products/views/ProductoView";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";
import { useEffect } from "react";
import { guardarDetalleProducto } from "@/lib/productos/cache-cliente";

interface Props {
  tenantId: string;
  initialProduct: ProductoDetalleSerializado;
}

export default function ProductDetailClient({ tenantId, initialProduct }: Props) {
  useEffect(() => {
    guardarDetalleProducto(tenantId, initialProduct);
  }, [tenantId, initialProduct]);

  return <ProductoView product={initialProduct} />;
}
