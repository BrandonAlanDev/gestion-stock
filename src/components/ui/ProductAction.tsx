"use client";
import { useState } from "react";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "@/contextos/carrito/use-carrito";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import WhatsAppOrderForm from "@/components/providers/products/forms/WhatsAppOrder";

interface ProductoAccionProducto {
  id: string;
  name: string;
  price: string | number;
  images?: { srcImage?: string }[] | null;
}

interface PropiedadesAccionProducto {
  product: ProductoAccionProducto;
  size?: string | number | null;
  color?: string | number | null;
  esTabla?: boolean;
}

export default function ProductAction({ product, size, color, esTabla = false }: PropiedadesAccionProducto) {
    const { addToCart } = useCart();
    const { pageConfig } = usePageConfig();
    const [showOrderForm, setShowOrderForm] = useState(false);

    const WS_NUMBER = pageConfig?.whatsapp || "2235644043";

    const handleAction = () => {
        // LÓGICA CON CARRITO ACTIVADO
        if (pageConfig?.cartEnabled) {
            if (esTabla) {
                // Si es tabla y carrito activo, abrir form para specs y luego addToCart
                setShowOrderForm(true);
            } else {
                // Si es producto normal y carrito activo, agregar directo
                addToCart({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    size,
                    color,
                    image: product.images?.[0]?.srcImage,
                    esTabla: false
                });
            }
            return;
        }

        // LÓGICA SIN CARRITO (WhatsApp directo)
        if (esTabla) {
            setShowOrderForm(true); // O puedes dejarlo consultar al vendedor sin form si prefieres
            return;
        }
        
        const lines = [`Hola! Me interesa: *${product.name}*`, size ? `Talle: ${size}` : null].filter(Boolean).join("\n");
        window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
    };

    return (
        <>
            <button 
                onClick={handleAction} 
                className="w-full py-4 rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-all hover:opacity-90 flex items-center justify-center gap-2" 
                style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
            >
                {pageConfig?.cartEnabled ? (
                    <><ShoppingBag size={16} /> {esTabla ? "CONFIGURAR Y AGREGAR" : "AGREGAR AL CARRITO"}</>
                ) : (
                    esTabla ? "Consultar con el vendedor" : <><MessageCircle size={16} /> Consultar por WhatsApp</>
                )}
            </button>

            {showOrderForm && (
                <WhatsAppOrderForm
                    item={product}
                    onClose={() => setShowOrderForm(false)}
                    onSave={(id, specs) => {
                        // Si el carrito está activo, guardamos en el carrito con specs
                        if (pageConfig?.cartEnabled) {
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: Number(product.price),
                                image: product.images?.[1]?.srcImage || product.images?.[0]?.srcImage,
                                specs: specs,
                                esTabla: true
                            });
                        } else {
                            // Si el carrito NO está activo, enviamos el mensaje con las specs directo a WhatsApp
                            const lines = [
                                `Hola! Quiero pedir: *${product.name}*`,
                                ...Object.entries(specs).map(([key, val]) => val ? `${key}: ${val}` : null)
                            ].filter(Boolean).join("\n");
                            window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lines)}`, "_blank");
                        }
                        setShowOrderForm(false);
                    }}
                />
            )}
        </>
    );
}
