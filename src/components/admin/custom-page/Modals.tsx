"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import GeneralDataFields from "@/components/admin/custom-page/page-builder/GeneralDataFields";
import SectionEditorCard from "@/components/admin/custom-page/page-builder/SectionEditorCard";
import ModalFooter from "@/components/admin/custom-page/page-builder/ModalFooter";
import type {
  PaginaPersonalizada,
  SeccionPaginaPersonalizada,
  ValorCampoPaginaPersonalizada,
} from "@/types/paginas-personalizadas";
import type { Prisma } from "@/../generated/prisma/client";

interface ItemEntrada {
  id?: string;
  title: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  link?: string | null;
  order?: number;
  config?: unknown;
}
interface SeccionEntrada {
  id?: string;
  type: SeccionPaginaPersonalizada["type"];
  title?: string | null;
  subtitle?: string | null;
  order?: number;
  config?: unknown;
  items?: ItemEntrada[];
}
interface PaginaEntrada {
  id?: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  isActive?: boolean;
  sections?: SeccionEntrada[];
}
type DatosPaginaGuardado = Parameters<
  typeof import("@/actions/paginas-personalizadas/actualizar-contenido-pagina")["actualizarContenidoPaginaPersonalizada"]
>[1] & { title: string; slug: string };

interface PropiedadesConstructorPagina {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pagina: DatosPaginaGuardado) => void;
  initialData?: PaginaEntrada | null;
  isSaving: boolean;
}

function analizarConfiguracion(texto?: string): Prisma.InputJsonValue | undefined {
  if (!texto) return undefined;
  try {
    return JSON.parse(texto) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

export function PageBuilderModal({ isOpen, onClose, onSave, initialData, isSaving }: PropiedadesConstructorPagina) {
  const [formData, setFormData] = useState<PaginaPersonalizada>({
    title: "", slug: "", subtitle: "", isActive: true, sections: []
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        sections: initialData.sections?.map((s) => ({
          ...s,
          config: null,
          configStr: s.config ? JSON.stringify(s.config, null, 2) : "",
          items: s.items?.map((i) => ({
            ...i,
            config: null,
            configStr: i.config ? JSON.stringify(i.config, null, 2) : ""
          })) || []
        })) || []
      });
    } else if (isOpen) {
      setFormData({ title: "", slug: "", subtitle: "", isActive: true, sections: [] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { type: "HERO", title: "", subtitle: "", order: formData.sections.length, configStr: "", items: [] }]
    });
  };

  const removeSection = (index: number) => {
    const newSections = [...formData.sections];
    newSections.splice(index, 1);
    setFormData({ ...formData, sections: newSections });
  };

  const updateSection = (index: number, field: string, value: ValorCampoPaginaPersonalizada) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const addItem = (sIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sIndex].items.push({ title: "", description: "", icon: "", order: newSections[sIndex].items.length, configStr: "" });
    setFormData({ ...formData, sections: newSections });
  };

  const removeItem = (sIndex: number, iIndex: number) => {
    const newSections = [...formData.sections];
    newSections[sIndex].items.splice(iIndex, 1);
    setFormData({ ...formData, sections: newSections });
  };

  const updateItem = (sIndex: number, iIndex: number, field: string, value: ValorCampoPaginaPersonalizada) => {
    const newSections = [...formData.sections];
    newSections[sIndex].items[iIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData: DatosPaginaGuardado = {
      title: formData.title,
      slug: formData.slug,
      subtitle: formData.subtitle ?? undefined,
      isActive: formData.isActive,
      sections: formData.sections.map((s, sIdx) => {
        const parsedConfig = analizarConfiguracion(s.configStr);
        return {
          type: s.type,
          title: s.title ?? undefined,
          subtitle: s.subtitle ?? undefined,
          order: sIdx,
          config: parsedConfig,
          items: s.items.map((i, iIdx) => {
            const itemConfig = analizarConfiguracion(i.configStr);
            return {
              title: i.title,
              description: i.description ?? undefined,
              image: i.image ?? undefined,
              icon: i.icon ?? undefined,
              link: i.link ?? undefined,
              order: iIdx,
              config: itemConfig,
            };
          })
        };
      })
    };
    onSave(processedData);
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] text-[var(--admin-texto)] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div
          className="z-10 flex items-center justify-between border-b border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-6 shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-black text-[var(--admin-texto)]">
              {initialData ? "Editar Página" : "Crear Nueva Página"}
            </h2>
            <p className="truncate text-sm font-medium text-[var(--admin-texto-suave)]">Configura la información, secciones y sus ítems.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-[var(--admin-primario-suave)] p-2 text-[var(--admin-primario)] transition-colors hover:opacity-80"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[var(--admin-fondo)] p-6">
          <form id="page-builder-form" onSubmit={handleSubmit} className="space-y-8">
            <GeneralDataFields
              formData={formData}
              onChange={setFormData}
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--admin-texto)]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--admin-primario)] text-xs font-bold text-[var(--admin-primario-texto)]">
                    2
                  </span>
                  Constructor de Secciones
                </h3>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[var(--admin-primario)] px-4 py-2 text-sm font-bold text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90"
                >
                  <Plus size={16} /> Agregar Sección
                </button>
              </div>

              <div className="space-y-6">
                {formData.sections.map((section, sIdx) => (
                  <SectionEditorCard
                    key={sIdx}
                    section={section}
                    sIdx={sIdx}
                    onChangeSection={updateSection}
                    onRemoveSection={removeSection}
                    onChangeItem={updateItem}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                  />
                ))}

                {formData.sections.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] py-10 text-center">
                    <p className="text-sm font-medium text-[var(--admin-texto-suave)]">
                      Empieza agregando tu primera sección (Hero, Texto, etc.)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <ModalFooter
          onClose={onClose}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
