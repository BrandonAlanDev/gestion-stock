"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import type { ProductoCatalogo } from "@/types/productos/catalogo-publico";

interface Props {
  product: Omit<ProductoCatalogo, "createdAt"> & { createdAt?: ProductoCatalogo["createdAt"] };
  priority?: boolean;
}

const ProductCard = ({ product, priority = false }: Props) => {
  const { pageConfig } = usePageConfig();
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [fade, setFade] = useState(true);
  const timeoutTransicionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const images = useMemo(() => {
    return (product.images ?? []).map((img) => img.srcImage);
  }, [product.images]);

  useEffect(() => {
    setCurrentImage((imagenActual) => Math.min(imagenActual, Math.max(images.length - 1, 0)));
  }, [images.length]);

  useEffect(() => {
    if (!isHovering || images.length <= 1) {
      setCurrentImage(0);
      setFade(true);
      return;
    }
    const interval = setInterval(() => {
      setFade(false);
      timeoutTransicionRef.current = setTimeout(() => {
        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 300);
    }, 2000);
    return () => {
      clearInterval(interval);
      if (timeoutTransicionRef.current) {
        clearTimeout(timeoutTransicionRef.current);
        timeoutTransicionRef.current = null;
      }
    };
  }, [isHovering, images]);

  const isNew = product.createdAt
    ? new Date(product.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 14)
    : false;
  const moneda = typeof pageConfig?.currency === "string" && /^[A-Z]{3}$/.test(pageConfig.currency) ? pageConfig.currency : "ARS";
  const precio = Number(product.price);
  const precioFormateado = Number.isFinite(precio)
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: moneda, maximumFractionDigits: 2 }).format(precio)
    : null;
  const imagen = obtenerUrlImagenOptimizada(images[currentImage], 1200) || "/images/placeholder.svg";

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group min-w-0"
    >
      <Link
        href={`/productos/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-sm border border-current/10 bg-[var(--color-secundario)] text-[var(--texto-sobre-secundario)] transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primario)]"
      >
        <div className="relative aspect-square overflow-hidden bg-[var(--superficie-imagen)]">
          {isNew && (
            <span
              className="absolute left-3 top-3 z-10 rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
            >
              Nuevo
            </span>
          )}
          <Image
            src={imagen}
            alt={product.name}
            width={500}
            height={700}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            unoptimized={!imagenAdmiteOptimizacion(imagen)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${fade ? "opacity-100" : "opacity-0"
              }`}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">{product.name}</h3>
          {precioFormateado && <p className="text-sm font-medium">{precioFormateado}</p>}
          <span className="inline-block pt-2 text-sm font-medium text-[var(--color-primario)]">Ver producto <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
