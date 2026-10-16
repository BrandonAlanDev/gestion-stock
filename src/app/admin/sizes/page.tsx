"use client";

import { useEffect, useState } from "react";
import { addSizeToType } from "@/actions/talles/agregar-talle-a-tipo";
import { createSizeType } from "@/actions/talles/crear-tipo-talle";
import { deleteSize } from "@/actions/talles/eliminar-talle";
import { deleteSizeType } from "@/actions/talles/eliminar-tipo-talle";
import { getSizeTypes } from "@/actions/talles/obtener-tipos-talle";
import { updateSize } from "@/actions/talles/actualizar-talle";
import { updateSizeType } from "@/actions/talles/actualizar-tipo-talle";
import { Ruler, Plus, Trash2, Edit, Layers, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SizeTypeModal from "@/components/admin/sizes/SizeTypeModal";
import SizeModal from "@/components/admin/sizes/SizeModal";

type TiposTalle = Awaited<ReturnType<typeof getSizeTypes>>;
type TipoTalle = TiposTalle[number];
type Talle = TipoTalle["sizes"][number];

export default function SizesPage() {
  const [sizeTypes, setSizeTypes] = useState<TiposTalle>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Estados de modales
  const [typeModal, setTypeModal] = useState<{ isOpen: boolean; data: TipoTalle | null }>({ isOpen: false, data: null });
  const [sizeModal, setSizeModal] = useState<{ isOpen: boolean; typeId: string; data: Talle | null }>({ isOpen: false, typeId: "", data: null });

  const fetchSizes = async () => {
    setLoading(true);
    const data = await getSizeTypes();
    setSizeTypes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  // --- HANDLERS: SIZE TYPES (GRUPOS) ---
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return toast.error("Ingresa un nombre para el grupo");

    const res = await createSizeType(newTypeName);
    if (res?.error) return toast.error(res.error);

    setNewTypeName("");
    fetchSizes();
    toast.success("Grupo de talles creado");
  };

  const handleUpdateGroup = async (id: string, name: string) => {
    const res = await updateSizeType(id, name);
    if (res?.error) toast.error(res.error);
    else { toast.success("Grupo actualizado"); fetchSizes(); }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`¿Borrar el grupo "${name}"?`)) return;
    setIsDeleting(id);
    const res = await deleteSizeType(id);
    if (res?.error) toast.error(res.error);
    else { toast.info("Grupo eliminado"); fetchSizes(); }
    setIsDeleting(null);
  };

  // --- HANDLERS: SIZES (TALLES) ---
  const handleSaveSize = async (data: { id?: string; sizeTypeId: string; value: string; order: number }) => {
    if (data.id) {
      const res = await updateSize(data.id, data.value, data.order);
      if (res?.error) {
        toast.error(res.error);
        return; // <-- Retorno vacío
      }
      toast.success("Talle actualizado");
    } else {
      const res = await addSizeToType(data.sizeTypeId, data.value, data.order);
      if (res?.error) {
        toast.error(res.error);
        return; // <-- Retorno vacío
      }
      toast.success("Talle agregado");
    }
    fetchSizes();
  };
  const handleDeleteSize = async (id: string) => {
    if (!confirm("¿Eliminar este talle?")) return;
    const res = await deleteSize(id);
    if (res?.error) toast.error(res.error);
    else { toast.success("Talle eliminado"); fetchSizes(); }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--admin-fondo)] p-6 pt-12 text-[var(--admin-texto)] transition-colors duration-200 sm:p-8">
      <div className="p-0 max-w-6xl mx-auto space-y-8 pt-12 sm:p-8">
        
        <div className="flex items-end justify-between border-b border-[var(--admin-borde)] pb-6">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-black uppercase italic tracking-tighter text-[var(--admin-texto)]">
              <Ruler className="text-[var(--admin-primario)]" size={32} />
              Gestión de Talles
            </h1>
            <p className="mt-2 text-xs font-light uppercase tracking-[0.3em] text-[var(--admin-texto-suave)]">
              Configura las curvas de talles para tus categorías
            </p>
          </div>
        </div>

        {/* Creador Rápido de Grupos */}
        <form 
          onSubmit={handleCreateGroup} 
          className="relative overflow-hidden rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-6 shadow-xl"
        >
          <div className="absolute left-0 top-0 h-full w-1 bg-[var(--admin-primario)]" />
          <h3 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--admin-primario)]">
            <Layers size={14} /> Nuevo Grupo
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input 
              className="w-full flex-1 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-1 focus:ring-[var(--admin-primario)]"
              placeholder="Nombre del grupo (ej: Calzados, Remeras...)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
            />
            <button 
              type="submit" 
              className="w-full rounded-xl bg-[var(--admin-primario)] px-8 text-sm font-bold uppercase tracking-tighter text-[var(--admin-primario-texto)] shadow-md transition-all hover:opacity-90 sm:w-auto"
            >
              Crear Grupo
            </button>
          </div>
        </form>

        {/* Lista de Grupos y Curvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 animate-pulse">Sincronizando curvas...</div>
          ) : sizeTypes.map(type => (
            <div key={type.id} className="relative space-y-6 rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-6 shadow-md transition-all">
              
              {/* Header del Grupo */}
              <div className="flex items-center justify-between border-b border-[var(--admin-borde)] pb-4">
                <h3 className="flex items-center gap-2 text-lg font-black italic uppercase tracking-tighter text-[var(--admin-texto)]">
                  <ChevronRight className="text-[var(--admin-primario)]" size={18} />
                  {type.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTypeModal({ isOpen: true, data: type })} 
                    className="opacity-50 transition-colors hover:text-[var(--admin-primario)]"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(type.id, type.name)} 
                    className="opacity-50 transition-colors hover:text-[var(--admin-peligro)]"
                  >
                    {isDeleting === type.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              {/* Talles del Grupo */}
              <div className="flex flex-wrap gap-2 min-h-[50px] items-center">
                {type.sizes
                  .sort((a, b) => a.order - b.order) // Ordenar por campo order
                  .map((s) => (
                  <div key={s.id} className="group flex items-center gap-2 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-1.5">
                    <span className="text-xs font-black text-[var(--admin-texto)]">{s.value}</span>
                    <div className="ml-2 flex items-center gap-1 border-l border-[var(--admin-borde)] pl-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button onClick={() => setSizeModal({ isOpen: true, typeId: type.id, data: s })} className="hover:text-[var(--admin-primario)]">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDeleteSize(s.id)} className="hover:text-[var(--admin-peligro)]">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Botón Agregar Talle */}
                <button 
                  onClick={() => setSizeModal({ isOpen: true, typeId: type.id, data: null })}
                  className="ml-1 flex items-center gap-1 rounded-xl border border-dashed border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-1.5 text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
                >
                  <Plus size={12} />
                  <span className="text-xs font-bold opacity-70">Agregar</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Modales */}
      <SizeTypeModal 
        isOpen={typeModal.isOpen} 
        onClose={() => setTypeModal({ isOpen: false, data: null })} 
        initialData={typeModal.data}
        onSave={handleUpdateGroup}
      />
      
      <SizeModal 
        isOpen={sizeModal.isOpen} 
        onClose={() => setSizeModal({ isOpen: false, typeId: "", data: null })} 
        sizeTypeId={sizeModal.typeId}
        initialData={sizeModal.data}
        onSave={handleSaveSize}
      />

    </div>
  );
}
