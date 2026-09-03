"use client";

import type { PaginaPersonalizada, ValorCampoPaginaPersonalizada } from "@/types/paginas-personalizadas";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function GeneralDataFields({
  formData,
  onChange,
  primaryColor,
  secondaryColor,
}: {
  formData: PaginaPersonalizada;
  onChange: (data: PaginaPersonalizada) => void;
  primaryColor: string;
  secondaryColor: string;
}) {
  const textContrast = getContrastColor(secondaryColor);

  const update = (field: string, value: ValorCampoPaginaPersonalizada) => onChange({ ...formData, [field]: value });

  return (
    <div
      className="p-6 rounded-2xl border shadow-sm space-y-4"
      style={{ backgroundColor: secondaryColor, borderColor: `${primaryColor}15` }}
    >
      <h3
        className="font-bold text-lg mb-4 flex items-center gap-2 pb-2"
        style={{ color: primaryColor, borderBottom: `1px solid ${primaryColor}15` }}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
        >
          1
        </span>
        Datos Generales
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Título</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full p-3 rounded-xl border outline-none transition-colors focus:opacity-90"
            placeholder="Ej: Plan de Ahorro"
            style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}30` }}
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Slug (URL)</label>
          <input
            required
            type="text"
            value={formData.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full p-3 rounded-xl border outline-none transition-colors focus:opacity-90"
            placeholder="Ej: ahorro"
            style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}30` }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Subtítulo (Opcional)</label>
        <textarea
          value={formData.subtitle || ""}
          onChange={(e) => update("subtitle", e.target.value)}
          className="w-full p-3 rounded-xl border outline-none transition-colors focus:opacity-90"
          rows={2}
          style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}30` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="w-5 h-5 rounded outline-none cursor-pointer"
          style={{ accentColor: primaryColor }}
        />
        <label htmlFor="isActive" className="font-bold text-sm cursor-pointer" style={{ color: textContrast }}>
          Página Activa (Pública)
        </label>
      </div>
    </div>
  );
}
