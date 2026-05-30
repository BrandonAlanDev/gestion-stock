// components/product/ProductoView.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Truck, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ProductProps } from "../types";
import WhatsAppOrderForm from "../forms/WhatsAppOrder";

const WS_NUMBER = "2235644043";
const BOARD_CATEGORIES = ["tablas", "tabla", "surfboard", "surfboards"];

export default function ProductoView({ product }: ProductProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // 📐 Determinar si el producto pertenece a la categoría Tablas
  const esTabla = useMemo(() => {
    const name = (product.category?.name || "").toLowerCase().trim();
    return BOARD_CATEGORIES.some((cat) => name.includes(cat));
  }, [product.category]);

  // 📐 SEPARACIÓN DE IMÁGENES CONTROLADA ÚNICAMENTE AQUÍ:
  // Si es tabla, la posición 0 exacta es el Logo.
  const logoImage = esTabla ? product.images?.[0]?.srcImage : null;

  // Si es tabla, las fotos reales de exhibición arrancan desde el índice 1 en adelante.
  // Si NO es tabla, se usan todas las imágenes (desde el índice 0).
  const productImages = useMemo(() => {
    if (!product.images) return [];
    return esTabla ? product.images.slice(1) : product.images;
  }, [product.images, esTabla]);

  // Estado para la imagen grande seleccionada (va a tomar el índice 0 de las fotos reales, o sea, la foto 1 original)
  const [selectedImage, setSelectedImage] = useState(
    productImages[0]?.srcImage || "/images/placeholder.avif"
  );

  // Sincroniza la galería principal por si cambia el producto en caliente
  useEffect(() => {
    if (productImages[0]?.srcImage) {
      setSelectedImage(productImages[0].srcImage);
    } else {
      setSelectedImage("/images/placeholder.avif");
    }
  }, [productImages]);

  // Procesar Talles
  const sizes = useMemo(() => {
    const map = new Map();
    product.variants?.forEach((variant: any) => {
      if (variant.size) {
        const key = variant.size.id;
        if (!map.has(key)) {
          map.set(key, { id: variant.size.id, name: variant.size.value, stock: variant.stock });
        } else {
          map.get(key).stock += variant.stock;
        }
      } else if (variant.attributes?.customSize) {
        const key = variant.id;
        map.set(key, { id: key, name: variant.attributes.customSize, stock: variant.stock });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Procesar Colores
  const colors = useMemo(() => {
    const map = new Map();
    product.variants?.forEach((variant: any) => {
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

  const handleWhatsApp = () => {
    if (esTabla) {
      setShowOrderForm(true);
      return;
    }

    const lines = [
      `Hola! Me interesa este producto 👋`,
      ``,
      `*${product.name}*`,
      `Precio: $${Number(product.price).toLocaleString("es-AR")}`,
      product.category?.name ? `Categoría: ${product.category.name}` : null,
      selectedSize ? `Talle: ${selectedSize}` : null,
      selectedColor ? `Color: ${selectedColor}` : null,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 text-gray-900 selection:bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* BOTÓN VOLVER ATRÁS */}
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={14} className="transform group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-12 lg:gap-20 items-start">

          {/* BLOQUE IZQUIERDO: GALERÍA DE FOTOS REALES */}
          <div className="flex flex-col-reverse md:flex-row gap-6">
            {productImages.length > 1 && (
              <div className="flex md:flex-col gap-3 flex-shrink-0">
                {productImages.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.srcImage)}
                    className={`w-16 h-20 overflow-hidden bg-gray-50/50 rounded-md transition-all border ${
                      selectedImage === img.srcImage
                        ? "border-black opacity-100"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img.srcImage} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-50/40 rounded-xl p-8 flex items-center justify-center min-h-[450px] md:min-h-[650px]">
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

            {/* ENCABEZADO */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
                {product.category?.name}
                {product.subCategory?.name && ` / ${product.subCategory.name}`}
              </p>

              {/* LOGO CENTRADO (Extraído del índice 0 original) */}
              {esTabla && logoImage && (
                <div className="w-full flex justify-center mb-4 select-none">
                  <div className="w-full max-w-[140px] h-auto">
                    <img
                      src={logoImage}
                      alt={`Logo de ${product.name}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 capitalize text-center lg:text-left">
                {product.name.toLowerCase()}
              </h1>
            </div>

            <div className="border-b border-gray-100 pb-6 text-center lg:text-left">
              <p className="text-2xl font-light text-gray-800">
                $ {Number(product.price).toLocaleString("es-AR")}
              </p>
            </div>

            {/* COLOR */}
            {hasColors && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Color</h3>
                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                  {colors.map((color: any) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        selectedColor === color.name
                          ? "ring-2 ring-black ring-offset-2 scale-105"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color.hex || "#000" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* MEDIDAS */}
            {hasSizes && (
              <div className="space-y-3 text-center lg:text-left">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Medidas disponibles
                </h3>
                <div className="space-y-1">
                  {sizes.map((size: any) => (
                    <p key={size.id} className="text-sm text-gray-600 font-light">
                      {size.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* LOGÍSTICA */}
            <div className="space-y-3 text-xs text-gray-500 border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <p>Envíos y logística a coordinar para todo el país.</p>
              </div>
            </div>

            {/* ACCIÓN PRINCIPAL */}
            <button
              onClick={handleWhatsApp}
              className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-lg text-xs font-medium uppercase tracking-widest transition-colors"
            >
              {esTabla ? "Consultar con el vendedor" : "Consultar por WhatsApp"}
            </button>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="mt-24 border-t border-gray-100 pt-16 max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Product Overview
          </h2>
          <div className="text-gray-600 font-light leading-relaxed space-y-4 text-base">
            <p className="whitespace-pre-line">
              {hasDescription ? product.description : "No description available for this model."}
            </p>
          </div>
        </div>

      </div>

      {/* MODAL WHATSAPP */}
      {showOrderForm && esTabla && (
        <WhatsAppOrderForm product={product} onClose={() => setShowOrderForm(false)} />
      )}
    </div>
  );
}