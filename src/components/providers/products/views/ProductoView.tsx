"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ProductProps } from "../types";
import SelectorProducto from "@/components/tienda/producto/SelectorProducto";
import { renderMarkdown } from "@/lib/utilidades/markdown";

export default function ProductoView({ product }: ProductProps) {
  const router = useRouter();

  const productImages = useMemo(() => product.images ?? [], [product.images]);

  const [selectedImage, setSelectedImage] = useState(productImages[0]?.srcImage || "/images/placeholder.avif");

  useEffect(() => {
    if (productImages[0]?.srcImage) {
      setSelectedImage(productImages[0].srcImage);
    } else {
      setSelectedImage("/images/placeholder.avif");
    }
  }, [productImages]);

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
                      boxShadow: selectedImage === img.srcImage ? "0 0 0 1px var(--color-primario)" : "none",
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

          {/* BLOQUE DERECHO: SELECCIÓN Y COMPRA */}
          <SelectorProducto product={product} />
        </div>

        <div className="mt-24 border-t border-[var(--color-secundario)] pt-16 max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--color-primario)" }}>
            Resumen del producto
          </h2>
          <div
            className="text-[var(--texto-sobre-fondo)] opacity-70 font-light leading-relaxed space-y-4 text-base prose prose-sm"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(product.description) || "No hay descripción disponible para este modelo.",
            }}
          />
        </div>

      </div>
    </div>
  );
}
