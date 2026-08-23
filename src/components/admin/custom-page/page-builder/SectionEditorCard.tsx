"use client";

import { Plus, Trash2 } from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

const sectionTypes = ["HERO", "TEXT", "CARDS", "FAQ", "TIMELINE", "CTA", "GALLERY", "FEATURES"];

export default function SectionEditorCard({
  section,
  sIdx,
  onChangeSection,
  onRemoveSection,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  primaryColor,
  secondaryColor,
}: {
  section: any;
  sIdx: number;
  onChangeSection: (index: number, field: string, value: any) => void;
  onRemoveSection: (index: number) => void;
  onChangeItem: (sIndex: number, iIndex: number, field: string, value: any) => void;
  onAddItem: (sIndex: number) => void;
  onRemoveItem: (sIndex: number, iIndex: number) => void;
  primaryColor: string;
  secondaryColor: string;
}) {
  const textContrast = getContrastColor(secondaryColor);

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ backgroundColor: secondaryColor, borderColor: `${primaryColor}30` }}
    >
      <div
        className="p-4 flex justify-between items-center gap-2"
        style={{ backgroundColor: `${primaryColor}05`, borderBottom: `1px solid ${primaryColor}15` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-black shrink-0" style={{ color: primaryColor }}>#{sIdx + 1}</span>
          <select
            value={section.type}
            onChange={(e) => onChangeSection(sIdx, "type", e.target.value)}
            className="p-2 rounded-lg border font-bold text-sm outline-none cursor-pointer min-w-0"
            style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}30` }}
          >
            {sectionTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onRemoveSection(sIdx)}
          className="transition-colors hover:opacity-70 p-2"
          style={{ color: "#ef4444" }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Título de Sección</label>
            <input
              type="text"
              value={section.title || ""}
              onChange={(e) => onChangeSection(sIdx, "title", e.target.value)}
              className="w-full p-2.5 rounded-xl border outline-none text-sm focus:opacity-90"
              style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Configuración JSON (Opcional)</label>
            <input
              type="text"
              value={section.configStr || ""}
              onChange={(e) => onChangeSection(sIdx, "configStr", e.target.value)}
              placeholder='{"estilo": "oscuro"}'
              className="w-full p-2.5 rounded-xl border outline-none text-sm font-mono focus:opacity-90"
              style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Subtítulo / Descripción</label>
          <textarea
            value={section.subtitle || ""}
            onChange={(e) => onChangeSection(sIdx, "subtitle", e.target.value)}
            className="w-full p-2.5 rounded-xl border outline-none text-sm focus:opacity-90"
            rows={2}
            style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
          />
        </div>

        <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${primaryColor}15` }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-sm" style={{ color: primaryColor }}>Ítems de esta sección</h4>
            <button
              type="button"
              onClick={() => onAddItem(sIdx)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-80"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <Plus size={14} /> Añadir Ítem
            </button>
          </div>

          <div className="space-y-3">
            {section.items.map((item: any, iIdx: number) => (
              <div
                key={iIdx}
                className="p-4 rounded-xl border flex gap-4"
                style={{ backgroundColor: `${primaryColor}03`, borderColor: `${primaryColor}15` }}
              >
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Título del ítem"
                      required
                      value={item.title || ""}
                      onChange={(e) => onChangeItem(sIdx, iIdx, "title", e.target.value)}
                      className="w-full p-2 rounded-lg border outline-none text-sm focus:opacity-90"
                      style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                    />
                    <input
                      type="text"
                      placeholder="Icono (ej: TrendingUp)"
                      value={item.icon || ""}
                      onChange={(e) => onChangeItem(sIdx, iIdx, "icon", e.target.value)}
                      className="w-full p-2 rounded-lg border outline-none text-sm focus:opacity-90"
                      style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                    />
                  </div>
                  <textarea
                    placeholder="Descripción del ítem"
                    value={item.description || ""}
                    onChange={(e) => onChangeItem(sIdx, iIdx, "description", e.target.value)}
                    className="w-full p-2 rounded-lg border outline-none text-sm focus:opacity-90"
                    rows={1}
                    style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                  />
                  <input
                    type="text"
                    placeholder='Config JSON (Ej: {"stepNumber": "01"})'
                    value={item.configStr || ""}
                    onChange={(e) => onChangeItem(sIdx, iIdx, "configStr", e.target.value)}
                    className="w-full p-2 rounded-lg border outline-none text-sm font-mono focus:opacity-90"
                    style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(sIdx, iIdx)}
                  className="transition-colors hover:opacity-70 mt-2 h-fit"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {section.items.length === 0 && (
              <p
                className="text-xs text-center py-2 border border-dashed rounded-xl"
                style={{ color: textContrast, borderColor: `${primaryColor}30` }}
              >
                No hay ítems en esta sección
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
