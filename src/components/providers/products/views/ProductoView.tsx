"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ProductProps } from "@/components/providers/products/types";
import SelectorProducto from "@/components/tienda/producto/SelectorProducto";
import { renderMarkdown } from "@/lib/utilidades/markdown";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";

export default function ProductoView({ product }: ProductProps) {
  const router = useRouter();
  const productImages = useMemo(() => product.images ?? [], [product.images]);

  const [selectedImage, setSelectedImage] = useState(productImages[0]?.srcImage || "/images/placeholder.svg");
  const solicitudImagen = useRef(0);

  useEffect(() => {
    solicitudImagen.current += 1;
    if (productImages[0]?.srcImage) {
      setSelectedImage(productImages[0].srcImage);
    } else {
      setSelectedImage("/images/placeholder.svg");
    }
    return () => { solicitudImagen.current += 1; };
  }, [productImages]);

  async function seleccionarImagen(srcImage: string) {
    const solicitud = ++solicitudImagen.current;
    if (srcImage === selectedImage) return;

    const imagen = new window.Image();
    imagen.src = obtenerUrlImagenOptimizada(srcImage, 1200) || srcImage;
    try {
      await imagen.decode();
      if (solicitud === solicitudImagen.current) setSelectedImage(srcImage);
    } catch {
      // Se conserva la imagen visible si la nueva no se puede cargar.
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo-sitio)] pb-20 pt-24 text-[var(--texto-sobre-fondo)] selection:bg-[var(--color-secundario)] sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">

        {/* BOTÓN VOLVER ATRÁS */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-75 transition-colors mb-8"
          style={{ color: "var(--color-primario)" }}
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:gap-12">

          {/* BLOQUE IZQUIERDO: GALERÍA */}
          <div className="flex min-w-0 flex-col-reverse gap-3 sm:gap-5 md:flex-row">
            {productImages.length > 1 && (
              <div className="flex shrink-0 gap-3 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
                {productImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => void seleccionarImagen(img.srcImage)}
                    className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-md border bg-[var(--superficie-imagen)] transition-all ${selectedImage === img.srcImage
                      ? "opacity-100 ring-1"
                      : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: selectedImage === img.srcImage ? "var(--color-primario)" : "transparent",
                      boxShadow: selectedImage === img.srcImage ? "0 0 0 1px var(--color-primario)" : "none",
                    }}
                  >
                    <Image src={obtenerUrlImagenOptimizada(img.srcImage, 200) || img.srcImage} alt="" fill sizes="64px" unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex aspect-[4/5] w-full items-center justify-center rounded-xl bg-[var(--superficie-imagen)] p-4 sm:p-8">
              <Image
                src={obtenerUrlImagenOptimizada(selectedImage, 1200) || selectedImage}
                loading="eager"
                alt={product.name}
                width={1200}
                height={1200}
                unoptimized
                className="h-auto max-h-[680px] w-auto max-w-full select-none object-contain"
              />
            </div>
          </div>

          {/* BLOQUE DERECHO: SELECCIÓN Y COMPRA */}
          <div>
            <SelectorProducto product={product} />
          </div>
        </div>

        <div className="mt-16 max-w-3xl border-t border-current/15 pt-10">
          <h2 className="mb-5 text-xl font-semibold">
            Descripción
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
