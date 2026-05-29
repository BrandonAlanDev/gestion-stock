"use client";

import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  product: any;
  addToCart?: (product: any) => void;
}

const ProductCard = ({ product }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [fade, setFade] = useState(true);

  const images = product.images?.map((img: any) => img.srcImage) || [];

  // Hover slider
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

        {/* Badges — solo los esenciales, muy discretos */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isNew && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
              style={{
                background: "#0d5c63",
                color: "#ffffff",
                borderRadius: "4px",
              }}
            >
              Nuevo
            </span>
          )}
          {totalStock <= 0 && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
              style={{
                background: "rgba(0,0,0,0.06)",
                color: "#4a7c80",
                borderRadius: "4px",
              }}
            >
              Consultar stock
            </span>
          )}
        </div>

        {/* IMAGEN — fondo neutro, sin border radius agresivo */}
        <div
          className="overflow-hidden mb-5 relative"
          style={{
            background: "#f4f7f7",
            borderRadius: "12px",
            aspectRatio: "3 / 4",
          }}
        >
          <Image
            src={images[currentImage] || "/images/placeholder.avif"}
            alt={product.name}
            width={500}
            height={700}
            className={`w-full h-full object-contain transition-all duration-500 group-hover:scale-[1.03] ${
              fade ? "opacity-100" : "opacity-0"
            }`}
            style={{ padding: "12px" }}
          />
        </div>

        {/* INFO — tipografía limpia, sin caja */}
        <div className="px-1">

          {/* Categoría */}
          <p
            className="text-[10px] font-black uppercase tracking-widest mb-1"
            style={{ color: "#4ab8b8" }}
          >
            {product.category?.name}
            {product.subCategory?.name && ` / ${product.subCategory.name}`}
          </p>

          {/* Nombre */}
          <h3
            className="font-black uppercase italic leading-tight line-clamp-2 mb-3"
            style={{ color: "#083d42", fontSize: "17px", letterSpacing: "-0.02em" }}
          >
            {product.name}
          </h3>

        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;