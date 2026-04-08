"use client";

import { useEffect, useState } from "react";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/actions/garments"; 
import { type CategoryInput, categorySchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { X, Tag, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CategoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryInput>({ name: "", description: "" });

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse(formData);
    if (!result.success) {
      toast.error("Datos inválidos");
      return;
    }

    const res = editingId 
      ? await updateCategory(editingId, formData) 
      : await createCategory(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingId ? "Categoría actualizada" : "Categoría creada");
      setFormData({ name: "", description: "" });
      setEditingId(null);
      fetchCategories();
    }
  };

  if (!isOpen) return (
    <Button variant="blanco" onClick={() => setIsOpen(true)}>
      Categorías
    </Button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900 sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
              <Tag size={18} className="text-amber-500" />
              Gestión de Categorías
            </h2>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Crear y organizar tipos de prendas</p>
          </div>
          <button onClick={handleClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-2">
              {editingId ? "Editar Categoría" : "Nueva Categoría"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <input 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                  placeholder="Nombre (ej: Zapatillas)"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <input 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-sm text-white outline-none focus:border-amber-500 transition-colors"
                  placeholder="Descripción (opcional)"
                  value={formData.description || ""}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="amarillo" className="flex-1 font-bold uppercase text-xs">
                {editingId ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
              {editingId && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {setEditingId(null); setFormData({name:"", description:""})}}
                  className="text-neutral-400"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          {/* Tabla de Categorías */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Categorías Existentes</h3>
            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-neutral-950/50">
              <table className="w-full text-left text-sm text-neutral-400">
                <thead className="bg-neutral-900/50 text-neutral-600 uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-5 py-3">Nombre</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {loading && categories.length === 0 ? (
                    <tr><td colSpan={2} className="px-5 py-8 text-center text-xs animate-pulse">Cargando...</td></tr>
                  ) : categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-bold text-neutral-200 group-hover:text-amber-500 transition-colors italic">{cat.name}</div>
                        <div className="text-[10px] text-neutral-600 truncate max-w-[250px]">{cat.description || "Sin descripción"}</div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => {setEditingId(cat.id); setFormData({name: cat.name, description: cat.description || ""})}} 
                            className="p-2 text-neutral-600 hover:text-white transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={async () => { if(confirm("¿Seguro que quieres eliminar esta categoría?")) { await deleteCategory(cat.id); fetchCategories(); } }} 
                            className="p-2 text-neutral-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}