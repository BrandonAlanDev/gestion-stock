"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import GeneralDataFields from "./page-builder/GeneralDataFields";
import SectionEditorCard from "./page-builder/SectionEditorCard";
import ModalFooter from "./page-builder/ModalFooter";
import type {
  PaginaPersonalizada,
  SeccionPaginaPersonalizada,
  ValorCampoPaginaPersonalizada,
} from "@/types/paginas-personalizadas";
import type { Prisma } from "../../../../generated/prisma/client";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

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
  typeof import("@/actions/custom-page-builder.actions")["updateCustomPageContent"]
>[1] & { title: string; slug: string };

interface PropiedadesConstructorPagina {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pagina: DatosPaginaGuardado) => void;
  initialData?: PaginaEntrada | null;
  isSaving: boolean;
  primaryColor: string;
  secondaryColor: string;
}

function analizarConfiguracion(texto?: string): Prisma.InputJsonValue | undefined {
  if (!texto) return undefined;
  try {
    return JSON.parse(texto) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

export function PageBuilderModal({ isOpen, onClose, onSave, initialData, isSaving, primaryColor, secondaryColor }: PropiedadesConstructorPagina) {
  const [formData, setFormData] = useState<PaginaPersonalizada>({
    title: "", slug: "", subtitle: "", isActive: true, sections: []
  });

  const textContrast = getContrastColor(secondaryColor);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div
        className="rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        style={{ backgroundColor: secondaryColor }}
      >
        <div
          className="p-6 flex justify-between items-center z-10 shadow-sm"
          style={{ backgroundColor: secondaryColor, borderBottom: `1px solid ${primaryColor}20` }}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black truncate" style={{ color: primaryColor }}>
              {initialData ? "Editar Página" : "Crear Nueva Página"}
            </h2>
            <p className="text-sm font-medium truncate" style={{ color: textContrast }}>Configura la información, secciones y sus ítems.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all hover:opacity-80"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1" style={{ backgroundColor: `${primaryColor}03` }}>
          <form id="page-builder-form" onSubmit={handleSubmit} className="space-y-8">
            <GeneralDataFields
              formData={formData}
              onChange={setFormData}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: primaryColor }}>
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
                  >
                    2
                  </span>
                  Constructor de Secciones
                </h3>
                <button
                  type="button"
                  onClick={addSection}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
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
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                  />
                ))}

                {formData.sections.length === 0 && (
                  <div
                    className="text-center py-10 rounded-2xl border border-dashed"
                    style={{ backgroundColor: secondaryColor, borderColor: `${primaryColor}30` }}
                  >
                    <p className="text-sm font-medium" style={{ color: textContrast }}>
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
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </div>
    </div>
  );
}
