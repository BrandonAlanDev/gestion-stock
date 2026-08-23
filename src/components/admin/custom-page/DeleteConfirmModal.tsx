"use client";

import { AlertTriangle } from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting, primaryColor, secondaryColor }: any) {
  if (!isOpen) return null;

  const textContrast = getContrastColor(secondaryColor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div
        className="rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: secondaryColor, color: textContrast }}
      >
        <div className="flex items-center gap-4 mb-4" style={{ color: "#ef4444" }}>
          <div className="p-3 rounded-full" style={{ backgroundColor: "#ef444415" }}>
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-black">Eliminar Página</h2>
        </div>

        <p className="mb-6" style={{ color: textContrast }}>
          ¿Estás seguro que deseas eliminar la página <b>{itemName}</b>? Esta acción eliminará también todas sus secciones y los ítems que contengan. <b>Esta acción no se puede deshacer.</b>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
