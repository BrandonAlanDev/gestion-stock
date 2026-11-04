"use client";

import { useEffect, useMemo, useState } from "react";
import ProductoView from "@/components/providers/products/views/ProductoView";
import { SkeletonTienda } from "@/components/ui/skeleton-vistas";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";
import type { ProductoDetalleSerializado } from "@/types/productos/detalle-producto";

export default function DetalleProductoClient({ producto }: { producto: ProductoDetalleSerializado }) {
  const [imagenesListas, setImagenesListas] = useState<string | null>(null);
  const urls = useMemo(() => {
    if (producto.images.length === 0) return ["/images/placeholder.svg"];
    const principal = producto.images[0].srcImage;
    return [...new Set([
      obtenerUrlImagenOptimizada(principal, 1200) || principal,
      ...(producto.images.length > 1 ? producto.images.map((imagen) =>
        obtenerUrlImagenOptimizada(imagen.srcImage, 200) || imagen.srcImage
      ) : []),
    ])];
  }, [producto.images]);
  const clave = `${producto.id}:${urls.join("|")}`;

  useEffect(() => {
    let activo = true;
    Promise.all(urls.map((url) => new Promise<void>((resolver) => {
      const imagen = new window.Image();
      imagen.onload = () => resolver();
      imagen.onerror = () => resolver();
      imagen.src = url;
      if (imagen.complete) resolver();
    }))).then(() => {
      if (activo) setImagenesListas(clave);
    });
    return () => { activo = false; };
  }, [clave, urls]);

  if (imagenesListas !== clave) return <SkeletonTienda tipo="producto" />;
  return <ProductoView product={producto} />;
}
