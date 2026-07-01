"use client";

import { useState } from "react";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import WhatsAppOrderForm from "@/components/products/forms/WhatsAppOrder";

interface ProductActionProps {
    product: any;
    size?: string | null;
    color?: string | null;
    esTabla?: boolean;
}

export default function ProductAction({ product, size, color, esTabla = false }: ProductActionProps) {
    const { addToCart } = useCart();
    const { pageConfig } = usePageConfig();
    const [showOrderForm, setShowOrderForm] = useState(false);

    const primaryColor = pageConfig?.primaryColor || "#06b6d4";
    const WS_NUMBER = pageConfig?.whatsapp || "2235644043";

    const handleAction = () => {
        if (pageConfig?.cartEnabled) {
            const imageIndex = esTabla ? 1 : 0;
            const imageToSave = product.images?.[imageIndex]?.srcImage || product.images?.[0]?.srcImage;
            addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                size,
                color,
                image: imageToSave 
            });
            return;
        }
        if (esTabla) {
            setShowOrderForm(true);
            return;
        }
        const lines = [
            `Hola! Me interesa: *${product.name}*`,
            size ? `Talle: ${size}` : null
        ].filter(Boolean).join("\n");
        window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
    };

    return (
        <>
            <button
                onClick={handleAction}
                className="w-full text-white py-4 rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
            >
                {pageConfig?.cartEnabled ? (
                    <> <ShoppingBag size={16} /> AGREGAR AL CARRITO </>
                ) : (
                    esTabla ? "Consultar con el vendedor" : <><MessageCircle size={16} /> Consultar por WhatsApp</>
                )}
            </button>

            {showOrderForm && (
                <WhatsAppOrderForm product={product} onClose={() => setShowOrderForm(false)} />
            )}
        </>
    );
}