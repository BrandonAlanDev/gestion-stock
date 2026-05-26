"use client";

import { useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Star, Truck, ChevronDown, ShoppingCart, CreditCard } from "lucide-react";

import { products } from "@/components/catalogo/data";
import { useCart } from "@/context/CartContext";

export default function ProductoPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  // =========================================
  // GET PRODUCTO
  // =========================================
  const product = useMemo(() => {
    // FUTURA SERVER ACTION / API
    // const product = await getProducto(params.id)

    // TEMPORAL
    return products.find((p) => p.id === Number(id));
  }, [id]);

  if (!product) {
    notFound();
  }
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | boolean>(false);
  const [selectedImage, setSelectedImage] = useState(product.image?.[0]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const hasDescription = product.description && product.description.trim() !== "";

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-black/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
          
          <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr_450px] xl:grid-cols-[120px_1fr_450px]">
            
            {/* MINIATURAS (DESKTOP) */}
            <div className="hidden lg:flex flex-col gap-3 p-6 pr-0">
              {product.image?.map((img, index) => (
                <button
                  key={index}
                  onMouseEnter={() => setSelectedImage(img)}
                  onClick={() => setSelectedImage(img)}
                  className={`relative rounded-xl overflow-hidden aspect-square bg-gray-50 transition-all duration-200 ${
                    selectedImage === img
                      ? "ring-2 ring-cyan-600 shadow-md scale-105 z-10"
                      : "ring-1 ring-gray-200 hover:ring-cyan-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} - vista ${index + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>

            {/* IMAGEN PRINCIPAL */}
            <div className="p-6 lg:p-10 flex flex-col items-center justify-center ">
              <div className="w-full max-w-[600px] relative aspect-square md:aspect-auto md:min-h-[500px] flex items-center justify-center">
                <img
                  src={selectedImage??"/images/placeholder.avif"}
                  alt={product.title}
                  className="w-full max-h-[600px] object-contain drop-shadow-sm transition-all duration-300 rounded-2xl ring-2 ring-cyan-600"
                />
              </div>

              {/* MOBILE THUMBS */}
              <div className="flex gap-3 mt-6 lg:hidden overflow-x-auto w-full pb-4 snap-x scrollbar-hide">
                {product.image?.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 relative rounded-xl overflow-hidden w-20 h-20  transition-all snap-center ${
                      selectedImage === img
                        ? "ring-2 ring-cyan-600 shadow-sm"
                        : "ring-1 ring-gray-200 opacity-70"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply p-1"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO LATERAL (CHECKOUT AREA) */}
            <div className="p-6 lg:p-10 bg-white lg:border-l border-gray-100 flex flex-col h-full">
              
              {/* BADGES & RATING */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {product.isNew && (
                    <span className="bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-md text-xs tracking-wide">
                      NUEVO
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md text-xs">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                  </div>
                </div>
              </div>

              {/* TÍTULO */}
              <h1 className="text-2xl font-semibold text-gray-900 leading-snug mb-4">
                {product.title}
              </h1>

              {/* PRECIO */}
              <div className="mb-8">
                <h2 className="text-4xl font-semibold text-gray-900 tracking-tight">
                  $ {product.price.toLocaleString("es-AR")}
                </h2>
              </div>

                {/* TALLES */}
                {hasSizes && (
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                    <h3 className="font-medium text-gray-900">
                        Talle
                    </h3>

                    <a
                        href="#"
                        className="text-sm text-cyan-600 hover:underline"
                    >
                        Guía de talles
                    </a>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => {
                        const disabled = size.stock <= 0;
                        const selected = selectedSize === size.name;

                        return (
                        <button
                            key={size.name}
                            disabled={disabled}
                            onClick={() => {
                            setSelectedSize(size.name);
                            setSizeError(false);
                            }}
                            className={`
                            min-w-[3rem] px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2
                            
                            ${
                                disabled
                                ? "bg-gray-50 text-gray-400 border-transparent cursor-not-allowed opacity-60"
                                : selected
                                ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                                : "bg-white border-gray-200 text-gray-700 hover:border-cyan-600 hover:text-cyan-700"
                            }
                            `}
                        >
                            {size.name}
                        </button>
                        );
                    })}
                    </div>

                    {sizeError && (
                    <p className="text-red-500 text-sm mt-3">
                        Seleccioná un talle para continuar.
                    </p>
                    )}
                </div>
                )}

              {/* ENVÍO */}
            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 mb-8">
            <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-green-600 mt-0.5" />

                <div>
                <p className="text-green-700 font-semibold text-sm">
                    {product.shipping?.toLowerCase() === "gratis"
                    ? "Envío gratis"
                    : product.shipping}
                </p>
                </div>
            </div>
            </div>

              {/* ESPACIADOR FLEXIBLE PARA EMPUJAR BOTONES AL FONDO (Opcional) */}
              <div className="flex-grow"></div>

              {/* BOTONES DE ACCIÓN */}
              <div className="space-y-3 mt-4">
                <button
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
                >
                  <CreditCard className="w-5 h-5" />
                  Comprar ahora
                </button>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* SECCIÓN DE DESCRIPCIÓN */}
        <div className="mt-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Acerca de este producto
          </h2>

          <div className="relative max-w-4xl">
            <div
              className={`
                overflow-hidden transition-all duration-700 ease-in-out text-gray-600 leading-relaxed text-[15px] md:text-base
                ${showFullDescription ? "max-h-[3000px]" : "max-h-[160px]"}
              `}
            >
              <p className="whitespace-pre-line">
                {hasDescription ? product.description : "Este producto no tiene una descripción detallada en este momento."}
              </p>
            </div>

            {/* DEGRADADO PARA OCULTAR TEXTO */}
            {!showFullDescription && hasDescription && product.description.length > 250 && (
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>

          {/* BOTÓN VER MÁS */}
          {hasDescription && product.description.length > 250 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-6 flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors rounded-lg px-4 py-2 hover:bg-cyan-50 -ml-4"
            >
              {showFullDescription ? "Ocultar descripción" : "Ver descripción completa"}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showFullDescription ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}