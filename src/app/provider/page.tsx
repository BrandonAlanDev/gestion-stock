"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/actions/providers";
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
    <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24 min-h-screen bg-[var(--color-fondo-sitio)] text-[var(--texto-sobre-fondo)] selection:bg-[color-mix(in_srgb,var(--color-primario)_20%,transparent)]">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] pb-6 font-black italic uppercase tracking-tighter">
        <h1 className="text-3xl flex items-center gap-3">
          <Truck className="text-[var(--color-primario)]" size={32} /> 
          Gestión de Proveedores
        </h1>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="bg-[var(--superficie-fondo)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] p-6 rounded-3xl relative space-y-4 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[color-mix(in_srgb,var(--color-primario)_50%,transparent)]" />
        <h3 className="text-[10px] font-black text-[var(--color-primario)] uppercase tracking-widest flex items-center gap-2">
          <Layers size={14} /> {editingId ? "Modificar Registro" : "Nuevo Ingreso"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="w-full bg-[var(--color-fondo-sitio)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)] rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primario)] transition-all placeholder:text-[var(--texto-sobre-fondo)]/30" 
            placeholder="Nombre de la Empresa / Proveedor" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
          />
          <input 
            className="w-full bg-[var(--color-fondo-sitio)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)] rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primario)] transition-all placeholder:text-[var(--texto-sobre-fondo)]/30" 
            placeholder="Detalles, dirección o rubro..." 
            value={form.details} 
            onChange={e => setForm({...form, details: e.target.value})} 
          />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-[var(--color-fondo-sitio)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)] rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primario)] transition-all placeholder:text-[var(--texto-sobre-fondo)]/30" 
              placeholder="Añadir contacto (WhatsApp, Email...)" 
              value={newContact} 
              onChange={e => setNewContact(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addContact(); } }}
            />
            <button 
              type="button" 
              onClick={addContact} 
              className="bg-[color-mix(in_srgb,var(--color-fondo-sitio)_25%,transparent)] text-[var(--color-primario)] px-6 rounded-xl hover:bg-[var(--color-primario)] hover:text-[var(--texto-sobre-primario)] transition-all border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)]"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* TAGS DE CONTACTOS TEMPORALES */}
          <div className="flex flex-wrap gap-2">
            {form.contacts.map((c, index) => (
              <div key={index} className="flex items-center gap-2 bg-[var(--superficie-fondo)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)] px-3 py-1.5 rounded-lg text-[10px] font-black text-[var(--color-primario)] italic uppercase tracking-tighter">
                {c}
                <button type="button" onClick={() => removeContact(index)} className="text-[var(--texto-sobre-fondo)]/60 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" className="h-10 px-8 rounded-xl font-bold uppercase tracking-tighter bg-[var(--color-primario)] text-[var(--texto-sobre-primario)] hover:opacity-90 transition-all cursor-pointer">
            {editingId ? "Actualizar Datos" : "Registrar Proveedor"}
          </button>
          {editingId && (
            <button type="button" className="h-10 px-4 py-2 rounded-xl border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] font-medium uppercase tracking-tighter text-[var(--texto-sobre-fondo)]/60 hover:text-[var(--texto-sobre-fondo)] transition-colors cursor-pointer" onClick={() => {
              setEditingId(null);
              setForm({ name: "", details: "", contacts: [] });
              setNewContact("");
            }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* LISTADO DE PROVEEDORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
           <div className="col-span-full text-center py-20 text-[var(--texto-sobre-fondo)]/30 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">
             Sincronizando base de datos...
           </div>
        ) : providers.map((p) => (
          <div key={p.id} className="bg-[var(--superficie-fondo)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-[2.5rem] p-6 space-y-4 group relative hover:border-[color-mix(in_srgb,var(--color-fondo-sitio)_20%,transparent)] transition-all shadow-xl">
            
            {/* GRUPO DE ACCIONES (Sin superposición) */}
            <div className="absolute top-6 right-6 flex items-center gap-1.5">
              <button 
                onClick={() => setViewProvider(p)} 
                className="text-[var(--texto-sobre-fondo)]/50 hover:text-[var(--color-primario)] transition-colors p-2 bg-[var(--color-fondo-sitio)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl hover:border-[color-mix(in_srgb,var(--color-primario)_40%,transparent)]"
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
                className="text-[var(--texto-sobre-fondo)]/50 hover:text-[var(--color-primario)] transition-colors p-2 bg-[var(--color-fondo-sitio)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl hover:border-[color-mix(in_srgb,var(--color-primario)_40%,transparent)]"
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
                className="text-[var(--texto-sobre-fondo)]/50 hover:text-red-500 transition-colors p-2 bg-[var(--color-fondo-sitio)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-xl hover:border-red-500/50"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="border-b border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] pb-4 pr-32">
              <h3 className="font-black text-lg italic uppercase text-[var(--texto-sobre-fondo)]/90 group-hover:text-[var(--color-primario)] transition-colors truncate">
                {p.name}
              </h3>
            </div>
            
            <p className="text-[10px] text-[var(--texto-sobre-fondo)]/60 uppercase tracking-[0.2em] font-medium line-clamp-2 min-h-[32px]">
              {p.details || "Sin información adicional"}
            </p>

            <div className="flex gap-2">
               <div className="text-[9px] bg-[var(--superficie-fondo)] text-[var(--texto-sobre-fondo)]/50 px-3 py-1 rounded-full border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)] font-bold uppercase tracking-widest">
                  {p.contacts.length} Contactos
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FICHA TÉCNICA */}
      {viewProvider && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--color-fondo-sitio)_95%,transparent)] backdrop-blur-md transition-all">
          <div className="bg-[var(--superficie-fondo)] border border-[color-mix(in_srgb,var(--color-fondo-sitio)_12%,transparent)] w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-primario)]" />
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black italic uppercase text-[var(--color-primario)] tracking-tighter">{viewProvider.name}</h2>
                <button onClick={handleCloseModal} className="text-[var(--texto-sobre-fondo)]/60 hover:text-[var(--texto-sobre-fondo)] p-2"><X size={24} /></button>
            </div>
            <div className="space-y-6">
                <div className="bg-[color-mix(in_srgb,var(--color-fondo-sitio)_30%,transparent)] p-5 rounded-2xl border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] text-[11px] text-[var(--texto-sobre-fondo)]/50 uppercase font-black italic tracking-wider leading-relaxed">
                  {viewProvider.details || "El proveedor no cuenta con una descripción detallada."}
                </div>
                <div className="grid gap-3">
                    <span className="text-[10px] font-black text-[var(--texto-sobre-fondo)]/40 uppercase tracking-[0.3em] pl-1">Canales de Contacto</span>
                    {viewProvider.contacts?.map((c: any) => (
                        <div key={c.id} className="flex items-center gap-4 bg-[var(--color-fondo-sitio)] p-4 rounded-2xl border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] text-xs text-[var(--texto-sobre-fondo)] group hover:border-[color-mix(in_srgb,var(--color-primario)_30%,transparent)] transition-all">
                            <div className="bg-[var(--superficie-fondo)] p-2 rounded-xl text-[var(--color-primario)] group-hover:bg-[var(--color-primario)] group-hover:text-[var(--texto-sobre-primario)] transition-colors">
                              {c.type === "EMAIL" ? <Mail size={16}/> : <Phone size={16}/>}
                            </div>
                            <span className="font-bold tracking-tight">{c.contact}</span>
                        </div>
                    ))}
                    {(!viewProvider.contacts || viewProvider.contacts.length === 0) && (
                      <p className="text-center text-[var(--texto-sobre-fondo)]/30 text-[10px] uppercase font-black py-4 border border-dashed border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] rounded-2xl">
                        No hay contactos vinculados
                      </p>
                    )}
                </div>
            </div>
            <button 
              className="w-full mt-8 h-10 px-4 py-2 rounded-2xl border border-[color-mix(in_srgb,var(--color-fondo-sitio)_8%,transparent)] text-[var(--texto-sobre-fondo)]/50 text-[10px] font-black uppercase tracking-[0.2em] hover:text-[var(--texto-sobre-fondo)] transition-colors cursor-pointer" 
              onClick={handleCloseModal}
            >
              Cerrar Ficha Técnica
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--color-fondo-sitio)] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[color-mix(in_srgb,var(--color-primario)_20%,transparent)] border-t-[var(--color-primario)] rounded-full animate-spin" />
        <span className="text-[var(--texto-sobre-fondo)] uppercase text-[10px] tracking-[0.5em] font-black animate-pulse">Sincronizando Proveedores</span>
      </div>
    }>
      <ProvidersContent />
    </Suspense>
  );
}
