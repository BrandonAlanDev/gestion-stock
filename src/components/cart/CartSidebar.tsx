"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState, useMemo } from "react";
import CartItemRow from "@/context/CartItemRow";
import WhatsAppOrderForm from "@/components/providers/products/forms/WhatsAppOrder";
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, updateCartItemSpecs } = useCart();
  const [editingItem, setEditingItem] = useState<any>(null);

  const subtotal = useMemo(() =>
    cartItems.reduce((acc: number, item: any) => acc + (parseFloat(item.price) * item.qty), 0),
    [cartItems]
  );

  const handleWhatsAppCheckout = () => {
    let message = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

    cartItems.forEach((item: any) => {
      message += `• *${item.name}* (x${item.qty}) - $${(Number(item.price) * item.qty).toLocaleString()}\n`;

      // Si el producto tiene especificaciones (specs), las agregamos al mensaje
      if (item.esTabla && item.specs) {
        Object.entries(item.specs).forEach(([key, value]) => {
          if (value) message += `   - ${key}: ${value}\n`;
        });
      }
      message += "\n";
    });

    message += `*TOTAL: $${subtotal.toLocaleString()}*`;

    const phone = "2235644043";
    //const phone = pageConfig?.whatsapp || "2235644043";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] shadow-2xl z-[101] flex flex-col p-6"
            style={{ backgroundColor: "var(--color-secundario)", color: "var(--texto-sobre-secundario)" }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag style={{ color: "var(--color-primario)" }} /> Carrito
              </h2>
              <button onClick={onClose}><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {cartItems.map((item: any) => (
                <CartItemRow
                  key={`${item.id}-${JSON.stringify(item.specs)}`}
                  item={item}
                  onEdit={() => setEditingItem(item)}
                />
              ))}
            </div>

            <div className="border-t pt-4 mt-4" style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-secundario) 12%, transparent)" }}>
              <div className="flex justify-between font-bold mb-4">
                <span>Total</span> <span>${subtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
              >
                Finalizar Pedido <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {editingItem && (
        <WhatsAppOrderForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(id, specs) => {
            updateCartItemSpecs(id, specs);
            setEditingItem(null);
          }}
        />
      )}
    </>
  );
}