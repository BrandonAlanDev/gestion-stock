"use client";

import { X, Truck, Phone, Mail } from "lucide-react";

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
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(7,26,24,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative"
        style={{ background: "#ffffff", border: "1px solid #b2dede" }}
      >
        {/* Barra superior */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-[2.5rem]"
          style={{ background: "#0d5c63" }}
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 transition-colors"
          style={{ color: "#4a7c80" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#083d42")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#4a7c80")}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <Truck style={{ color: "#0d5c63", marginBottom: 8 }} size={20} />
          <h2
            className="text-2xl font-black italic uppercase tracking-tighter"
            style={{ color: "#083d42" }}
          >
            {provider.name}
          </h2>
        </div>

        {/* Detalles */}
        <div className="space-y-4">
          <div
            className="p-4 rounded-2xl text-[11px] font-bold italic uppercase"
            style={{
              background: "#f0fafa",
              border: "1px solid #b2dede",
              color: "#4a7c80",
            }}
          >
            {provider.details || "Sin descripción disponible."}
          </div>

          <div className="grid gap-2">
            {provider.contacts?.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "#e0f5f5", border: "1px solid #b2dede" }}
              >
                <div style={{ color: "#0d5c63" }}>
                  {c.type === "EMAIL" ? <Mail size={14} /> : <Phone size={14} />}
                </div>
                <span className="text-[11px] font-bold" style={{ color: "#083d42" }}>
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
          style={{ background: "#f0fafa", border: "1px solid #b2dede", color: "#4a7c80" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e0f5f5";
            e.currentTarget.style.color = "#083d42";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f0fafa";
            e.currentTarget.style.color = "#4a7c80";
          }}
        >
          Cerrar Vista
        </button>
      </div>
    </div>
  );
}