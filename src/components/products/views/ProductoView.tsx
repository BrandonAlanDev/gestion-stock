"use client";

import { useMemo, useState } from "react";
import {
  Star, Truck, ChevronDown, MessageCircle, X, Send, User, Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

const WS_NUMBER = "2235644043";

interface Props {
  product: any;
}

const QUILLA_OPTIONS = ["Single", "Twin", "Tri (Thruster)", "Quad", "2+1", "5 quillas"];
const COLA_OPTIONS = ["Squash", "Round", "Pin", "Swallow (cola de golondrina)", "Bat tail", "Moon tail"];

// ─── Categorías que disparan el formulario detallado ─────────────────────────
// Ajustá los nombres según cómo vengan de la DB
const BOARD_CATEGORIES = ["tablas", "tabla", "surfboard", "surfboards"];

function isTablaCategory(product: any): boolean {
  const name = (product.category?.name || "").toLowerCase().trim();
  return BOARD_CATEGORIES.some((cat) => name.includes(cat));
}

// ─── MODAL FORMULARIO (solo para tablas) ─────────────────────────────────────
function WhatsAppOrderForm({ product, onClose }: { product: any; onClose: () => void }) {
  const [form, setForm] = useState({
    largo: "", ancho: "", espesor: "", volumen: "",
    sistemaQuillas: "", tipoCola: "", colorDiseno: "", notasExtra: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSend = () => {
    const lines = [
      `🏄 *Pedido personalizado — NewSurfBoard*`,
      ``,
      `*Producto:* ${product.name}`,
      `*Precio base:* $${Number(product.price).toLocaleString("es-AR")}`,
      ``,
      `📐 *Medidas*`,
      form.largo    ? `• Largo: ${form.largo}`          : null,
      form.ancho    ? `• Ancho: ${form.ancho}`          : null,
      form.espesor  ? `• Espesor: ${form.espesor}`      : null,
      form.volumen  ? `• Volumen: ${form.volumen} L`     : null,
      ``,
      form.sistemaQuillas ? `🔩 *Sistema de quillas:* ${form.sistemaQuillas}` : null,
      form.tipoCola       ? `🔻 *Tipo de cola:* ${form.tipoCola}`             : null,
      form.colorDiseno    ? `🎨 *Color / Diseño:* ${form.colorDiseno}`        : null,
      form.notasExtra     ? `📝 *Notas:* ${form.notasExtra}`                  : null,
      ``,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
    onClose();
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all";

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-none">Pedido por WhatsApp</h3>
                <p className="text-xs text-gray-400 mt-0.5">Completá los detalles de tu tabla</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Resumen producto */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {product.images?.[0] && (
                <img
                  src={product.images[0].srcImage}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {product.category?.name}
                  {product.subCategory?.name && ` / ${product.subCategory.name}`}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  ${Number(product.price).toLocaleString("es-AR")}
                </p>
              </div>
            </div>

            {/* Medidas */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">📐 Medidas</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Largo",        field: "largo",   placeholder: 'Ej: 6\'2"'    },
                  { label: "Ancho",        field: "ancho",   placeholder: 'Ej: 19 1/2"'  },
                  { label: "Espesor",      field: "espesor", placeholder: 'Ej: 2 3/8"'   },
                  { label: "Volumen (L)",  field: "volumen", placeholder: "Ej: 32.5"      },
                ].map(({ label, field, placeholder }) => (
                  <div key={field} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">{label}</label>
                    <input
                      type="text"
                      value={form[field as keyof typeof form]}
                      onChange={(e) => set(field, e.target.value)}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quillas */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">🔩 Sistema de quillas</p>
              <div className="flex flex-wrap gap-2">
                {QUILLA_OPTIONS.map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => set("sistemaQuillas", form.sistemaQuillas === opt ? "" : opt)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.sistemaQuillas === opt
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Cola */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">🔻 Tipo de cola</p>
              <div className="flex flex-wrap gap-2">
                {COLA_OPTIONS.map((opt) => (
                  <button
                    key={opt} type="button"
                    onClick={() => set("tipoCola", form.tipoCola === opt ? "" : opt)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.tipoCola === opt
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >{opt}</button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">🎨 Color / Diseño</p>
              <textarea
                value={form.colorDiseno}
                onChange={(e) => set("colorDiseno", e.target.value)}
                placeholder="Describí el color, diseño o referencia que tenés en mente..."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            {/* Notas */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">📝 Notas adicionales</p>
              <textarea
                value={form.notasExtra}
                onChange={(e) => set("notasExtra", e.target.value)}
                placeholder="Algún detalle extra, experiencia de surf, nivel, etc."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Botón enviar */}
          <div className="px-6 pb-6">
            <button
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98]"
            >
              <Send size={16} />
              Enviar pedido por WhatsApp
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Se abrirá WhatsApp con tu pedido completo listo para enviar.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ProductoView({ product }: Props) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0]?.srcImage || "/images/placeholder.avif"
  );
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);

  // ── ¿Es una tabla? ──────────────────────────────────────────────────────────
  const esTabla = isTablaCategory(product);

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
  }, [product]);

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
  }, [product]);

  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;
  const hasDescription = product.description && product.description.trim() !== "";

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) { setSizeError(true); return; }
    addToCart({ ...product, selectedSize, selectedColor });
  };

  // ── Lógica del botón de WhatsApp ────────────────────────────────────────────
  // Si es tabla → abre el form detallado
  // Si no → manda directo a WA con info básica del producto
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
      product.category?.name ? `Categoría: ${product.category.name}${product.subCategory?.name ? ` / ${product.subCategory.name}` : ""}` : null,
      selectedSize  ? `Talle: ${selectedSize}`   : null,
      selectedColor ? `Color: ${selectedColor}` : null,
      ``,
      `¿Podés darme más info?`,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                  className={`relative rounded-xl overflow-hidden aspect-square bg-gray-50 transition-all duration-200 ${
                    selectedImage === img.srcImage
                      ? "ring-2 ring-cyan-600 shadow-md scale-105 z-10"
                      : "ring-1 ring-gray-200 hover:ring-cyan-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={img.srcImage} alt={img.alt || product.name} className="w-full h-full object-contain" />
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
              <div className="flex gap-3 mt-6 lg:hidden overflow-x-auto w-full pb-4 snap-x scrollbar-hide">
                {product.images?.map((img: any) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.srcImage)}
                    className={`flex-shrink-0 relative rounded-xl overflow-hidden w-20 h-20 transition-all snap-center ${
                      selectedImage === img.srcImage ? "ring-2 ring-cyan-600 shadow-sm" : "ring-1 ring-gray-200 opacity-70"
                    }`}
                  >
                    <img src={img.srcImage} alt={img.alt || product.name} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* INFO */}
            <div className="p-6 lg:p-10 bg-white lg:border-l border-gray-100 flex flex-col h-full">

              <h1 className="text-2xl font-semibold text-gray-900 leading-snug mb-4">{product.name}</h1>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {product.category?.name}
                  {product.subCategory?.name && ` / ${product.subCategory.name}`}
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl font-semibold text-gray-900 tracking-tight">
                  $ {Number(product.price).toLocaleString("es-AR")}
                </h2>
              </div>

              {hasColors && (
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="font-medium text-gray-900">Color</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color: any) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.name ? "border-cyan-600 scale-110" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex || "#000" }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {hasSizes && (
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="font-medium text-gray-900">Talle</h3>
                    <button className="text-sm text-cyan-600 hover:underline">Guía de talles</button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {sizes.map((size: any) => {
                      const disabled = size.stock <= 0;
                      const selected = selectedSize === size.name;
                      return (
                        <button
                          key={size.id}
                          disabled={disabled}
                          onClick={() => { setSelectedSize(size.name); setSizeError(false); }}
                          className={`min-w-[3rem] px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2 ${
                            disabled
                              ? "bg-gray-50 text-gray-400 border-transparent cursor-not-allowed opacity-60"
                              : selected
                              ? "border-cyan-600 bg-cyan-50 text-cyan-700"
                              : "bg-white border-gray-200 text-gray-700 hover:border-cyan-600 hover:text-cyan-700"
                          }`}
                        >
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                  {sizeError && <p className="text-red-500 text-sm mt-3">Seleccioná un talle para continuar.</p>}
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-green-600 font-medium">Consultar por stock disponible con el vendedor.</p>
              </div>

              <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 mb-8">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-green-700 font-semibold text-sm">Envios a todo el pais</p>
                </div>
              </div>

              <div className="flex-grow" />

              {/* BOTÓN PRINCIPAL */}
              <div className="space-y-3 mt-4">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-green-500/20 active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  {esTabla ? "Personalizar y pedir por WhatsApp" : "Consultar por WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPCIÓN */}
        <div className="mt-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Acerca de este producto</h2>
          <div className="relative max-w-4xl">
            <div className={`overflow-hidden transition-all duration-700 ease-in-out text-gray-600 leading-relaxed text-[15px] md:text-base ${showFullDescription ? "max-h-[3000px]" : "max-h-[160px]"}`}>
              <p className="whitespace-pre-line">
                {hasDescription ? product.description : "Este producto no tiene descripción."}
              </p>
            </div>
            {!showFullDescription && hasDescription && product.description.length > 250 && (
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
            )}
          </div>
          {hasDescription && product.description.length > 250 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-6 flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors rounded-lg px-4 py-2 hover:bg-cyan-50 -ml-4"
            >
              {showFullDescription ? "Ocultar descripción" : "Ver descripción completa"}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFullDescription ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* MODAL — solo se monta cuando es tabla y el usuario lo abrió */}
      {showOrderForm && esTabla && (
        <WhatsAppOrderForm product={product} onClose={() => setShowOrderForm(false)} />
      )}
    </div>
  );
}