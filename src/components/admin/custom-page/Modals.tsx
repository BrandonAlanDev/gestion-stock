"use client";

import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewPageModal from "./ViewPageModal";
import GeneralDataFields from "./page-builder/GeneralDataFields";
import SectionEditorCard from "./page-builder/SectionEditorCard";
import ModalFooter from "./page-builder/ModalFooter";

export { DeleteConfirmModal, ViewPageModal };

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export function PageBuilderModal({ isOpen, onClose, onSave, initialData, isSaving, primaryColor, secondaryColor }: any) {
  const [formData, setFormData] = useState<any>({
    title: "", slug: "", subtitle: "", isActive: true, sections: []
  });

  const textContrast = getContrastColor(secondaryColor);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        sections: initialData.sections?.map((s: any) => ({
          ...s,
          configStr: s.config ? JSON.stringify(s.config, null, 2) : "",
          items: s.items?.map((i: any) => ({
            ...i,
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

  const updateSection = (index: number, field: string, value: any) => {
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

  const updateItem = (sIndex: number, iIndex: number, field: string, value: any) => {
    const newSections = [...formData.sections];
    newSections[sIndex].items[iIndex][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      sections: formData.sections.map((s: any, sIdx: number) => {
        let parsedConfig = null;
        try { if (s.configStr) parsedConfig = JSON.parse(s.configStr); } catch (e) { }
        return {
          ...s,
          order: sIdx,
          config: parsedConfig,
          items: s.items.map((i: any, iIdx: number) => {
            let itemConfig = null;
            try { if (i.configStr) itemConfig = JSON.parse(i.configStr); } catch (e) { }
            return { ...i, order: iIdx, config: itemConfig };
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
          <div>
            <h2 className="text-2xl font-black" style={{ color: primaryColor }}>
              {initialData ? "Editar Página" : "Crear Nueva Página"}
            </h2>
            <p className="text-sm font-medium" style={{ color: textContrast }}>Configura la información, secciones y sus ítems.</p>
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
              <div className="flex items-center justify-between mb-4">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
                >
                  <Plus size={16} /> Agregar Sección
                </button>
              </div>

              <div className="space-y-6">
                {formData.sections.map((section: any, sIdx: number) => (
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
