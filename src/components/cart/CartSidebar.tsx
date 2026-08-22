"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useState, useMemo } from "react";
import CartItemRow from "@/context/CartItemRow";
import WhatsAppOrderForm from "@/components/providers/products/forms/WhatsAppOrder";
interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Función auxiliar para contraste
function getContrastColor(hex: string) {
  if (!hex) return "#000000";
  const r = parseInt(hex.replace("#", "").substring(0, 2), 16) || 0;
  const g = parseInt(hex.replace("#", "").substring(2, 4), 16) || 0;
  const b = parseInt(hex.replace("#", "").substring(4, 6), 16) || 0;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#000000" : "#ffffff";
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems, updateCartItemSpecs } = useCart();
  const { pageConfig } = usePageConfig();
  const [editingItem, setEditingItem] = useState<any>(null);

  const primaryColor = pageConfig?.primaryColor || "#000000";
  const secondaryColor = pageConfig?.secondaryColor || "#FFFFFF";
  const textColor = getContrastColor(secondaryColor);

  const { totalUSD, totalARS } = useMemo(() => {

    return cartItems.reduce(
      (acc: { totalUSD: number; totalARS: number }, item: any) => {
        const price = parseFloat(item.price) * item.qty;
        if (item.esTabla) {
          acc.totalUSD += price;
        } else {
          acc.totalARS += price;
        }
        return acc;
      },
      { totalUSD: 0, totalARS: 0 }
    );
  }, [cartItems]);

  const handleWhatsAppCheckout = () => {
    let message = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

    cartItems.forEach((item: any) => {
      const currencySymbol = item.esTabla ? "USD" : "$";
      message += `• *${item.name}* (x${item.qty}) - ${currencySymbol}${(Number(item.price) * item.qty).toLocaleString()}\n`;

      if (item.esTabla && item.specs) {
        Object.entries(item.specs).forEach(([key, value]) => {
          if (value) message += `   - ${key}: ${value}\n`;
        });
      }
      message += "\n";
    });

    message += `*TOTAL TABLAS: USD ${totalUSD.toLocaleString()}*\n`;
    message += `*TOTAL OTROS: $${totalARS.toLocaleString()}*`;

    const phone = "2235644043";
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
            style={{ backgroundColor: secondaryColor, color: textColor }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag style={{ color: primaryColor }} /> Carrito
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

            <div className="border-t pt-4 mt-4 space-y-2" style={{ borderColor: `${textColor}20` }}>
              {totalUSD > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Total Tablas</span> <span>USD {totalUSD.toLocaleString()}</span>
                </div>
              )}
              {totalARS > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Total Otros</span> <span>${totalARS.toLocaleString()}</span>
                </div>
              )}

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-4"
                style={{ backgroundColor: primaryColor }}
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