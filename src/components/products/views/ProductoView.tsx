// components/product/ProductoView.tsx
"use client";

import { useMemo, useState } from "react";
import { Truck, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ProductProps } from "../types";
import WhatsAppOrderForm from "../forms/WhatsAppOrder";

const WS_NUMBER = "2235644043";
const BOARD_CATEGORIES = ["tablas", "tabla", "surfboard", "surfboards"];

export default function ProductoView({ product }: ProductProps) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.srcImage || "/images/placeholder.avif"
  );

  // Determinar categoría
  const esTabla = useMemo(() => {
    const name = (product.category?.name || "").toLowerCase().trim();
    return BOARD_CATEGORIES.some((cat) => name.includes(cat));
  }, [product.category]);

  // Procesar Talles
  const sizes = useMemo(() => {
    const map = new Map();
    product.variants?.forEach((variant: any) => {
      if (!variant.size) return;
      const key = variant.size.id;
      if (!map.has(key)) {
        map.set(key, { id: variant.size.id, name: variant.size.value, stock: variant.stock });
      } else {
        map.get(key).stock += variant.stock;
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
      selectedSize  ? `Talle: ${selectedSize}`   : null,
      selectedColor ? `Color: ${selectedColor}` : null,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-24 text-gray-900 selection:bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_500px] gap-12 lg:gap-20 items-start">
          
          {/* BLOQUE IZQUIERDO: IMÁGENES */}
          <div className="flex flex-col-reverse md:flex-row gap-6">
            {product.images && product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 flex-shrink-0">
                {product.images.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.srcImage)}
                    className={`w-16 h-20 overflow-hidden bg-gray-50/50 rounded-md transition-all border ${
                      selectedImage === img.srcImage ? "border-black opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img.srcImage} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="w-full bg-gray-50/40 rounded-xl p-8 flex items-center justify-center min-h-[450px] md:min-h-[650px]">
              <motion.img
                key={selectedImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                src={selectedImage} alt={product.name}
                className="max-h-[650px] w-auto object-contain select-none mix-blend-multiply"
              />
            </div>
          </div>

          {/* BLOQUE DERECHO: DETALLES */}
          <div className="flex flex-col space-y-8 lg:sticky lg:top-32">
            
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
                {product.category?.name} {product.subCategory?.name && `/ ${product.subCategory.name}`}
              </p>
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 capitalize">
                {product.name.toLowerCase()}
              </h1>
            </div>

            <div className="border-b border-gray-100 pb-6">
              <p className="text-2xl font-light text-gray-800">
                $ {Number(product.price).toLocaleString("es-AR")}
              </p>
            </div>

            {hasColors && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Color</h3>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color: any) => (
                    <button
                      key={color.id} onClick={() => setSelectedColor(color.name)} title={color.name}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        selectedColor === color.name ? "ring-2 ring-black ring-offset-2 scale-105" : "border-gray-200"
                      }`}
                      style={{ backgroundColor: color.hex || "#000" }}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasSizes && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Dimensiones de Stock</h3>
                  <button className="text-xs text-gray-400 hover:text-black underline flex items-center gap-1">
                    <HelpCircle size={12} /> Guía de volumen
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size: any) => {
                    const disabled = size.stock <= 0;
                    const selected = selectedSize === size.name;
                    return (
                      <button
                        key={size.id} disabled={disabled}
                        onClick={() => { setSelectedSize(size.name); setSizeError(false); }}
                        className={`py-3.5 rounded-lg text-xs font-medium transition-all border ${
                          disabled
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                            : selected
                            ? "border-black bg-black text-white font-semibold"
                            : "bg-white border-gray-200 text-gray-700 hover:border-black"
                        }`}
                      >{size.name}</button>
                    );
                  })}
                </div>
                {sizeError && <p className="text-red-500 text-xs mt-1">Por favor, seleccioná una opción.</p>}
              </div>
            )}

            <div className="space-y-3 text-xs text-gray-500 border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <p>Envíos y logística a coordinar para todo el país.</p>
              </div>
            </div>

            <button
              onClick={handleWhatsApp}
              className="w-full bg-gray-900 hover:bg-black text-white py-4.5 rounded-lg text-xs font-medium uppercase tracking-widest transition-colors shadow-xs"
            >
              {esTabla ? "Consultar con el vendedor" : "Consultar por WhatsApp"}
            </button>
          </div>
        </div>

        {/* CONTENIDO EXTRA: DESCRIPCIÓN */}
        <div className="mt-24 border-t border-gray-100 pt-16 max-w-3xl">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Descripción</h2>
          <div className="text-gray-600 font-light leading-relaxed space-y-4 text-base">
            <p className="whitespace-pre-line">
              {hasDescription ? product.description : "No description available for this model."}
            </p>
          </div>
        </div>

      </div>

      {/* RENDER MODAL CONDICIONAL */}
      {showOrderForm && esTabla && (
        <WhatsAppOrderForm product={product} onClose={() => setShowOrderForm(false)} />
      )}
    </div>
  );
}