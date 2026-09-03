"use client";

import { X, Truck, Phone, Mail } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

interface ProviderModalProps {
  provider: {
    name: string;
    details?: string | null;
    contacts?: Array<{
      id: string;
      type: string;
      contact: string;
    }>;
  };
  onClose: () => void;
}

export default function ProviderModal({ provider, onClose }: ProviderModalProps) {
  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const accent = (pageConfig?.primaryColor as string) || "#FFFFFF";
  const textColor = getContrastColor(background);
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const overlayBorder = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = textColor + "99";

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative"
        style={{ background: background, border: `1px solid ${overlayBorder}` }}
      >
        {/* Barra superior */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-[2.5rem]"
          style={{ background: accent }}
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 transition-colors"
          style={{ color: mutedColor }}
          onMouseEnter={(e) => (e.currentTarget.style.color = textColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = mutedColor)}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <Truck style={{ color: accent, marginBottom: 8 }} size={20} />
          <h2
            className="text-2xl font-black italic uppercase tracking-tighter"
            style={{ color: textColor }}
          >
            {provider.name}
          </h2>
        </div>

        {/* Detalles */}
        <div className="space-y-4">
          <div
            className="p-4 rounded-2xl text-[11px] font-bold italic uppercase"
            style={{
              background: inputBg,
              border: `1px solid ${overlayBorder}`,
              color: mutedColor,
            }}
          >
            {provider.details || "Sin descripción disponible."}
          </div>

          <div className="grid gap-2">
            {provider.contacts?.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: overlayBorder, border: `1px solid ${overlayBorder}` }}
              >
                <div style={{ color: accent }}>
                  {c.type === "EMAIL" ? <Mail size={14} /> : <Phone size={14} />}
                </div>
                <span className="text-[11px] font-bold" style={{ color: textColor }}>
                  {c.contact}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="w-full mt-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          style={{ background: inputBg, border: `1px solid ${overlayBorder}`, color: mutedColor }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = overlayBorder;
            e.currentTarget.style.color = textColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = inputBg;
            e.currentTarget.style.color = mutedColor;
          }}
        >
          Cerrar Vista
        </button>
      </div>
    </div>
  );
}
