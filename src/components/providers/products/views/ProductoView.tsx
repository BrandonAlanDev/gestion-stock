"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ProductProps } from "../types";
import ProductAction from "@/components/ui/ProductAction";
import { construirModeloVisual, varianteCompleta, precioDeVariante, type ModeloVisual } from "@/lib/productos/opciones-visuales";
import { renderMarkdown } from "@/lib/utilidades/markdown";

const BOARD_CATEGORIES = ["tablas", "tabla", "surfboard", "surfboards"];

export default function ProductoView({ product }: ProductProps) {
  const router = useRouter();

  const [seleccion, setSeleccion] = useState<Record<string, string>>({});

  const esTabla = useMemo(() => {
    const name = (product.category?.name || "").toLowerCase().trim();
    return BOARD_CATEGORIES.some((cat) => name.includes(cat));
  }, [product.category]);

  const logoImage = esTabla ? product.images?.[0]?.srcImage : null;

  const productImages = useMemo(() => {
    if (!product.images) return [];
    return esTabla ? product.images.slice(1) : product.images;
  }, [product.images, esTabla]);

  const [selectedImage, setSelectedImage] = useState(productImages[0]?.srcImage || "/images/placeholder.avif");

  useEffect(() => {
    if (productImages[0]?.srcImage) {
      setSelectedImage(productImages[0].srcImage);
    } else {
      setSelectedImage("/images/placeholder.avif");
    }
  }, [productImages]);

  const modelo = useMemo<ModeloVisual>(() => construirModeloVisual(product), [product]);

  const generalPrice = Number(product.price ?? 0);
  const precioAnterior = product.maxPrice != null ? Number(product.maxPrice) : null;
  const varianteElegida = useMemo(() => varianteCompleta(modelo, seleccion), [modelo, seleccion]);
  const precioMostrado = varianteElegida ? precioDeVariante(generalPrice, varianteElegida) : generalPrice;
  const conVariantes = modelo.grupos.length > 0;
  const stockElegido = varianteElegida?.stock ?? modelo.variantes.reduce((acc, v) => acc + v.stock, 0);

  const hayPrecioAnterior = !esTabla && precioAnterior != null && precioAnterior > precioMostrado;

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
                    <img src={logoImage} alt={`Logo de ${product.name}`} className="w-full h-full object-contain" />
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
                <span>
                  {hayPrecioAnterior && (
                    <span className="mr-2 text-lg text-[var(--texto-sobre-fondo)] opacity-40 line-through">
                      $ {precioAnterior.toLocaleString("es-AR")}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-[var(--texto-sobre-fondo)]">
                    $ {precioMostrado.toLocaleString("es-AR")}
                  </span>
                </span>
              )}
            </div>

            {modelo.grupos.map((grupo) => {
              const valorSeleccionado = seleccion[grupo.name];
              return (
                <div key={grupo.name} className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--texto-sobre-fondo)] opacity-60">
                    {grupo.name}
                  </h3>
                  <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                    {grupo.values.map((valor) => (
                      <button
                        key={valor.id}
                        onClick={() =>
                          setSeleccion((prev) => ({
                            ...prev,
                            [grupo.name]: prev[grupo.name] === valor.value ? "" : valor.value,
                          }))
                        }
                        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                          valorSeleccionado === valor.value
                            ? "border-[var(--color-primario)] text-[var(--color-primario)]"
                            : "border-[var(--color-secundario)] text-[var(--texto-sobre-fondo)] opacity-70"
                        }`}
                      >
                        {valor.value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {conVariantes && (
              <div className="text-xs text-[var(--texto-sobre-fondo)] opacity-60">
                {stockElegido > 0 ? `${stockElegido} unidades disponibles` : "Sin stock en esta combinación"}
              </div>
            )}

            <div className="space-y-3 text-xs text-[var(--texto-sobre-fondo)] opacity-70 border-t border-b border-[var(--color-secundario)] py-4">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Truck className="w-3.5 h-3.5" style={{ color: "var(--color-primario)" }} />
                <p>Envíos y logística a coordinar para todo el país.</p>
              </div>
            </div>

            <ProductAction
              product={product}
              size={seleccion["Talle"] ?? null}
              color={seleccion["Color"] ?? null}
              esTabla={esTabla}
            />
          </div>
        </div>

        <div className="mt-24 border-t border-[var(--color-secundario)] pt-16 max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--color-primario)" }}>
            Product Overview
          </h2>
          <div
            className="text-[var(--texto-sobre-fondo)] opacity-70 font-light leading-relaxed space-y-4 text-base prose prose-sm"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(product.description) || "No description available for this model.",
            }}
          />
        </div>

      </div>
    </div>
  );
}
