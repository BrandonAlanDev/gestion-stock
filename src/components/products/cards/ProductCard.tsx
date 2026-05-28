"use client";

import { motion } from "framer-motion";

import {
  Star,
  Truck,
  Heart,
} from "lucide-react";

import Image from "next/image";

import { useEffect, useState } from "react";

import Link from "next/link";

interface Props {
  product: any;
  addToCart?: (product: any) => void;
}

const ProductCard = ({
  product,
}: Props) => {
  const [currentImage, setCurrentImage] =
    useState(0);

  const [isHovering, setIsHovering] =
    useState(false);

  const [fade, setFade] = useState(true);

  // =========================================
  // IMÁGENES
  // =========================================

  const images =
    product.images?.map(
      (img: any) => img.srcImage
    ) || [];

  // =========================================
  // HOVER SLIDER
  // =========================================

  useEffect(() => {
    if (
      !isHovering ||
      images.length <= 1
    ) {
      setCurrentImage(0);
      setFade(true);
      return;
    }

    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentImage((prev) =>
          prev === images.length - 1
            ? 0
            : prev + 1
        );

        setFade(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovering, images]);

  // =========================================
  // STOCK TOTAL
  // =========================================

  const totalStock =
    product.variants?.reduce(
      (acc: number, variant: any) =>
        acc + variant.stock,
      0
    ) || 0;

  // =========================================
  // NEW PRODUCT
  // =========================================

  const isNew =
    new Date(product.createdAt) >
    new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 14
    );

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() =>
        setIsHovering(true)
      }
      onMouseLeave={() =>
        setIsHovering(false)
      }
      className="select-none group bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden"
    >

      <Link
        href={`/productos/item/${product.id}`}
      >

        {/* BADGES */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">

          {isNew && (
            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Nuevo
            </span>
          )}

          {totalStock <= 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              Consultar stock con el vendedor
            </span>
          )}

        </div>

        {/* FAVORITO */}
        <button
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-slate-400 hover:text-red-500"
        >
          <Heart className="w-4 h-4" />
        </button>

        {/* IMAGE */}
        <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-50 mb-4 relative">

          <Image
            src={
              images[currentImage] ||
              "/images/placeholder.avif"
            }
            alt={product.name}
            width={500}
            height={700}
            className={`
              w-full h-full object-cover group-hover:scale-105 transition-all duration-500
              ${
                fade
                  ? "opacity-100"
                  : "opacity-0"
              }
            `}
          />

        </div>

        {/* CONTENT */}
        <div className="space-y-2">

          <div className="flex justify-between items-start gap-3">

            <div>

              <p className="text-xs text-slate-500 font-medium">

                {product.category?.name}

                {product.subCategory?.name &&
                  ` / ${product.subCategory.name}`}

              </p>

              <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">
                {product.name}
              </h3>

            </div>

          </div>

          {/* ENVÍO */}
          <div className="flex items-center gap-2 text-xs text-slate-500">

            <Truck className="w-3 h-3" />

            <span>
              Envios a todo el pais
            </span>

          </div>

          {/* FOOTER */}
          <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-4">

            <span className="text-xl font-bold text-slate-900">

              $
              {Number(
                product.price
              ).toLocaleString("es-AR")}

            </span>

          </div>

        </div>

      </Link>

    </motion.div>
  );
};

export default ProductCard;