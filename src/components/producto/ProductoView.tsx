"use client";

import { useMemo, useState } from "react";

import {
  Star,
  Truck,
  ChevronDown,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

interface Props {
  product: any;
}

export default function ProductoView({ product }: Props) {
  const { addToCart } = useCart();

  // =========================================
  // STATES
  // =========================================

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const [sizeError, setSizeError] = useState(false);

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.srcImage || "/images/placeholder.avif"
  );

  const [showFullDescription, setShowFullDescription] = useState(false);

  // =========================================
  // VARIANTS
  // =========================================

  const sizes = useMemo(() => {
    const map = new Map();

    product.variants?.forEach((variant: any) => {
      if (!variant.size) return;

      const key = variant.size.id;

      if (!map.has(key)) {
        map.set(key, {
          id: variant.size.id,
          name: variant.size.value,
          stock: variant.stock,
        });
      } else {
        map.get(key).stock += variant.stock;
      }
    });

    return Array.from(map.values());
  }, [product]);

  const colors = useMemo(() => {
    const map = new Map();

    product.variants?.forEach((variant: any) => {
      if (!variant.color) return;

      const key = variant.color.id;

      if (!map.has(key)) {
        map.set(key, {
          id: variant.color.id,
          name: variant.color.name,
          hex: variant.color.hex,
        });
      }
    });

    return Array.from(map.values());
  }, [product]);

  // =========================================
  // HELPERS
  // =========================================

  const hasSizes = sizes.length > 0;

  const hasColors = colors.length > 0;

  const hasDescription =
    product.description &&
    product.description.trim() !== "";

  // =========================================
  // ADD TO CART
  // =========================================

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      return;
    }

    addToCart({
      ...product,
      selectedSize,
      selectedColor,
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* CONTENEDOR PRINCIPAL */}
        <div className="bg-black/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">

          <div className="grid grid-cols-1 lg:grid-cols-[100px_1fr_450px] xl:grid-cols-[120px_1fr_450px]">

            {/* MINIATURAS DESKTOP */}
            <div className="hidden lg:flex flex-col gap-3 p-6 pr-0">
              {product.images?.map((img: any) => (
                <button
                  key={img.id}
                  onMouseEnter={() => setSelectedImage(img.srcImage)}
                  onClick={() => setSelectedImage(img.srcImage)}
                  draggable={false}
                  className={`
                    relative rounded-xl overflow-hidden aspect-square bg-gray-50 transition-all duration-200
                    ${
                      selectedImage === img.srcImage
                        ? "ring-2 ring-cyan-600 shadow-md scale-105 z-10"
                        : "ring-1 ring-gray-200 hover:ring-cyan-400 opacity-80 hover:opacity-100"
                    }
                  `}
                >
                  <img
                    src={img.srcImage}
                    alt={img.alt || product.name}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>

            {/* IMAGEN PRINCIPAL */}
            <div className="p-6 lg:p-10 flex flex-col items-center justify-center">
              <div className="w-full max-w-[600px] relative aspect-square md:aspect-auto md:min-h-[500px] flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full max-h-[600px] object-contain transition-all duration-300 rounded-2xl ring-2 ring-cyan-600 bg-white"
                />
              </div>

              {/* MOBILE THUMBS */}
              <div className="flex gap-3 mt-6 lg:hidden overflow-x-auto w-full pb-4 snap-x scrollbar-hide">
                {product.images?.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.srcImage)}
                    className={`
                      flex-shrink-0 relative rounded-xl overflow-hidden w-20 h-20 transition-all snap-center
                      ${
                        selectedImage === img.srcImage
                          ? "ring-2 ring-cyan-600 shadow-sm"
                          : "ring-1 ring-gray-200 opacity-70"
                      }
                    `}
                  >
                    <img
                      src={img.srcImage}
                      alt={img.alt || product.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO */}
            <div className="p-6 lg:p-10 bg-white lg:border-l border-gray-100 flex flex-col h-full">

              {/* BADGES */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium">

                  <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md text-xs">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>5.0</span>
                  </div>

                </div>
              </div>

              {/* TÍTULO */}
              <h1 className="text-2xl font-semibold text-gray-900 leading-snug mb-4">
                {product.name}
              </h1>

              {/* CATEGORÍA */}
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {product.category?.name}

                  {product.subCategory?.name &&
                    ` / ${product.subCategory.name}`}
                </p>
              </div>

              {/* PRECIO */}
              <div className="mb-8">
                <h2 className="text-4xl font-semibold text-gray-900 tracking-tight">
                  $ {Number(product.price).toLocaleString("es-AR")}
                </h2>
              </div>

              {/* COLORES */}
              {hasColors && (
                <div className="mb-8">

                  <div className="flex justify-between items-end mb-3">
                    <h3 className="font-medium text-gray-900">
                      Color
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">

                    {colors.map((color: any) => {
                      const selected =
                        selectedColor === color.name;

                      return (
                        <button
                          key={color.id}
                          onClick={() =>
                            setSelectedColor(color.name)
                          }
                          title={color.name}
                          className={`
                            w-10 h-10 rounded-full border-2 transition-all
                            ${
                              selected
                                ? "border-cyan-600 scale-110"
                                : "border-gray-300"
                            }
                          `}
                          style={{
                            backgroundColor:
                              color.hex || "#000",
                          }}
                        />
                      );
                    })}

                  </div>

                </div>
              )}

              {/* TALLES */}
              {hasSizes && (
                <div className="mb-8">

                  <div className="flex justify-between items-end mb-3">

                    <h3 className="font-medium text-gray-900">
                      Talle
                    </h3>

                    <button
                      className="text-sm text-cyan-600 hover:underline"
                    >
                      Guía de talles
                    </button>

                  </div>

                  <div className="flex flex-wrap gap-2.5">

                    {sizes.map((size: any) => {
                      const disabled = size.stock <= 0;

                      const selected =
                        selectedSize === size.name;

                      return (
                        <button
                          key={size.id}
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

              {/* STOCK */}
              <div className="mb-6">
                <p className="text-sm text-green-600 font-medium">
                  Stock disponible
                </p>
              </div>

              {/* ENVÍO */}
              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 mb-8">

                <div className="flex items-start gap-3">

                  <Truck className="w-5 h-5 text-green-600 mt-0.5" />

                  <div>
                    <p className="text-green-700 font-semibold text-sm">
                      Envío gratis
                    </p>
                  </div>

                </div>

              </div>

              <div className="flex-grow"></div>

              {/* BOTONES */}
              <div className="space-y-3 mt-4">

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-cyan-600/20 active:scale-[0.98]"
                >
                  <CreditCard className="w-5 h-5" />
                  Comprar ahora
                </button>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>

              </div>

            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="mt-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Acerca de este producto
          </h2>

          <div className="relative max-w-4xl">

            <div
              className={`
                overflow-hidden transition-all duration-700 ease-in-out text-gray-600 leading-relaxed text-[15px] md:text-base
                ${
                  showFullDescription
                    ? "max-h-[3000px]"
                    : "max-h-[160px]"
                }
              `}
            >
              <p className="whitespace-pre-line">
                {hasDescription
                  ? product.description
                  : "Este producto no tiene descripción."}
              </p>
            </div>

            {!showFullDescription &&
              hasDescription &&
              product.description.length > 250 && (
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
              )}

          </div>

          {/* VER MÁS */}
          {hasDescription &&
            product.description.length > 250 && (
              <button
                onClick={() =>
                  setShowFullDescription(
                    !showFullDescription
                  )
                }
                className="mt-6 flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors rounded-lg px-4 py-2 hover:bg-cyan-50 -ml-4"
              >
                {showFullDescription
                  ? "Ocultar descripción"
                  : "Ver descripción completa"}

                <ChevronDown
                  className={`
                    w-4 h-4 transition-transform duration-300
                    ${
                      showFullDescription
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>
            )}

        </div>

      </div>
    </div>
  );
}