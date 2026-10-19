"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";
import { imagenAdmiteOptimizacion } from "@/lib/utilidades/imagen-admite-optimizacion";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import type { ProductoCatalogo } from "@/types/productos/catalogo-publico";

interface Props {
  product: Omit<ProductoCatalogo, "createdAt"> & { createdAt?: ProductoCatalogo["createdAt"] };
}

const ProductCard = ({ product }: Props) => {
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

  const totalStock =
    product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;

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
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative min-w-0"
    >
      <Link href={`/productos/item/${product.id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primario)]">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isNew && (
            <span
              className="rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
            >
              Nuevo
            </span>
          )}
          {totalStock <= 0 && (
            <span
              className="rounded-md px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "var(--color-secundario)", color: "var(--texto-sobre-secundario)" }}
            >
              Consultar stock
            </span>
          )}
        </div>

        <div
          className="relative aspect-[4/5] overflow-hidden rounded-xl border border-black/5 bg-[var(--superficie-imagen)]"
        >
          <Image
            src={imagen}
            alt={product.name}
            width={500}
            height={700}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            loading="lazy"
            unoptimized={!imagenAdmiteOptimizacion(imagen)}
            className={`h-full w-full object-contain p-4 transition-all duration-500 group-hover:scale-[1.03] ${fade ? "opacity-100" : "opacity-0"
              }`}
          />
        </div>
        <div className="space-y-1 px-0.5 pt-3">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[var(--texto-sobre-fondo)]">{product.name}</h3>
          {precioFormateado && <p className="text-sm font-medium text-[var(--texto-sobre-fondo)]">{precioFormateado}</p>}
          <span className="inline-block pt-1 text-sm font-medium text-[var(--color-primario)]">Ver producto <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
