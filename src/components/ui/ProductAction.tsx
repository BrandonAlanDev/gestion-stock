"use client";

import { useState } from "react";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface ProductoAccionProducto {
  id: string;
  name: string;
  price: string | number;
  images?: { srcImage?: string }[] | null;
}

interface PropiedadesAccionProducto {
  product: ProductoAccionProducto;
  seleccion?: Record<string, string>;
  deshabilitado: boolean;
  onAgregar: () => Promise<{ ok: boolean; error?: string }>;
}

export default function ProductAction({
  product,
  seleccion,
  deshabilitado,
  onAgregar,
}: PropiedadesAccionProducto) {
  const { pageConfig } = usePageConfig();
  const [pendiente, setPendiente] = useState(false);

  const WS_NUMBER = pageConfig?.whatsapp || "2235644043";

  const handleAction = async () => {
    if (pendiente) return;

    if (pageConfig?.cartEnabled) {
      setPendiente(true);
      const resultado = await onAgregar();
      setPendiente(false);
      if (!resultado.ok) {
        toast.error(resultado.error ?? "No se pudo agregar al carrito");
      }
      return;
    }

    const lineasSeleccion = Object.entries(seleccion ?? {})
      .filter(([, valor]) => valor)
      .map(([grupo, valor]) => `${grupo}: ${valor}`);
    const lineas = [`Hola! Me interesa: *${product.name}*`, ...lineasSeleccion]
      .filter(Boolean)
      .join("\n");
    window.open(`https://wa.me/${WS_NUMBER}?text=${encodeURIComponent(lineas)}`, "_blank");
  };

  return (
    <button
      onClick={handleAction}
      disabled={deshabilitado || pendiente}
      className="w-full py-4 rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
    >
      {pageConfig?.cartEnabled ? (
        <><ShoppingBag size={16} /> AGREGAR AL CARRITO</>
      ) : (
        <><MessageCircle size={16} /> Consultar por WhatsApp</>
      )}
    </button>
  );
}
