"use client";

import { Save } from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function ModalFooter({
  onClose,
  isSaving,
  primaryColor,
  secondaryColor,
}: {
  onClose: () => void;
  isSaving: boolean;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div
      className="p-4 border-t flex flex-col-reverse gap-3 sm:flex-row sm:justify-end shadow-lg z-10"
      style={{ backgroundColor: secondaryColor, borderTop: `1px solid ${primaryColor}20` }}
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all hover:opacity-80"
        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="page-builder-form"
        disabled={isSaving}
        className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 hover:opacity-90"
        style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
      >
        <Save size={18} />
        {isSaving ? "Guardando..." : "Guardar Página Dinámica"}
      </button>
    </div>
  );
}
