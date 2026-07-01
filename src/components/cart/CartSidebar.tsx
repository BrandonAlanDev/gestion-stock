"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface ItemCarrito {
  id: string;
  name: string;
  price: number | string;
  image?:string;
  shipping?: string;
  qty: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: ItemCarrito[];
  updateQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
}

const parsearPrecio = (valor: number | string): number => {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  return parseFloat(valor.toString().replace(/[^0-9.-]+/g, "")) || 0;
};

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  updateQty,
  removeItem,
}: CartSidebarProps) {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";

  const subtotal = useMemo(() =>
    cartItems.reduce((acc, item) => acc + parsearPrecio(item.price) * item.qty, 0),
    [cartItems]
  );

  const costoEnvio = useMemo(() => {
    if (cartItems.length === 0) return 0;
    const costos = cartItems.map((item) => {
      const texto = item.shipping?.toLowerCase() || "";
      if (texto.includes("gratis")) return 0;
      const coincidencia = texto.match(/\d+/);
      return coincidencia ? parseInt(coincidencia[0], 10) : 0;
    });
    return Math.max(...costos);
  }, [cartItems]);

  const total = subtotal + costoEnvio;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: primaryColor }}>
                <ShoppingBag className="w-5 h-5" /> Carrito
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const imagenSrc = item.image || "/images/placeholder.avif";
                  return (
                    <div key={item.id} className="flex gap-4">
                      <Image
                        src={imagenSrc}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-sm leading-tight text-gray-900">{item.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">{item.shipping}</p>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center border rounded-lg px-2 py-1 gap-3" style={{ borderColor: primaryColor }}>
                            <button onClick={() => updateQty(item.id, -1)} className="hover:opacity-70 transition-opacity">
                              <Minus className="w-3 h-3" style={{ color: primaryColor }} />
                            </button>
                            <span className="text-sm font-bold text-gray-900">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="hover:opacity-70 transition-opacity">
                              <Plus className="w-3 h-3" style={{ color: primaryColor }} />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900">
                            ${(parsearPrecio(item.price) * item.qty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 bg-gray-50 border-t space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="font-medium" style={{ color: costoEnvio === 0 ? "#16a34a" : "inherit" }}>
                    {costoEnvio === 0 ? "Gratis" : `$${costoEnvio.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-3 text-gray-900">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <Link
                  href="/paycart"
                  onClick={onClose}
                  className="w-full text-white py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Ir a pagar <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}