"use client";

import { X } from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function ViewPageModal({ isOpen, onClose, page, primaryColor, secondaryColor }: any) {
  if (!isOpen || !page) return null;

  const textContrast = getContrastColor(secondaryColor);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div
        className="rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        style={{ backgroundColor: secondaryColor }}
      >
        <div
          className="p-6 flex justify-between items-center"
          style={{ borderBottom: `1px solid ${primaryColor}20`, backgroundColor: secondaryColor }}
        >
          <div>
            <h2 className="text-2xl font-black" style={{ color: primaryColor }}>{page.title}</h2>
            <p className="text-sm font-medium" style={{ color: textContrast }}>/{page.slug} • {page.sections?.length || 0} Secciones</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all hover:opacity-80"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6" style={{ backgroundColor: `${primaryColor}03` }}>
          {page.subtitle && (
            <div
              className="p-4 rounded-2xl shadow-sm"
              style={{ backgroundColor: secondaryColor, border: `1px solid ${primaryColor}15` }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Subtítulo de la Página</h4>
              <p style={{ color: textContrast }}>{page.subtitle}</p>
            </div>
          )}

          {page.sections?.map((section: any, sIdx: number) => (
            <div
              key={section.id || sIdx}
              className="border rounded-2xl p-5 shadow-sm"
              style={{ backgroundColor: secondaryColor, borderColor: `${primaryColor}20` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
                >
                  {section.type}
                </span>
                <h3 className="font-bold text-lg" style={{ color: primaryColor }}>{section.title || "Sin título"}</h3>
              </div>
              {section.subtitle && <p className="text-sm mb-4" style={{ color: textContrast }}>{section.subtitle}</p>}

              {section.items && section.items.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l-2" style={{ borderColor: primaryColor }}>
                  {section.items.map((item: any, iIdx: number) => (
                    <div
                      key={item.id || iIdx}
                      className="p-3 rounded-xl border"
                      style={{ backgroundColor: `${primaryColor}03`, borderColor: `${primaryColor}10` }}
                    >
                      <h4 className="font-bold text-sm flex items-center gap-2" style={{ color: primaryColor }}>
                        {item.icon && <span>[{item.icon}]</span>}
                        {item.title}
                      </h4>
                      {item.description && <p className="text-xs mt-1" style={{ color: textContrast }}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
