"use client";

import { AlertCircle, CheckCircle } from "lucide-react";
import { combinarClases as cn } from "@/lib/utilidades/combinar-clases";
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
}

export default function LinkTypeSelector({
  linkType,
  url,
  onChange,
  products,
  categories,
}: LinkTypeSelectorProps) {
  return (
    <>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[var(--admin-texto)]">Destino del enlace</label>
        <select
          value={linkType}
          onChange={(e) => onChange("linkType", e.target.value)}
          className="w-full cursor-pointer rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20"
        >
          {LINK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {(linkType === "CATEGORY" || linkType === "PRODUCT") && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--admin-texto)]">
            {linkType === "CATEGORY" ? "Seleccionar categoría" : "Seleccionar producto"}
          </label>
          <select
            value={url}
            onChange={(e) => onChange("url", e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-4 py-2.5 text-sm text-[var(--admin-texto)] outline-none transition-all duration-200 focus:border-[var(--admin-primario)] focus:ring-2 focus:ring-[var(--admin-primario)]/20"
          >
            <option value="">-- Seleccionar --</option>
            {(linkType === "CATEGORY" ? categories : products).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
      )}

      {linkType === "EXTERNAL" && (
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-[var(--admin-texto)]">
            URL completa
          </label>
          <div className="relative">
            <Input
              value={url}
              onChange={(value) => onChange("url", value)}
              placeholder="https://..."
              className={cn(
                url && !url.startsWith("http")
                  ? "border-[var(--admin-peligro)] focus:border-[var(--admin-peligro)]"
                  : ""
              )}
            />
            {url && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {url.startsWith("http") ? (
                  <CheckCircle className="w-5 h-5 text-[var(--admin-exito)]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[var(--admin-peligro)]" />
                )}
              </div>
            )}
          </div>
          {url && !url.startsWith("http") && (
            <p className="flex items-center gap-1 text-xs text-[var(--admin-peligro)]">
              <AlertCircle className="w-3 h-3" /> La URL debe empezar con http:// o https://
            </p>
          )}
        </div>
      )}
    </>
  );
}
