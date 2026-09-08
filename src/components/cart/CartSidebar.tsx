"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contextos/carrito/use-carrito";
import { useMemo, useEffect } from "react";
import FilaItemCarrito from "@/components/carrito/fila-item-carrito";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems } = useCart();

  useBloqueoScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = useMemo(() =>
    cartItems.reduce((acc: number, item) => acc + (Number(item.price) * item.qty), 0),
    [cartItems]
  );

  const handleWhatsAppCheckout = () => {
    let message = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

    cartItems.forEach((item) => {
      message += `• *${item.name}* (x${item.qty}) - $${(Number(item.price) * item.qty).toLocaleString()}\n`;
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50"
            onClick={onClose}
          >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute right-0 top-0 h-full w-full sm:w-[400px] shadow-2xl z-[101] flex flex-col p-6"
            style={{ backgroundColor: "var(--color-secundario)", color: "var(--texto-sobre-secundario)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag style={{ color: "var(--color-primario)" }} /> Carrito
              </h2>
              <button onClick={onClose} className="cursor-pointer transition-opacity hover:opacity-70"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {cartItems.map((item) => (
                <FilaItemCarrito
                  key={`${item.id}-${item.uid}`}
                  item={item}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
