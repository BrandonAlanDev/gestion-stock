"use client";

import { useEffect, useState } from "react";
import { addSizeToType } from "@/actions/talles/agregar-talle-a-tipo";
import { createSizeType } from "@/actions/talles/crear-tipo-talle";
import { deleteSize } from "@/actions/talles/eliminar-talle";
import { deleteSizeType } from "@/actions/talles/eliminar-tipo-talle";
import { getSizeTypes } from "@/actions/talles/obtener-tipos-talle";
import { updateSize } from "@/actions/talles/actualizar-talle";
import { updateSizeType } from "@/actions/talles/actualizar-tipo-talle";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SizeTypeModal from "@/components/admin/sizes/SizeTypeModal";
import SizeModal from "@/components/admin/sizes/SizeModal";
import { SkeletonTarjetas } from "@/components/ui/skeleton-vistas";

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
    <div className="mx-auto max-w-7xl px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
      <div className="space-y-6">
        
        <div>
          <div>
            <h1>Talles</h1>
            <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">
              Configurá los grupos y valores disponibles para tus productos.
            </p>
          </div>
        </div>

        {/* Creador Rápido de Grupos */}
        <form 
          onSubmit={handleCreateGroup} 
          className="rounded-lg bg-[var(--admin-fondo-opaco)] p-5"
        >
          <h2 className="mb-4 text-base font-semibold">Nuevo grupo</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input 
              className="w-full flex-1 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-1 focus:ring-[var(--admin-primario)]"
              placeholder="Nombre del grupo (ej: Calzados, Remeras...)"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
            />
            <button 
              type="submit" 
              className="w-full rounded-md bg-[var(--admin-primario)] px-5 py-2.5 text-sm font-semibold text-[var(--admin-primario-texto)] transition-all hover:opacity-90 sm:w-auto"
            >
              Crear grupo
            </button>
          </div>
        </form>

        {/* Lista de Grupos y Curvas */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {loading ? (
            <div className="col-span-full"><SkeletonTarjetas cantidad={4} /></div>
          ) : sizeTypes.map(type => (
            <div key={type.id} className="space-y-5 rounded-lg bg-[var(--admin-fondo-opaco)] p-5">
              
              {/* Header del Grupo */}
              <div className="flex items-center justify-between border-b border-[var(--admin-borde)] pb-4">
                <h3 className="text-base font-semibold text-[var(--admin-texto)]">
                  {type.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTypeModal({ isOpen: true, data: type })} 
                    title="Editar grupo" aria-label={`Editar ${type.name}`} className="rounded-md p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-primario)]"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(type.id, type.name)} 
                    title="Eliminar grupo" aria-label={`Eliminar ${type.name}`} className="rounded-md p-2 text-[var(--admin-texto-suave)] transition-colors hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-peligro)]"
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
                  <div key={s.id} className="flex items-center gap-2 rounded-md bg-[var(--admin-fondo)] px-3 py-1.5">
                    <span className="text-sm font-medium text-[var(--admin-texto)]">{s.value}</span>
                    <div className="ml-1 flex items-center gap-1 border-l border-[var(--admin-borde)] pl-2">
                      <button onClick={() => setSizeModal({ isOpen: true, typeId: type.id, data: s })} title={`Editar talle ${s.value}`} aria-label={`Editar talle ${s.value}`} className="p-1 text-[var(--admin-texto-suave)] hover:text-[var(--admin-primario)]">
                        <Edit size={12} />
                      </button>
                      <button onClick={() => handleDeleteSize(s.id)} title={`Eliminar talle ${s.value}`} aria-label={`Eliminar talle ${s.value}`} className="p-1 text-[var(--admin-texto-suave)] hover:text-[var(--admin-peligro)]">
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
          {!loading && sizeTypes.length === 0 && <p className="text-sm text-[var(--admin-texto-suave)]">Todavía no hay grupos de talles.</p>}
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
