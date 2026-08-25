"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Tag, Layers, Palette, ShoppingBag } from "lucide-react";
import { obtenerUrlImagenOptimizada } from "@/lib/utilidades/imagen-cloudinary";

type Color = { id: string; name: string; hex: string | null; active?: boolean };
type Size = { id: string; value: string; order: number; active?: boolean; sizeTypeId?: string };
type Variant = { id: string; stock: number; sku: string | null; size: Size | null; color: Color | null };
type Image = { id: string; srcImage: string; alt: string | null; order: number; garmentId?: string };
type Garment = {
  id: string;
  name: string;
  price: any;
  description: string | null;
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
          <div className="flex gap-1">
            {/* Puntos de colores disponibles */}
            {Array.from(new Set(garment.variants.filter(v => v.color).map(v => v.color!.hex || "var(--color-secundario)")))
              .slice(0, 4)
              .map((hex, i) => (
                <div key={i} className="w-3 h-3 rounded-full border border-[var(--color-secundario)]" style={{ backgroundColor: hex }} />
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
function ProductModal({ garment, onClose }: { garment: Garment; onClose: () => void }) {
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const sizes = Array.from(new Map(
    garment.variants
      .filter(v => v.size)
      .map(v => [v.size!.value, v.size!])
  ).values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const colors = Array.from(new Map(
    garment.variants.filter(v => v.color).map(v => [v.color!.id, v.color!])
  ).values());

  const totalStock = garment.variants.reduce((a, v) => a + v.stock, 0);

  const selectedVariant = garment.variants.find(v =>
    (!selectedSize || v.size?.value === selectedSize) &&
    (!selectedColor || v.color?.id === selectedColor)
  );

  const price = parseFloat(String(garment.price)).toLocaleString("es-AR", {
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

              <span className="text-3xl font-black text-[var(--color-primario)]">{price}</span>

              {/* Stock */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-xs font-semibold text-[var(--texto-sobre-secundario)] opacity-70">
                  {totalStock > 0 ? `${totalStock} unidades disponibles` : "Sin stock"}
                </span>
              </div>

              {/* Descripción */}
              {garment.description && (
                <p className="text-sm text-[var(--texto-sobre-secundario)] opacity-70 leading-relaxed">{garment.description}</p>
              )}

              {/* Talles */}
              {sizes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--texto-sobre-secundario)] opacity-60 flex items-center gap-1.5">
                    <Layers size={11} /> Talle
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => {
                      const hasStock = garment.variants.some(v => v.size?.value === s.value && v.stock > 0);
                      return (
                        <button
                          key={s.value}
                          onClick={() => setSelectedSize(selectedSize === s.value ? null : s.value)}
                          disabled={!hasStock}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            selectedSize === s.value
                              ? "bg-[var(--color-primario)] text-[var(--texto-sobre-primario)] border-[var(--color-primario)]"
                              : hasStock
                              ? "bg-[var(--color-fondo-sitio)]/5 text-[var(--texto-sobre-secundario)] border-[var(--color-secundario)] hover:opacity-90"
                              : "bg-[var(--color-fondo-sitio)]/5 text-[var(--texto-sobre-secundario)]/40 border-[var(--color-secundario)] cursor-not-allowed line-through"
                          }`}
                        >
                          {s.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colores */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--texto-sobre-secundario)] opacity-60 flex items-center gap-1.5">
                    <Palette size={11} />
                    Color {selectedColor && <span className="normal-case font-semibold text-[var(--texto-sobre-secundario)] opacity-70 tracking-normal">— {colors.find(c => c.id === selectedColor)?.name}</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(selectedColor === c.id ? null : c.id)}
                        title={c.name}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.id ? "border-slate-900 scale-110 shadow-md" : "border-transparent hover:border-slate-300"}`}
                        style={{ backgroundColor: c.hex ?? "var(--color-secundario)" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stock variante seleccionada */}
              {selectedVariant && (
                <div className="flex items-center gap-2 p-3 bg-[var(--color-fondo-sitio)]/5 rounded-xl border border-[var(--color-secundario)] text-xs text-[var(--texto-sobre-secundario)]">
                  <Tag size={12} />
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} unidades en esta variante`
                    : "Sin stock en esta combinación"}
                  {selectedVariant.sku && (
                    <span className="ml-auto font-mono opacity-60">SKU: {selectedVariant.sku}</span>
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