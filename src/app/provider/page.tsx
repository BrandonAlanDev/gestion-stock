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

interface PageConfigProps {
  config?: {
    primaryColor?: string | null;
    secondaryColor?: string | null;
  };
}

function ProvidersContent({ config }: PageConfigProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewProvider, setViewProvider] = useState<any | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("id");

  const [form, setForm] = useState({ name: "", details: "", contacts: [] as string[] });
  const [newContact, setNewContact] = useState("");

  // Valores de respaldo si no vienen de la base de datos
  const primary = config?.primaryColor || "#FFFFFF";
  const secondary = config?.secondaryColor || "#00b4d8";

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

  // Detectar si el fondo configurado es blanco para contrastar el título principal
  const isWhiteBg = primary.toUpperCase() === "#FFFFFF" || primary.toLowerCase() === "white";

  return (
    /* 1. Mapeamos los colores de la BD a variables CSS en el elemento raíz */
    <div 
      style={{
        "--p-color": primary,
        "--s-color": secondary,
      } as React.CSSProperties}
      className="w-full min-h-screen text-neutral-800 bg-[var(--p-color)] transition-colors duration-200"
    >
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-neutral-200 pb-6 font-black italic uppercase tracking-tighter">
          <h1 className={`text-3xl flex items-center gap-3 ${isWhiteBg ? 'text-neutral-900' : 'text-white'}`}>
            <Truck className="text-[var(--s-color)]" size={32} /> 
            Gestión de Proveedores
          </h1>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="bg-neutral-50 border border-neutral-200 p-6 rounded-3xl relative space-y-4 shadow-xl overflow-hidden">
          {/* Detalle lateral con color secundario */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--s-color)]" />
          
          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-[var(--s-color)]">
            <Layers size={14} /> {editingId ? "Modificar Registro" : "Nuevo Ingreso"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-sm outline-none transition-all placeholder:text-neutral-400 text-neutral-900 shadow-sm focus:border-[var(--s-color)] focus:ring-1 focus:ring-[var(--s-color)]" 
              placeholder="Nombre de la Empresa / Proveedor" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
            />
            <input 
              className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-sm outline-none transition-all placeholder:text-neutral-400 text-neutral-900 shadow-sm focus:border-[var(--s-color)] focus:ring-1 focus:ring-[var(--s-color)]" 
              placeholder="Detalles, dirección o rubro..." 
              value={form.details} 
              onChange={e => setForm({...form, details: e.target.value})} 
            />
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-white border border-neutral-200 rounded-xl p-3 text-sm outline-none transition-all placeholder:text-neutral-400 text-neutral-900 shadow-sm focus:border-[var(--s-color)] focus:ring-1 focus:ring-[var(--s-color)]" 
                placeholder="Añadir contacto (WhatsApp, Email...)" 
                value={newContact} 
                onChange={e => setNewContact(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addContact(); } }}
              />
              <button 
                type="button" 
                onClick={addContact} 
                className="bg-[var(--s-color)] text-white px-6 rounded-xl hover:opacity-90 transition-all shadow-md flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* TAGS DE CONTACTOS TEMPORALES */}
            <div className="flex flex-wrap gap-2">
              {form.contacts.map((c, index) => (
                <div key={index} className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg text-[10px] font-black italic uppercase tracking-tighter text-[var(--s-color)]">
                  {c}
                  <button type="button" onClick={() => removeContact(index)} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              className="bg-[var(--s-color)] text-white hover:opacity-90 font-bold uppercase tracking-tighter px-8 py-2.5 rounded-xl transition-all shadow-md text-sm"
            >
              {editingId ? "Actualizar Datos" : "Registrar Proveedor"}
            </button>
            {editingId && (
              <Button variant="ghost" type="button" className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-600" onClick={() => {
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
             <div className="col-span-full text-center py-20 text-neutral-400 uppercase text-[10px] font-black tracking-[0.5em] animate-pulse">
               Sincronizando base de datos...
             </div>
          ) : providers.map((p) => (
            <div key={p.id} className="bg-white border border-neutral-200 rounded-[2.5rem] p-6 space-y-4 group relative transition-all shadow-md hover:shadow-lg hover:border-[var(--s-color)]/40">
              
              {/* GRUPO DE ACCIONES */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5">
                <button 
                  onClick={() => setViewProvider(p)} 
                  className="text-neutral-400 hover:text-[var(--s-color)] transition-colors p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
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
                  className="text-neutral-400 hover:text-[var(--s-color)] transition-colors p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
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
                  className="text-neutral-400 hover:text-red-500 transition-colors p-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="border-b border-neutral-100 pb-4 pr-32">
                <h3 className="font-black text-lg italic uppercase text-neutral-800 group-hover:text-[var(--s-color)] transition-colors truncate">
                  {p.name}
                </h3>
              </div>
              
              <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium line-clamp-2 min-h-[32px]">
                {p.details || "Sin información adicional"}
              </p>

              <div className="flex gap-2">
                 <div className="text-[9px] bg-neutral-50 text-neutral-500 px-3 py-1 rounded-full border border-neutral-200 font-bold uppercase tracking-widest">
                    {p.contacts.length} Contactos
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL FICHA TÉCNICA */}
        {viewProvider && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-md transition-all">
            <div className="bg-white border border-neutral-200 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--s-color)]" />
              <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-[var(--s-color)]">{viewProvider.name}</h2>
                  <button onClick={handleCloseModal} className="text-neutral-400 hover:text-neutral-600 p-2"><X size={24} /></button>
              </div>
              <div className="space-y-6">
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 text-[11px] text-neutral-500 uppercase font-black italic tracking-wider leading-relaxed">
                    {viewProvider.details || "El proveedor no cuenta con una descripción detallada."}
                  </div>
                  <div className="grid gap-3">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] pl-1">Canales de Contacto</span>
                      {viewProvider.contacts?.map((c: any) => (
                          <div key={c.id} className="flex items-center gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-xs text-neutral-800 group transition-all">
                              <div className="bg-white p-2 rounded-xl border border-neutral-200 transition-colors shadow-sm text-[var(--s-color)] group-hover:bg-[var(--s-color)] group-hover:text-white">
                                {c.type === "EMAIL" ? <Mail size={16}/> : <Phone size={16}/>}
                              </div>
                              <span className="font-bold tracking-tight">{c.contact}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-8 rounded-2xl border border-neutral-200 text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-neutral-800 bg-white hover:bg-neutral-50" 
                onClick={handleCloseModal}
              >
                Cerrar Ficha Técnica
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProvidersPage({ config }: PageConfigProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
        <span className="text-neutral-400 uppercase text-[10px] tracking-[0.5em] font-black animate-pulse">Sincronizando Proveedores</span>
      </div>
    }>
      <ProvidersContent />
    </Suspense>
  );
}