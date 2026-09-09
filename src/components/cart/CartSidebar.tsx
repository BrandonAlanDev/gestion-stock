"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { useCart } from "@/contextos/carrito/use-carrito";
import { useMemo, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { toast } from "sonner";
import FilaItemCarrito from "@/components/carrito/fila-item-carrito";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";
import { crearPedidoPago } from "@/actions/pago/crear-pedido-pago";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cartItems } = useCart();
  const router = useRouter();
  const { status } = useSession();
  const { pageConfig } = usePageConfig();
  const [pendiente, startTransicion] = useTransition();

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

  const handleMercadoPagoCheckout = () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/")}`);
      return;
    }

    const items = cartItems
      .filter((item) => item.variantId)
      .map((item) => ({
        productId: item.id,
        variantId: item.variantId as string | number,
        cantidad: item.qty,
      }));

    if (!items.length) {
      toast.error("El carrito está vacío");
      return;
    }

    startTransicion(async () => {
      const resultado = await crearPedidoPago(items);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      window.location.href = resultado.checkoutUrl;
    });
  };

  const handleWhatsAppCheckout = () => {
    let message = "🛍️ *¡Hola! Quiero realizar el siguiente pedido:*\n\n";

    cartItems.forEach((item) => {
      message += `• *${item.name}* (x${item.qty}) - $${(Number(item.price) * item.qty).toLocaleString()}\n`;
      message += "\n";
    });

    message += `*TOTAL: $${subtotal.toLocaleString()}*`;

    const phone = (
      typeof pageConfig?.whatsapp === "string" ? pageConfig.whatsapp : "2235644043"
    ).replace(/[^\d]/g, "");
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

            <div className="border-t pt-4 mt-4 space-y-3" style={{ borderColor: "color-mix(in srgb, var(--texto-sobre-secundario) 12%, transparent)" }}>
              <div className="flex justify-between font-bold mb-2">
                <span>Total</span> <span>${subtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={handleMercadoPagoCheckout}
                disabled={pendiente || cartItems.length === 0}
                className="w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
              >
                {pendiente ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Pagar con Mercado Pago
              </button>
              <button
                onClick={handleWhatsAppCheckout}
                disabled={cartItems.length === 0}
                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--texto-sobre-secundario) 8%, transparent)",
                  color: "var(--texto-sobre-secundario)",
                  border: "1px solid color-mix(in srgb, var(--texto-sobre-secundario) 20%, transparent)",
                }}
              >
                <MessageCircle size={16} />
                Pedir por WhatsApp
              </button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
