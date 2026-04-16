"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/actions/providers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Truck, X, Edit2, Trash2, Phone, Mail, Plus, ExternalLink, Layers } from "lucide-react";

function ProvidersContent() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewProvider, setViewProvider] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("id");

  const [form, setForm] = useState({ name: "", details: "", contacts: [] as string[] });
  const [newContact, setNewContact] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getProviders();
    setProviders(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!loading && selectedId && providers.length > 0) {
      const found = providers.find(p => p.id === selectedId);
      if (found) setViewProvider(found);
    }
  }, [loading, selectedId, providers]);

  const addContact = () => {
    const contact = newContact.trim();
    if (!contact) return;
    if (form.contacts.includes(contact)) {
      return toast.error("Este contacto ya está en la lista");
    }
    setForm({ ...form, contacts: [...form.contacts, contact] });
    setNewContact("");
  };

  const removeContact = (index: number) => {
    setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    let currentContacts = [...form.contacts];
    if (newContact.trim() && !currentContacts.includes(newContact.trim())) {
      currentContacts.push(newContact.trim());
    }

    if (!form.name.trim()) return toast.error("El nombre es obligatorio");

    const payload = { ...form, contacts: currentContacts };
    const res = editingId 
      ? await updateProvider({ ...payload, id: editingId }) 
      : await createProvider(payload);

    if (res.error) return toast.error(res.error);

    toast.success(editingId ? "Proveedor actualizado" : "Proveedor creado");
    setEditingId(null);
    setForm({ name: "", details: "", contacts: [] });
    setNewContact("");
    fetchData();
  };

  const handleCloseModal = () => {
    setViewProvider(null);
    router.push("/provider");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24 min-h-screen bg-black text-white selection:bg-amber-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-neutral-900 pb-6 font-black italic uppercase tracking-tighter">
        <h1 className="text-3xl flex items-center gap-3">
          <Truck className="text-amber-500" size={32} /> 
          Gestión de Proveedores
        </h1>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl relative space-y-4 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
          <Layers size={14} /> {editingId ? "Modificar Registro" : "Nuevo Ingreso"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none focus:border-amber-500 transition-all placeholder:text-neutral-700" 
            placeholder="Nombre de la Empresa / Proveedor" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
          />
          <input 
            className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none focus:border-amber-500 transition-all placeholder:text-neutral-700" 
            placeholder="Detalles, dirección o rubro..." 
            value={form.details} 
            onChange={e => setForm({...form, details: e.target.value})} 
          />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-black border border-neutral-800 rounded-xl p-3 text-sm outline-none focus:border-amber-500 transition-all placeholder:text-neutral-700" 
              placeholder="Añadir contacto (WhatsApp, Email...)" 
              value={newContact} 
              onChange={e => setNewContact(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addContact(); } }}
            />
            <button 
              type="button" 
              onClick={addContact} 
              className="bg-neutral-900 text-amber-500 px-6 rounded-xl hover:bg-amber-500 hover:text-black transition-all border border-neutral-800"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* TAGS DE CONTACTOS TEMPORALES */}
          <div className="flex flex-wrap gap-2">
            {form.contacts.map((c, index) => (
              <div key={index} className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg text-[10px] font-black text-amber-500 italic uppercase tracking-tighter">
                {c}
                <button type="button" onClick={() => removeContact(index)} className="text-neutral-500 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="amarillo" type="submit" className="font-bold uppercase tracking-tighter px-8 rounded-xl">
            {editingId ? "Actualizar Datos" : "Registrar Proveedor"}
          </Button>
          {editingId && (
            <Button variant="ghost" type="button" className="rounded-xl border border-neutral-900" onClick={() => {
              setEditingId(null);
              setForm({ name: "", details: "", contacts: [] });
              setNewContact("");
            }}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* LISTADO DE PROVEEDORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
           <div className="col-span-full text-center py-20 text-neutral-800 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">
             Sincronizando base de datos...
           </div>
        ) : providers.map((p) => (
          <div key={p.id} className="bg-neutral-950 border border-neutral-900 rounded-[2.5rem] p-6 space-y-4 group relative hover:border-neutral-700 transition-all shadow-xl">
            
            {/* GRUPO DE ACCIONES (Sin superposición) */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5">
              <button 
                onClick={() => setViewProvider(p)} 
                className="text-neutral-600 hover:text-amber-500 transition-colors p-2 bg-black border border-neutral-900 rounded-xl hover:border-amber-500/50"
                title="Ver Ficha"
              >
                <ExternalLink size={16} />
              </button>
              <button 
                onClick={() => { 
                  setEditingId(p.id); 
                  setForm({ name: p.name, details: p.details || "", contacts: p.contacts.map((c: any) => c.contact) }); 
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className="text-neutral-600 hover:text-amber-500 transition-colors p-2 bg-black border border-neutral-900 rounded-xl hover:border-amber-500/50"
                title="Editar"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={async () => { 
                  if(confirm(`¿Eliminar a ${p.name}?`)) { 
                    await deleteProvider(p.id); 
                    toast.info("Proveedor archivado");
                    fetchData(); 
                  } 
                }} 
                className="text-neutral-600 hover:text-red-500 transition-colors p-2 bg-black border border-neutral-900 rounded-xl hover:border-red-500/50"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="border-b border-neutral-900 pb-4 pr-32">
              <h3 className="font-black text-lg italic uppercase text-neutral-200 group-hover:text-amber-500 transition-colors truncate">
                {p.name}
              </h3>
            </div>
            
            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium line-clamp-2 min-h-[32px]">
              {p.details || "Sin información adicional"}
            </p>

            <div className="flex gap-2">
               <div className="text-[9px] bg-neutral-900 text-neutral-400 px-3 py-1 rounded-full border border-neutral-800 font-bold uppercase tracking-widest">
                  {p.contacts.length} Contactos
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FICHA TÉCNICA */}
      {viewProvider && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md transition-all">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black italic uppercase text-amber-500 tracking-tighter">{viewProvider.name}</h2>
                <button onClick={handleCloseModal} className="text-neutral-500 hover:text-white p-2"><X size={24} /></button>
            </div>
            <div className="space-y-6">
                <div className="bg-neutral-900/30 p-5 rounded-2xl border border-neutral-900 text-[11px] text-neutral-400 uppercase font-black italic tracking-wider leading-relaxed">
                  {viewProvider.details || "El proveedor no cuenta con una descripción detallada."}
                </div>
                <div className="grid gap-3">
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] pl-1">Canales de Contacto</span>
                    {viewProvider.contacts?.map((c: any) => (
                        <div key={c.id} className="flex items-center gap-4 bg-black p-4 rounded-2xl border border-neutral-900 text-xs text-white group hover:border-amber-500/30 transition-all">
                            <div className="bg-neutral-900 p-2 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                              {c.type === "EMAIL" ? <Mail size={16}/> : <Phone size={16}/>}
                            </div>
                            <span className="font-bold tracking-tight">{c.contact}</span>
                        </div>
                    ))}
                    {(!viewProvider.contacts || viewProvider.contacts.length === 0) && (
                      <p className="text-center text-neutral-800 text-[10px] uppercase font-black py-4 border border-dashed border-neutral-900 rounded-2xl">
                        No hay contactos vinculados
                      </p>
                    )}
                </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-8 rounded-2xl border border-neutral-900 text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white" 
              onClick={handleCloseModal}
            >
              Cerrar Ficha Técnica
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-white uppercase text-[10px] tracking-[0.5em] font-black animate-pulse">Sincronizando Proveedores</span>
      </div>
    }>
      <ProvidersContent />
    </Suspense>
  );
}