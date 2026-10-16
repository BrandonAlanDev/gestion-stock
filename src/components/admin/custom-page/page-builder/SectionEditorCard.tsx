"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  SeccionPaginaPersonalizada,
  ValorCampoPaginaPersonalizada,
} from "@/types/paginas-personalizadas";

const sectionTypes = ["HERO", "TEXT", "CARDS", "FAQ", "TIMELINE", "CTA", "GALLERY", "FEATURES"];

export default function SectionEditorCard({
  section,
  sIdx,
  onChangeSection,
  onRemoveSection,
  onChangeItem,
  onAddItem,
  onRemoveItem,
}: {
  section: SeccionPaginaPersonalizada;
  sIdx: number;
  onChangeSection: (index: number, field: string, value: ValorCampoPaginaPersonalizada) => void;
  onRemoveSection: (index: number) => void;
  onChangeItem: (sIndex: number, iIndex: number, field: string, value: ValorCampoPaginaPersonalizada) => void;
  onAddItem: (sIndex: number) => void;
  onRemoveItem: (sIndex: number, iIndex: number) => void;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] shadow-sm"
    >
      <div
        className="flex items-center justify-between gap-2 border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 font-black text-[var(--admin-primario)]">#{sIdx + 1}</span>
          <select
            value={section.type}
            onChange={(e) => onChangeSection(sIdx, "type", e.target.value)}
            className="min-w-0 cursor-pointer rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2 text-sm font-bold text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
          >
            {sectionTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onRemoveSection(sIdx)}
          className="p-2 text-[var(--admin-peligro)] transition-opacity hover:opacity-70"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--admin-texto)]">Título de Sección</label>
            <input
              type="text"
              value={section.title || ""}
              onChange={(e) => onChangeSection(sIdx, "title", e.target.value)}
              className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2.5 text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[var(--admin-texto)]">Configuración JSON (Opcional)</label>
            <input
              type="text"
              value={section.configStr || ""}
              onChange={(e) => onChangeSection(sIdx, "configStr", e.target.value)}
              placeholder='{"estilo": "oscuro"}'
              className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2.5 font-mono text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[var(--admin-texto)]">Subtítulo / Descripción</label>
          <textarea
            value={section.subtitle || ""}
            onChange={(e) => onChangeSection(sIdx, "subtitle", e.target.value)}
            className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2.5 text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
            rows={2}
          />
        </div>

        <div className="mt-6 border-t border-[var(--admin-borde)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-[var(--admin-texto)]">Ítems de esta sección</h4>
            <button
              type="button"
              onClick={() => onAddItem(sIdx)}
              className="flex items-center gap-1 rounded-lg bg-[var(--admin-primario-suave)] px-3 py-1.5 text-xs font-bold text-[var(--admin-primario)] transition-opacity hover:opacity-80"
            >
              <Plus size={14} /> Añadir Ítem
            </button>
          </div>

          <div className="space-y-3">
            {section.items.map((item, iIdx) => (
              <div
                key={iIdx}
                className="flex gap-4 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-4"
              >
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Título del ítem"
                      required
                      value={item.title || ""}
                      onChange={(e) => onChangeItem(sIdx, iIdx, "title", e.target.value)}
                      className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2 text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
                    />
                    <input
                      type="text"
                      placeholder="Icono (ej: TrendingUp)"
                      value={item.icon || ""}
                      onChange={(e) => onChangeItem(sIdx, iIdx, "icon", e.target.value)}
                      className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2 text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
                    />
                  </div>
                  <textarea
                    placeholder="Descripción del ítem"
                    value={item.description || ""}
                    onChange={(e) => onChangeItem(sIdx, iIdx, "description", e.target.value)}
                    className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2 text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
                    rows={1}
                  />
                  <input
                    type="text"
                    placeholder='Config JSON (Ej: {"stepNumber": "01"})'
                    value={item.configStr || ""}
                    onChange={(e) => onChangeItem(sIdx, iIdx, "configStr", e.target.value)}
                    className="w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-2 font-mono text-sm text-[var(--admin-texto)] outline-none focus:border-[var(--admin-primario)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(sIdx, iIdx)}
                  className="mt-2 h-fit text-[var(--admin-peligro)] transition-opacity hover:opacity-70"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {section.items.length === 0 && (
              <p
                className="rounded-xl border border-dashed border-[var(--admin-borde)] py-2 text-center text-xs text-[var(--admin-texto-suave)]"
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
