"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";

interface ProductoTarjeta {
  id: string;
  name: string;
  createdAt: string | Date;
  images?: Array<{ srcImage: string }>;
  variants?: Array<{ stock: number }>;
}

interface Props {
  product: ProductoTarjeta;
}

const ProductCard = ({ product }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [fade, setFade] = useState(true);

  const images = useMemo(() => {
    return (product.images ?? []).map((img) => img.srcImage);
  }, [product.images]);

  useEffect(() => {
    if (!isHovering || images.length <= 1) {
      setCurrentImage(0);
      setFade(true);
      return;
    }
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        setFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, [isHovering, images]);

  const totalStock =
    product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;

  const isNew =
    new Date(product.createdAt) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 14);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="select-none group relative"
    >
      <Link href={`/productos/item/${product.id}`} className="block">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isNew && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
              style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)", borderRadius: "4px" }}
            >
              Nuevo
            </span>
          )}
          {totalStock <= 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-primario) 10%, transparent)", color: "var(--color-primario)", borderRadius: "4px" }}
            >
              Consultar stock
            </span>
          )}
        </div>

        <div
          className="overflow-hidden mb-5 relative"
          style={{ background: "var(--superficie-imagen)", borderRadius: "12px", aspectRatio: "3 / 4" }}
        >
          <Image
            src={obtenerUrlImagenOptimizada(images[currentImage], 1200) || "/images/placeholder.avif"}
            alt={product.name}
            width={500}
            height={700}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.03] mix-blend-multiply ${fade ? "opacity-100" : "opacity-0"
              }`}
            style={{ padding: "12px" }}
          />

          {/* Nombre superpuesto */}
          <h3
            className="absolute bottom-4 left-0 right-0 text-center font-black uppercase italic px-3 line-clamp-2"
            style={{ color: "var(--color-primario)", fontSize: "22px", letterSpacing: "-0.02em" }}
          >
            {product.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
