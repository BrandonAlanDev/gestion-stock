"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, AlertTriangle } from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

/* =====================================================
   MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
===================================================== */
export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting, primaryColor, secondaryColor }: any) {
  if (!isOpen) return null;

  const textContrast = getContrastColor(secondaryColor);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
    >
      <div 
        className="rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: secondaryColor, color: textContrast }}
      >
        <div className="flex items-center gap-4 mb-4" style={{ color: "#ef4444" }}>
          <div className="p-3 rounded-full" style={{ backgroundColor: "#ef444415" }}>
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-black">Eliminar Página</h2>
        </div>
        
        <p className="mb-6" style={{ color: textContrast }}>
          ¿Estás seguro que deseas eliminar la página <b>{itemName}</b>? Esta acción eliminará también todas sus secciones y los ítems que contengan. <b>Esta acción no se puede deshacer.</b>
        </p>
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isDeleting} 
            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isDeleting} 
            className="px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   MODAL VISOR DE INFORMACIÓN (READ-ONLY)
===================================================== */
export function ViewPageModal({ isOpen, onClose, page, primaryColor, secondaryColor }: any) {
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

/* =====================================================
   MODAL CREADOR / EDITOR (PAGE BUILDER)
===================================================== */
export function PageBuilderModal({ isOpen, onClose, onSave, initialData, isSaving, primaryColor, secondaryColor }: any) {
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    subtitle: "",
    isActive: true,
    sections: []
  });

  const textContrast = getContrastColor(secondaryColor);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        ...initialData,
        sections: initialData.sections?.map((s:any) => ({
          ...s,
          configStr: s.config ? JSON.stringify(s.config, null, 2) : "",
          items: s.items?.map((i:any) => ({
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
      sections: formData.sections.map((s:any, sIdx: number) => {
        let parsedConfig = null;
        try { if(s.configStr) parsedConfig = JSON.parse(s.configStr); } catch(e) {}
        
        return {
          ...s,
          order: sIdx,
          config: parsedConfig,
          items: s.items.map((i:any, iIdx: number) => {
            let itemConfig = null;
            try { if(i.configStr) itemConfig = JSON.parse(i.configStr); } catch(e) {}
            return { ...i, order: iIdx, config: itemConfig };
          })
        };
      })
    };
    onSave(processedData);
  };

  const sectionTypes = ["HERO", "TEXT", "CARDS", "FAQ", "TIMELINE", "CTA", "GALLERY", "FEATURES"];

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
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
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
                    onChange={(e) => setFormData({...formData, slug: e.target.value})} 
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
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})} 
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
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                  className="w-5 h-5 rounded outline-none cursor-pointer" 
                  style={{ accentColor: primaryColor }} 
                />
                <label htmlFor="isActive" className="font-bold text-sm cursor-pointer" style={{ color: textContrast }}>
                  Página Activa (Pública)
                </label>
              </div>
            </div>

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
                  <div 
                    key={sIdx} 
                    className="rounded-2xl border shadow-sm overflow-hidden" 
                    style={{ backgroundColor: secondaryColor, borderColor: `${primaryColor}30` }}
                  >
                    <div 
                      className="p-4 flex justify-between items-center"
                      style={{ backgroundColor: `${primaryColor}05`, borderBottom: `1px solid ${primaryColor}15` }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black" style={{ color: primaryColor }}>#{sIdx + 1}</span>
                        <select 
                          value={section.type} 
                          onChange={(e) => updateSection(sIdx, "type", e.target.value)}
                          className="p-2 rounded-lg border font-bold text-sm outline-none cursor-pointer"
                          style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}30` }}
                        >
                          {sectionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeSection(sIdx)} 
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
                            onChange={(e) => updateSection(sIdx, "title", e.target.value)} 
                            className="w-full p-2.5 rounded-xl border outline-none text-sm focus:opacity-90" 
                            style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1" style={{ color: textContrast }}>Configuración JSON (Opcional)</label>
                          <input 
                            type="text" 
                            value={section.configStr || ""} 
                            onChange={(e) => updateSection(sIdx, "configStr", e.target.value)} 
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
                          onChange={(e) => updateSection(sIdx, "subtitle", e.target.value)} 
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
                            onClick={() => addItem(sIdx)} 
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
                                <div className="grid grid-cols-2 gap-3">
                                  <input 
                                    type="text" 
                                    placeholder="Título del ítem" 
                                    required 
                                    value={item.title || ""} 
                                    onChange={(e) => updateItem(sIdx, iIdx, "title", e.target.value)} 
                                    className="w-full p-2 rounded-lg border outline-none text-sm focus:opacity-90" 
                                    style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                                  />
                                  <input 
                                    type="text" 
                                    placeholder="Icono (ej: TrendingUp)" 
                                    value={item.icon || ""} 
                                    onChange={(e) => updateItem(sIdx, iIdx, "icon", e.target.value)} 
                                    className="w-full p-2 rounded-lg border outline-none text-sm focus:opacity-90" 
                                    style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                                  />
                                </div>
                                <textarea 
                                  placeholder="Descripción del ítem" 
                                  value={item.description || ""} 
                                  onChange={(e) => updateItem(sIdx, iIdx, "description", e.target.value)} 
                                  className="w-full p-2 rounded-lg border outline-none text-sm focus:opacity-90" 
                                  rows={1} 
                                  style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                                />
                                <input 
                                  type="text" 
                                  placeholder='Config JSON (Ej: {"stepNumber": "01"})' 
                                  value={item.configStr || ""} 
                                  onChange={(e) => updateItem(sIdx, iIdx, "configStr", e.target.value)} 
                                  className="w-full p-2 rounded-lg border outline-none text-sm font-mono focus:opacity-90" 
                                  style={{ backgroundColor: secondaryColor, color: textContrast, borderColor: `${primaryColor}20` }}
                                />
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeItem(sIdx, iIdx)} 
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

        <div 
          className="p-4 border-t flex justify-end gap-3 shadow-lg z-10"
          style={{ backgroundColor: secondaryColor, borderTop: `1px solid ${primaryColor}20` }}
        >
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSaving} 
            className="px-6 py-3 rounded-xl font-bold transition-all hover:opacity-80"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="page-builder-form" 
            disabled={isSaving} 
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 hover:opacity-90" 
            style={{ backgroundColor: primaryColor, color: getContrastColor(primaryColor) }}
          >
            <Save size={18} />
            {isSaving ? "Guardando..." : "Guardar Página Dinámica"}
          </button>
        </div>

      </div>
    </div>
  );
}