"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Tag, ShoppingBag } from "lucide-react";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";
import { construirModeloVisual, varianteCompleta, precioDeVariante } from "@/lib/productos/opciones-visuales";

type Variant = {
  id: string;
  stock: number;
  sku: string | null;
  priceOverride?: number | string | { toString(): string } | null;
  optionValues?: Array<{ optionValue: { value: string; option: { name: string } } }>;
};
type Image = { id: string; srcImage: string; alt: string | null; order: number; garmentId?: string };
export type Garment = {
  id: string;
  name: string;
  price: string | number | { toString(): string };
  maxPrice?: string | number | { toString(): string } | null;
  description: string | null;
  opciones?: Array<{ name: string; values?: Array<{ id?: string; value: string }> }>;
  subCategory: { id?: string; name: string; active?: boolean; categoryId?: string } | null;
  images: Image[];
  variants: Variant[];
};

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ garment, onClick }: { garment: Garment; onClick: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const cover = garment.images[imgIndex]?.srcImage;
  const totalStock = garment.variants.reduce((a, v) => a + v.stock, 0);
  const price = parseFloat(String(garment.price)).toLocaleString("es-AR", {
    style: "currency", currency: "ARS", minimumFractionDigits: 0,
  });
  const modelo = construirModeloVisual(garment);
  const primerosValores = modelo.grupos.slice(0, 2).flatMap((g) => g.values.slice(0, 2));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="group bg-[var(--color-secundario)] border border-[var(--color-secundario)] rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-[var(--color-primario)]/20 hover:border-[var(--color-primario)]/40 transition-all duration-300"
    >
      {/* Imagen */}
      <div
        className="aspect-square bg-[var(--superficie-imagen)] overflow-hidden relative"
        onMouseEnter={() => garment.images.length > 1 && setImgIndex(1)}
        onMouseLeave={() => setImgIndex(0)}
      >
        {cover ? (
          <img
            src={obtenerUrlImagenOptimizada(cover, 1200) || undefined}
            alt={garment.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} className="text-[var(--texto-sobre-secundario)] opacity-40" />
          </div>
        )}

        {/* Badge sin stock */}
        {totalStock === 0 && (
          <div className="absolute top-3 left-3 bg-[var(--color-fondo-sitio)]/80 text-[var(--texto-sobre-fondo)] text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-sm">
            Sin stock
          </div>
        )}

        {/* Indicadores de imagen */}
        {garment.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {garment.images.slice(0, 4).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? "bg-[var(--color-fondo-sitio)]" : "bg-[color-mix(in_srgb,var(--color-fondo-sitio)_40%,transparent)]"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {garment.subCategory && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--texto-sobre-secundario)] opacity-60 mb-1">
            {garment.subCategory.name}
          </p>
        )}
        <h3 className="font-black text-[var(--texto-sobre-secundario)] text-base leading-tight tracking-tight line-clamp-2 mb-2">
          {garment.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-[var(--color-primario)]">{price}</span>
          {primerosValores.length > 0 && (
            <div className="flex gap-1">
              {primerosValores.map((valor, i) => (
                <span
                  key={`${valor.value}-${i}`}
                  className="px-2 py-0.5 rounded-full bg-[var(--color-fondo-sitio)]/5 border border-[var(--color-secundario)] text-[10px] font-bold text-[var(--texto-sobre-secundario)] opacity-70"
                >
                  {valor.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({ garment, onClose }: { garment: Garment; onClose: () => void }) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [seleccion, setSeleccion] = useState<Record<string, string>>({});

  const modelo = construirModeloVisual(garment);
  const totalStock = garment.variants.reduce((a, v) => a + v.stock, 0);
  const varianteElegida = varianteCompleta(modelo, seleccion);
  const generalPrice = Number(garment.price ?? 0);
  const precioMostrado = varianteElegida ? precioDeVariante(generalPrice, varianteElegida) : generalPrice;
  const precioAnterior = garment.maxPrice != null ? Number(garment.maxPrice) : null;
  const hayPrecioAnterior = precioAnterior != null && precioAnterior > precioMostrado;

  const price = precioMostrado.toLocaleString("es-AR", {
    style: "currency", currency: "ARS", minimumFractionDigits: 0,
  });

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        key="modal-content"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-[var(--color-secundario)] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">

          <div className="grid md:grid-cols-2 gap-0">

            {/* Imágenes */}
            <div className="bg-[var(--color-fondo-sitio)]/5 rounded-tl-3xl rounded-bl-3xl rounded-tr-3xl md:rounded-tr-none p-4 flex flex-col gap-3">
              {/* Imagen principal */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--superficie-imagen)] relative">
                {garment.images[selectedImg] ? (
                  <img
                    src={obtenerUrlImagenOptimizada(garment.images[selectedImg].srcImage, 1200) || undefined}
                    alt={garment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-[var(--texto-sobre-secundario)] opacity-40" strokeWidth={1} />
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[var(--color-secundario)] border border-[var(--color-secundario)] flex items-center justify-center text-[var(--texto-sobre-secundario)] opacity-70 hover:opacity-100 transition-colors md:hidden"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Thumbnails */}
              {garment.images.length > 1 && (
                <div className="flex gap-2">
                  {garment.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? "border-[var(--color-primario)]" : "border-transparent opacity-60 hover:opacity-100"}`}
                    >
                      <img src={obtenerUrlImagenOptimizada(img.srcImage, 200) || undefined} alt={img.alt || ""} loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div>
                  {garment.subCategory && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--texto-sobre-secundario)] opacity-60 mb-1">
                      {garment.subCategory.name}
                    </p>
                  )}
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[var(--texto-sobre-secundario)] leading-tight">
                    {garment.name}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="hidden md:flex w-8 h-8 rounded-full bg-[var(--color-secundario)] hover:opacity-90 items-center justify-center text-[var(--texto-sobre-secundario)] opacity-70 hover:opacity-100 transition-colors flex-shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              <span className="text-3xl font-black text-[var(--color-primario)]">
                {hayPrecioAnterior && (
                  <span className="mr-2 text-lg text-[var(--texto-sobre-secundario)] opacity-40 line-through">
                    {precioAnterior!.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 })}
                  </span>
                )}
                {price}
              </span>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-xs font-semibold text-[var(--texto-sobre-secundario)] opacity-70">
                  {totalStock > 0 ? `${totalStock} unidades disponibles` : "Sin stock"}
                </span>
              </div>

              {/* Descripción */}
              {garment.description && (
                <p className="text-sm text-[var(--texto-sobre-secundario)] opacity-70 leading-relaxed whitespace-pre-line">{garment.description}</p>
              )}

              {modelo.grupos.map((grupo) => (
                <div key={grupo.name} className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--texto-sobre-secundario)] opacity-60">
                    {grupo.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {grupo.values.map((valor) => {
                      const activo = seleccion[grupo.name] === valor.value;
                      return (
                        <button
                          key={valor.value}
                          onClick={() =>
                            setSeleccion((prev) => ({
                              ...prev,
                              [grupo.name]: prev[grupo.name] === valor.value ? "" : valor.value,
                            }))
                          }
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            activo
                              ? "bg-[var(--color-primario)] text-[var(--texto-sobre-primario)] border-[var(--color-primario)]"
                              : "bg-[var(--color-fondo-sitio)]/5 text-[var(--texto-sobre-secundario)] border-[var(--color-secundario)] hover:opacity-90"
                          }`}
                        >
                          {valor.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Stock variante seleccionada */}
              {varianteElegida && (
                <div className="flex items-center gap-2 p-3 bg-[var(--color-fondo-sitio)]/5 rounded-xl border border-[var(--color-secundario)] text-xs text-[var(--texto-sobre-secundario)]">
                  <Tag size={12} />
                  {varianteElegida.stock > 0
                    ? `${varianteElegida.stock} unidades en esta variante`
                    : "Sin stock en esta combinación"}
                  {varianteElegida.sku && (
                    <span className="ml-auto font-mono opacity-60">Código: {varianteElegida.sku}</span>
                  )}
                </div>
              )}

              {/* CTA */}
              <button className="w-full py-4 bg-[var(--color-primario)] hover:opacity-90 text-[var(--texto-sobre-primario)] font-black uppercase tracking-wider text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 group">
                <ShoppingBag size={16} />
                Consultar disponibilidad
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── PRODUCT GRID ─────────────────────────────────────────────────────────────
export default function ProductGrid({ garments }: { garments: Garment[] }) {
  const [selected, setSelected] = useState<Garment | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {garments.map((g) => (
          <ProductCard key={g.id} garment={g} onClick={() => setSelected(g)} />
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <ProductModal garment={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
