"use client";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, AlertTriangle } from "lucide-react";

/* =====================================================
   MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
===================================================== */
export function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 text-red-600 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-black">Eliminar Página</h2>
        </div>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro que deseas eliminar la página <b>{itemName}</b>? Esta acción eliminará también todas sus secciones y los ítems que contengan. <b>Esta acción no se puede deshacer.</b>
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isDeleting} className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2">
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
export function ViewPageModal({ isOpen, onClose, page, primaryColor, contrastColor }: any) {
  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-black" style={{ color: primaryColor }}>{page.title}</h2>
            <p className="text-sm text-gray-500">/{page.slug} • {page.sections?.length || 0} Secciones</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-6">
          {page.subtitle && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Subtítulo de la Página</h4>
              <p className="text-gray-700">{page.subtitle}</p>
            </div>
          )}

          {page.sections?.map((section: any, sIdx: number) => (
            <div key={section.id || sIdx} className="bg-white border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span 
                  className="px-3 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                >
                  {section.type}
                </span>
                <h3 className="font-bold text-lg">{section.title || "Sin título"}</h3>
              </div>
              {section.subtitle && <p className="text-sm text-gray-600 mb-4">{section.subtitle}</p>}
              
              {section.items && section.items.length > 0 && (
                <div className="mt-4 space-y-3 pl-4 border-l-2" style={{ borderColor: primaryColor }}>
                  {section.items.map((item: any, iIdx: number) => (
                    <div key={item.id || iIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        {item.icon && <span style={{ color: primaryColor }}>[{item.icon}]</span>}
                        {item.title}
                      </h4>
                      {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
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
export function PageBuilderModal({ isOpen, onClose, onSave, initialData, isSaving, primaryColor, contrastColor }: any) {
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    subtitle: "",
    isActive: true,
    sections: []
  });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        <div className="p-6 border-b flex justify-between items-center bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-2xl font-black" style={{ color: primaryColor }}>
              {initialData ? "Editar Página" : "Crear Nueva Página"}
            </h2>
            <p className="text-sm text-gray-500">Configura la información, secciones y sus ítems.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="page-builder-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2">
                <span 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                >
                  1
                </span>
                Datos Generales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Título</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white outline-none transition-colors" placeholder="Ej: Plan de Ahorro" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Slug (URL)</label>
                  <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white outline-none transition-colors" placeholder="Ej: ahorro" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Subtítulo (Opcional)</label>
                <textarea value={formData.subtitle || ""} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full p-3 rounded-xl border bg-gray-50 focus:bg-white outline-none transition-colors" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded border-gray-300 outline-none" style={{ accentColor: primaryColor }} />
                <label htmlFor="isActive" className="font-bold text-sm">Página Activa (Pública)</label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: primaryColor, color: contrastColor }}
                  >
                    2
                  </span>
                  Constructor de Secciones
                </h3>
                <button 
                  type="button" 
                  onClick={addSection} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor, color: contrastColor }}
                >
                  <Plus size={16} /> Agregar Sección
                </button>
              </div>

              <div className="space-y-6">
                {formData.sections.map((section: any, sIdx: number) => (
                  <div key={sIdx} className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: `${primaryColor}30` }}>
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="font-black" style={{ color: primaryColor }}>#{sIdx + 1}</span>
                        <select 
                          value={section.type} 
                          onChange={(e) => updateSection(sIdx, "type", e.target.value)}
                          className="p-2 rounded-lg border font-bold text-sm bg-white outline-none"
                        >
                          {sectionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <button type="button" onClick={() => removeSection(sIdx)} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Título de Sección</label>
                          <input type="text" value={section.title || ""} onChange={(e) => updateSection(sIdx, "title", e.target.value)} className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Configuración JSON (Opcional)</label>
                          <input type="text" value={section.configStr || ""} onChange={(e) => updateSection(sIdx, "configStr", e.target.value)} placeholder='{"estilo": "oscuro"}' className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none text-sm font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Subtítulo / Descripción</label>
                        <textarea value={section.subtitle || ""} onChange={(e) => updateSection(sIdx, "subtitle", e.target.value)} className="w-full p-2.5 rounded-xl border bg-gray-50 outline-none text-sm" rows={2} />
                      </div>

                      <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-sm text-gray-700">Ítems de esta sección</h4>
                          <button 
                            type="button" 
                            onClick={() => addItem(sIdx)} 
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                          >
                            <Plus size={14} /> Añadir Ítem
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {section.items.map((item: any, iIdx: number) => (
                            <div key={iIdx} className="p-4 rounded-xl border bg-gray-50 flex gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <input type="text" placeholder="Título del ítem" required value={item.title || ""} onChange={(e) => updateItem(sIdx, iIdx, "title", e.target.value)} className="w-full p-2 rounded-lg border outline-none text-sm focus:border-gray-400" />
                                  <input type="text" placeholder="Icono (ej: TrendingUp)" value={item.icon || ""} onChange={(e) => updateItem(sIdx, iIdx, "icon", e.target.value)} className="w-full p-2 rounded-lg border outline-none text-sm focus:border-gray-400" />
                                </div>
                                <textarea placeholder="Descripción del ítem" value={item.description || ""} onChange={(e) => updateItem(sIdx, iIdx, "description", e.target.value)} className="w-full p-2 rounded-lg border outline-none text-sm focus:border-gray-400" rows={1} />
                                <input type="text" placeholder='Config JSON (Ej: {"stepNumber": "01"})' value={item.configStr || ""} onChange={(e) => updateItem(sIdx, iIdx, "configStr", e.target.value)} className="w-full p-2 rounded-lg border outline-none text-sm font-mono focus:border-gray-400" />
                              </div>
                              <button type="button" onClick={() => removeItem(sIdx, iIdx)} className="text-red-400 hover:text-red-600 mt-2 h-fit">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          {section.items.length === 0 && (
                            <p className="text-xs text-center text-gray-400 py-2 border border-dashed rounded-xl">No hay ítems en esta sección</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.sections.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-2xl border border-dashed">
                    <p className="text-gray-400 text-sm">Empieza agregando tu primera sección (Hero, Texto, etc.)</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3 shadow-lg z-10">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancelar
          </button>
          <button 
            type="submit" 
            form="page-builder-form" 
            disabled={isSaving} 
            className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 hover:opacity-90" 
            style={{ backgroundColor: primaryColor, color: contrastColor }}
          >
            <Save size={18} />
            {isSaving ? "Guardando..." : "Guardar Página Dinámica"}
          </button>
        </div>

      </div>
    </div>
  );
}