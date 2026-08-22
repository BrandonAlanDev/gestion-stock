"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { getContrastColor } from "@/lib/utils";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";

interface ConfirmacionEliminarSeccionProps {
  onCancelar: () => void;
  onConfirmar: () => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function ConfirmacionEliminarSeccion({
  onCancelar,
  onConfirmar,
  primaryColor,
  secondaryColor,
}: ConfirmacionEliminarSeccionProps) {
  const textColor = getContrastColor(secondaryColor);
  const { nivel, zIndice } = useCapa();

  return (
    <ContextoCapas.Provider value={nivel + 1}>
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ zIndex: zIndice }}>
      <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: secondaryColor, borderColor: primaryColor, color: textColor }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor + "20" }}>
            <AlertTriangle className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: textColor }}>Eliminar sección</h3>
        </div>
        <p className="mb-6" style={{ color: textColor + "CC" }}>
          ¿Estás seguro de que quieres eliminar esta sección y todos sus slides? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
            style={{ backgroundColor: "transparent", border: "1px solid", borderColor: textColor + "30", color: textColor + "99" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = textColor + "0A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="px-4 py-2 rounded-lg font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer" style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>
      </div>
    </ContextoCapas.Provider>
  );
}
