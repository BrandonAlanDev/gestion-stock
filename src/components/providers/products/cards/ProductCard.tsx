"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface Props {
  product: any;
  addToCart?: (product: any) => void;
}

const ProductCard = ({ product }: Props) => {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";

  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [fade, setFade] = useState(true);

  const images =
    product.images?.length > 1
      ? product.images.slice(1).map((img: any) => img.srcImage)
      : product.images?.map((img: any) => img.srcImage) || [];

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
    product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;

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
              style={{ backgroundColor: primaryColor, color: "#ffffff", borderRadius: "4px" }}
            >
              Nuevo
            </span>
          )}
          {totalStock <= 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
              style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor, borderRadius: "4px" }}
            >
              Consultar stock
            </span>
          )}
        </div>

        <div
          className="overflow-hidden mb-5 relative"
          style={{ background: "#f8fafc", borderRadius: "12px", aspectRatio: "3 / 4" }}
        >
          <Image
            src={images[currentImage] || "/images/placeholder.avif"}
            alt={product.name}
            width={500}
            height={700}
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.03] ${fade ? "opacity-100" : "opacity-0"
              }`}
            style={{ padding: "12px" }}
          />

          {/* Nombre superpuesto */}
          <h3
            className="absolute bottom-4 left-0 right-0 text-center font-black uppercase italic px-3 line-clamp-2"
            style={{ color: primaryColor, fontSize: "22px", letterSpacing: "-0.02em" }}
          >
            {product.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;