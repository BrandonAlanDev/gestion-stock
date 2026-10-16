"use client";

import type { PaginaPersonalizada, ValorCampoPaginaPersonalizada } from "@/types/paginas-personalizadas";

export default function GeneralDataFields({
  formData,
  onChange,
}: {
  formData: PaginaPersonalizada;
  onChange: (data: PaginaPersonalizada) => void;
}) {
  const update = (field: string, value: ValorCampoPaginaPersonalizada) => onChange({ ...formData, [field]: value });

  return (
    <div
      className="space-y-4 rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-6 shadow-sm"
    >
      <h3
        className="mb-4 flex items-center gap-2 border-b border-[var(--admin-borde)] pb-2 text-lg font-bold text-[var(--admin-texto)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-primario)] text-xs font-bold text-[var(--admin-primario-texto)]">
          1
        </span>
        Datos Generales
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--admin-texto)]">Título</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-[var(--admin-texto)] outline-none transition-colors placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)]"
            placeholder="Ej: Sobre nosotros"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--admin-texto)]">Slug (URL)</label>
          <input
            required
            type="text"
            value={formData.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-[var(--admin-texto)] outline-none transition-colors placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)]"
            placeholder="Ej: sobre-nosotros"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[var(--admin-texto)]">Subtítulo (Opcional)</label>
        <textarea
          value={formData.subtitle || ""}
          onChange={(e) => update("subtitle", e.target.value)}
          className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-[var(--admin-texto)] outline-none transition-colors placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)]"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => update("isActive", e.target.checked)}
          className="h-5 w-5 cursor-pointer rounded accent-[var(--admin-primario)] outline-none"
        />
        <label htmlFor="isActive" className="cursor-pointer text-sm font-bold text-[var(--admin-texto)]">
          Página Activa (Pública)
        </label>
      </div>
    </div>
  );
}
