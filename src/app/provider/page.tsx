"use client";

import { useEffect, useState } from "react";
import { 
  getProviders, 
  createProvider, 
  updateProvider, 
  deleteProvider 
} from "@/actions/providers"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Truck, X, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para el formulario basado en tu Schema
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
  });

  const fetchProviders = async () => {
    setLoading(true);
    const data = await getProviders();
    setProviders(data);
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("El nombre es obligatorio");
      return;
    }

    const res = editingId 
      ? await updateProvider(editingId, formData) 
      : await createProvider(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingId ? "Proveedor actualizado" : "Proveedor creado");
      setFormData({ name: "", contactInfo: "" });
      setEditingId(null);
      fetchProviders();
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pt-24 bg-neutral-950 min-h-screen text-white">
      {/* Cabecera */}
      <div className="flex justify-between items-end border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Truck className="text-amber-500" size={32} />
            Gestión de Proveedores
          </h1>
          <p className="text-neutral-500 text-xs uppercase tracking-[0.3em] mt-2">Directorio de logística y suministros</p>
        </div>
      </div>

      {/* Formulario de Carga */}
      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
          {editingId ? "Modificar Registro" : "Registrar Nuevo Proveedor"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <input 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 transition-all"
              placeholder="Nombre de la Empresa / Fábrica"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <input 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500 transition-all"
              placeholder="Información de Contacto (Tel, Email, etc.)"
              value={formData.contactInfo || ""}
              onChange={e => setFormData({...formData, contactInfo: e.target.value})}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="amarillo" className="font-bold uppercase tracking-tighter px-8">
            {editingId ? "Guardar Cambios" : "Dar de Alta"}
          </Button>
          {editingId && (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {setEditingId(null); setFormData({name:"", contactInfo:""})}}
              className="text-neutral-500 hover:text-white"
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* Listado de Proveedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-20 animate-pulse text-neutral-600 uppercase text-xs tracking-widest">
            Sincronizando base de datos...
          </div>
        ) : providers.map(prov => (
          <div 
            key={prov.id} 
            className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-3xl hover:border-amber-500/50 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setEditingId(prov.id); 
                  setFormData({name: prov.name, contactInfo: prov.contactInfo || ""});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="p-2 bg-neutral-950 rounded-full text-neutral-400 hover:text-amber-500 border border-neutral-800"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={async () => { if(confirm("¿Eliminar proveedor?")) { await deleteProvider(prov.id); fetchProviders(); } }} 
                className="p-2 bg-neutral-950 rounded-full text-neutral-400 hover:text-red-500 border border-neutral-800"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="pr-12">
                <h4 className="font-black text-xl italic uppercase tracking-tighter text-white group-hover:text-amber-500 transition-colors">
                  {prov.name}
                </h4>
                <div className="h-1 w-8 bg-amber-500 mt-1"></div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 text-neutral-400">
                  <Phone size={14} className="mt-1 text-neutral-600" />
                  <p className="text-xs leading-relaxed">
                    {prov.contactInfo || "Sin datos de contacto registrados"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800/50 flex justify-between items-center">
                <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">ID: {prov.id.slice(-6)}</span>
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${prov.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {prov.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!loading && providers.length === 0 && (
        <div className="text-center py-20 border border-dashed border-neutral-800 rounded-3xl">
          <p className="text-neutral-600 uppercase text-xs tracking-widest font-bold">No hay proveedores en el sistema</p>
        </div>
      )}
    </div>
  );
}