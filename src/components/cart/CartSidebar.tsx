"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

function getContrastColor(hex: string) {
  if (!hex) return "#000000";
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#000000" : "#ffffff";
}

export default function CartSidebar({ isOpen, onClose, cartItems, updateQty, removeItem }: any) {
  const { pageConfig } = usePageConfig();
  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#FFFFFF";
  
  const textColor = getContrastColor(secondaryColor);
  const isDarkBg = textColor === "#ffffff";
  const WS_NUMBER = pageConfig?.whatsapp || "2235644043";

  const subtotal = useMemo(() => 
    cartItems.reduce((acc: number, item: any) => acc + (parseFloat(item.price) * item.qty), 0), 
    [cartItems]
  );

  const handleCheckout = () => {
    let mensaje = "🛍️ *¡Hola! Quiero realizar un pedido:*\n\n";
    
    cartItems.forEach((item: any) => {
      mensaje += `*Producto:* ${item.name}\n`;
      if (item.sku) mensaje += `*SKU:* ${item.sku}\n`;
      mensaje += `*Cantidad:* ${item.qty}\n`;
      mensaje += `*Precio:* $${parseFloat(item.price).toLocaleString()}\n - $${parseFloat(item.maxPrice).toLocaleString()}`;
      
      if (item.size) mensaje += `*Talle:* ${item.size}\n`;
      if (item.color) mensaje += `*Color:* ${item.color}\n`;
      
      // Si el item tiene un JSON de atributos técnicos
      if (item.attributes && typeof item.attributes === 'object') {
        Object.entries(item.attributes).forEach(([key, value]) => {
          mensaje += `*${key.charAt(0).toUpperCase() + key.slice(1)}:* ${value}\n`;
        });
      }
      
      if (item.description) mensaje += `*Notas:* ${item.description}\n`;
      mensaje += `────────────────────\n`;
    });

    mensaje += `\n💰 *TOTAL A PAGAR:* $${subtotal.toLocaleString()}`;
    mensaje += `\n\nQuedo atento a la confirmación, gracias.`;

    const url = `https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
          
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] shadow-2xl z-[101] flex flex-col"
            style={{ backgroundColor: secondaryColor, color: textColor }}
          >
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" style={{ color: primaryColor }} /> Carrito
              </h2>
              <button onClick={onClose} className="p-2 hover:opacity-70"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl" style={{ backgroundColor: isDarkBg ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}>
                  <Image src={item.image || "/placeholder.png"} alt={item.name} width={70} height={70} className="rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{item.name}</h3>
                    <p className="text-[10px] opacity-70">
                      {item.size && `Talle: ${item.size} `}
                      {item.color && `| Color: ${item.color}`}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-black/10"><Minus size={10} /></button>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-black/10"><Plus size={10} /></button>
                      </div>
                      <span className="font-bold text-xs">${(parseFloat(item.price) * item.qty).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t" style={{ borderColor: isDarkBg ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: primaryColor }}
                >
                  Confirmar Pedido <ArrowRight size={16} className="inline ml-2" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}