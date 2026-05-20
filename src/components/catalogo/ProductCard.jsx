"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Star, Truck, Heart } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

const ProductCard = ({ product, addToCart }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (
      !isHovering ||
      !product.image ||
      product.image.length <= 1
    ) {
      setCurrentImage(0);
      setFade(true);
      return;
    }

    const interval = setInterval(() => {
      // Fade out
      setFade(false);

      // Espera a que termine el fade
      setTimeout(() => {
        setCurrentImage((prev) =>
          prev === product.image.length - 1 ? 0 : prev + 1
        );

        // Fade in
        setFade(true);
      }, 300); // duración del fade out
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovering, product.image]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="select-none group bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden"
    ><Link href={`/productos/${product.id}`}>
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
            Nuevo
          </span>
        )}
      </div>

      <button className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-slate-400 hover:text-red-500">
        <Heart className="w-4 h-4" />
      </button>

      {/* Image Container */}
      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-50 mb-4 relative">
        <Image
          src={
            product.image?.[currentImage]
              ? product.image[currentImage]
              : "/images/placeholder.avif"
          }
          alt={product.title}
          width={300}
          height={300}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500  ${fade ? "opacity-100" : "opacity-0" }`}
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-slate-500 font-medium">
              {product.category}
            </p>

            <h3 className="font-bold text-slate-900 text-lg leading-tight">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md">
            <Star className="w-3 h-3 fill-amber-400" />
            {product.rating}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Truck className="w-3 h-3" />
          <span>{product.shipping}</span>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-gray-50 mt-4">
          <span className="text-xl font-bold text-slate-900">
            ${product.price}
          </span>
        </div>
      </div>
    </Link></motion.div>
  );
};

export default ProductCard;