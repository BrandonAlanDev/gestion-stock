"use client";

import { ShoppingBag, MessageCircle } from "lucide-react";
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
  mensajeDisponibilidad?: string | null;
  onAgregar: () => void;
}

export default function ProductAction({
  product,
  seleccion,
  deshabilitado,
  mensajeDisponibilidad,
  onAgregar,
}: PropiedadesAccionProducto) {
  const { pageConfig } = usePageConfig();

  const WS_NUMBER = pageConfig?.whatsapp || "2235644043";

  const handleAction = () => {
    if (pageConfig?.cartEnabled) {
      onAgregar();
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
    <div className="flex flex-col gap-2">
      <button
        onClick={handleAction}
        disabled={deshabilitado}
        className="w-full py-4 rounded-lg text-xs font-black uppercase tracking-widest shadow-md transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}
      >
        {pageConfig?.cartEnabled ? (
          <><ShoppingBag size={16} /> AGREGAR AL CARRITO</>
        ) : (
          <><MessageCircle size={16} /> Consultar por WhatsApp</>
        )}
      </button>
      {pageConfig?.cartEnabled && mensajeDisponibilidad && (
        <p role="status" aria-live="polite" className="text-center text-xs text-[var(--texto-sobre-fondo)] opacity-70">
          {mensajeDisponibilidad}
        </p>
      )}
    </div>
  );
}
