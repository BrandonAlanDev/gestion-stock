"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Input from "@/components/admin/page-config/shared/Input";

export const LINK_TYPES = [
  { value: "NONE", label: "Sin enlace" },
  { value: "CATEGORY", label: "Categoría" },
  { value: "PRODUCT", label: "Producto" },
  { value: "EXTERNAL", label: "URL externa" },
] as const;

interface LinkTypeSelectorProps {
  linkType: string;
  url: string;
  onChange: (field: string, value: unknown) => void;
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  primaryColor: string;
  textColor: string;
  secondaryColor: string;
}

export default function LinkTypeSelector({
  linkType,
  url,
  onChange,
  products,
  categories,
  primaryColor,
  textColor,
  secondaryColor,
}: LinkTypeSelectorProps) {
  return (
    <>
      <div className="space-y-1">
        <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Destino del enlace</label>
        <select
          value={linkType}
          onChange={(e) => onChange("linkType", e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
          style={{ backgroundColor: primaryColor + "1A", border: "1px solid " + primaryColor + "40", color: textColor }}
          onFocus={(e) => { e.currentTarget.style.borderColor = primaryColor; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = primaryColor + "40"; }}
        >
          {LINK_TYPES.map((t) => (
            <option key={t.value} value={t.value} style={{ backgroundColor: secondaryColor, color: textColor }}>{t.label}</option>
          ))}
        </select>
      </div>

      {(linkType === "CATEGORY" || linkType === "PRODUCT") && (
        <div className="space-y-1">
          <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>
            {linkType === "CATEGORY" ? "Seleccionar categoría" : "Seleccionar producto"}
          </label>
          <select
            value={url}
            onChange={(e) => onChange("url", e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{ backgroundColor: primaryColor + "1A", border: "1px solid " + primaryColor + "40", color: textColor }}
            onFocus={(e) => { e.currentTarget.style.borderColor = primaryColor; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = primaryColor + "40"; }}
          >
            <option value="" style={{ backgroundColor: secondaryColor, color: textColor }}>-- Seleccionar --</option>
            {(linkType === "CATEGORY" ? categories : products).map((item) => (
              <option key={item.id} value={item.id} style={{ backgroundColor: secondaryColor, color: textColor }}>{item.name}</option>
            ))}
          </select>
        </div>
      )}

      {linkType === "EXTERNAL" && (
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>
            URL completa
          </label>
          <div className="relative">
            <Input
              value={url}
              onChange={(value) => onChange("url", value)}
              placeholder="https://..."
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              className={cn(
                url && !url.startsWith("http")
                  ? "border-red-500/50 focus:border-red-500"
                  : ""
              )}
            />
            {url && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url.startsWith("http") ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            )}
          </div>
          {url && !url.startsWith("http") && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> La URL debe empezar con http:// o https://
            </p>
          )}
        </div>
      )}
    </>
  );
}
