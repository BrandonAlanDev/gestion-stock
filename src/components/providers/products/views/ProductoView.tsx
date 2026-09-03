"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ProductProps } from "../types";
import ProductAction from "@/components/ui/ProductAction";

const BOARD_CATEGORIES = ["tablas", "tabla", "surfboard", "surfboards"];

export default function ProductoView({ product }: ProductProps) {
  const router = useRouter();
  
  const [selectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // 📐 Determinar si el producto pertenece a la categoría Tablas
  const esTabla = useMemo(() => {
    const name = (product.category?.name || "").toLowerCase().trim();
    return BOARD_CATEGORIES.some((cat) => name.includes(cat));
  }, [product.category]);

  const logoImage = esTabla ? product.images?.[0]?.srcImage : null;

  const productImages = useMemo(() => {
    if (!product.images) return [];
    return esTabla ? product.images.slice(1) : product.images;
  }, [product.images, esTabla]);

  const [selectedImage, setSelectedImage] = useState(
    productImages[0]?.srcImage || "/images/placeholder.avif"
  );

  useEffect(() => {
    if (productImages[0]?.srcImage) {
      setSelectedImage(productImages[0].srcImage);
    } else {
      setSelectedImage("/images/placeholder.avif");
    }
  }, [productImages]);

  // Procesar Talles
  const sizes = useMemo(() => {
    const map = new Map<string, { id: string; name: string; stock: number }>();
    product.variants.forEach((variant) => {
      if (variant.size) {
        const key = variant.size.id;
        const talleExistente = map.get(key);
        if (talleExistente) {
          talleExistente.stock += variant.stock;
        } else {
          map.set(key, { id: variant.size.id, name: variant.size.value, stock: variant.stock });
        }
      } else if (typeof variant.attributes?.customSize === "string") {
        const key = variant.id;
        map.set(key, { id: key, name: variant.attributes.customSize, stock: variant.stock });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Procesar Colores
  const colors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string | null }>();
    product.variants.forEach((variant) => {
      if (!variant.color) return;
      const key = variant.color.id;
      if (!map.has(key)) {
        map.set(key, { id: variant.color.id, name: variant.color.name, hex: variant.color.hex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;
  const hasDescription = product.description && product.description.trim() !== "";

  return (
    <div className="bg-[var(--color-fondo-sitio)] min-h-screen pt-32 pb-24 text-[var(--texto-sobre-fondo)] selection:bg-[var(--color-secundario)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* BOTÓN VOLVER ATRÁS */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-75 transition-colors mb-8"
          style={{ color: "var(--color-primario)" }}
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-12 lg:gap-20 items-start">

          {/* BLOQUE IZQUIERDO: GALERÍA */}
          <div className="flex flex-col-reverse md:flex-row gap-6">
            {productImages.length > 1 && (
              <div className="flex md:flex-col gap-3 flex-shrink-0">
                {productImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.srcImage)}
                    className={`w-16 h-20 overflow-hidden bg-[var(--superficie-imagen)] rounded-md transition-all border ${selectedImage === img.srcImage
                      ? "opacity-100 ring-1"
                      : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                    style={{ 
                      borderColor: selectedImage === img.srcImage ? "var(--color-primario)" : "transparent",
                      boxShadow: selectedImage === img.srcImage ? "0 0 0 1px var(--color-primario)" : "none"
                    }}
                  >
                    <img src={img.srcImage} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-[var(--superficie-imagen)] rounded-xl p-8 flex items-center justify-center min-h-[450px] md:min-h-[650px]">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={selectedImage}
                alt={product.name}
                className="max-h-[650px] w-auto object-contain select-none mix-blend-multiply"
              />
            </div>
          </div>

          {/* BLOQUE DERECHO: DETALLES */}
          <div className="flex flex-col space-y-8 lg:sticky lg:top-32">

            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primario)" }}>
                {product.category?.name}
                {product.subCategory?.name && ` / ${product.subCategory.name}`}
              </p>

              {esTabla && logoImage && (
                <div className="w-full flex justify-center mb-4 select-none">
                  <div className="w-full max-w-[140px] h-auto">
                    <img
                      src={logoImage}
                      alt={`Logo de ${product.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-[var(--texto-sobre-fondo)] capitalize text-center lg:text-left">
                {product.name.toLowerCase()}
              </h1>
            </div>

            <div className="border-b border-[var(--color-secundario)] pb-6 text-center lg:text-left">
              {esTabla ? (
                <p className="text-2xl font-semibold" style={{ color: "var(--color-primario)" }}>
                  USD {Number(product.price).toLocaleString("es-AR")} - {Number(product.maxPrice).toLocaleString("es-AR")}
                </p>
              ) : (
                <p className="text-2xl font-bold text-[var(--texto-sobre-fondo)]">
                  $ {Number(product.price).toLocaleString("es-AR")}
                </p>
              )}
            </div>

            {hasColors && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--texto-sobre-fondo)] opacity-60">Color</h3>
                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border transition-all ${selectedColor === color.name
                        ? "ring-2 ring-offset-2 scale-105"
                        : "border-[var(--color-secundario)]"
                      }`}
                      style={{ 
                        backgroundColor: color.hex || "#000",
                        borderColor: selectedColor === color.name ? "var(--color-primario)" : "#e5e7eb",
                        boxShadow: selectedColor === color.name ? "0 0 0 2px var(--color-primario)" : "none"
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasSizes && (
              <div className="space-y-3 text-center lg:text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--texto-sobre-fondo)] opacity-60">
                  Medidas disponibles
                </h3>
                <div className="space-y-1">
                  {sizes.map((size) => (
                    <p key={size.id} className="text-sm text-[var(--texto-sobre-fondo)] opacity-70 font-light">
                      {size.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs text-[var(--texto-sobre-fondo)] opacity-70 border-t border-b border-[var(--color-secundario)] py-4">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Truck className="w-3.5 h-3.5" style={{ color: "var(--color-primario)" }} />
                <p>Envíos y logística a coordinar para todo el país.</p>
              </div>
            </div>

            {/* INTEGRACIÓN DEL COMPONENTE DE ACCIÓN */}
            <ProductAction 
              product={product} 
              size={selectedSize} 
              color={selectedColor} 
              esTabla={esTabla} 
            />

          </div>
        </div>

        <div className="mt-24 border-t border-[var(--color-secundario)] pt-16 max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--color-primario)" }}>
            Product Overview
          </h2>
          <div className="text-[var(--texto-sobre-fondo)] opacity-70 font-light leading-relaxed space-y-4 text-base">
            <p className="whitespace-pre-line">
              {hasDescription ? product.description : "No description available for this model."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
