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
import { Truck, X, Edit2, Trash2, Phone, Mail, ChevronRight, Plus, ExternalLink } from "lucide-react";

function ProvidersContent() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewProvider, setViewProvider] = useState<any | null>(null);
  const [error, setError] = useState("");

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

  // 👉 Lógica para abrir el modal si viene un ID de la tabla
  useEffect(() => {
    if (!loading && selectedId && providers.length > 0) {
      const found = providers.find(p => p.id === selectedId);
      if (found) setViewProvider(found);
    }
  }, [loading, selectedId, providers]);

  const addContact = () => {
    if (!newContact.trim() || form.contacts.includes(newContact.trim())) return;
    setForm({ ...form, contacts: [...form.contacts, newContact.trim()] });
    setNewContact("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const res = editingId ? await updateProvider({ ...form, id: editingId }) : await createProvider(form);
    if (res.error) return toast.error(res.error);
    toast.success("Operación exitosa");
    setEditingId(null);
    setForm({ name: "", details: "", contacts: [] });
    fetchData();
  };

  const handleCloseModal = () => {
    setViewProvider(null);
    router.push("/dashboard");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-neutral-900 pb-6 text-white font-black italic uppercase tracking-tighter">
        <h1 className="text-3xl flex items-center gap-3"><Truck className="text-amber-500" size={32} /> Proveedores</h1>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl relative space-y-4">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />
        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{editingId ? "Actualizar" : "Nuevo"}</h3>
        <input className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none" placeholder="Detalles" value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
        <div className="flex gap-2">
          <input className="flex-1 bg-black border border-neutral-800 rounded-xl p-2 text-xs text-white" placeholder="Contacto..." value={newContact} onChange={e => setNewContact(e.target.value)} />
          <button type="button" onClick={addContact} className="bg-neutral-900 text-amber-500 px-4 rounded-xl"><Plus size={16} /></button>
        </div>
        <div className="flex gap-2">
            <Button variant="amarillo">{editingId ? "Actualizar" : "Crear"}</Button>
            {editingId && <Button variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>}
        </div>
      </form>

      {/* LISTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="bg-neutral-950 border border-neutral-900 rounded-[2.5rem] p-6 space-y-4 group relative hover:border-amber-500/30 transition-all">
            <button onClick={() => setViewProvider(p)} className="absolute top-6 right-16 text-neutral-600 hover:text-amber-500 transition-colors"><ExternalLink size={18} /></button>
            <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
              <h3 className="font-black text-lg italic uppercase text-white group-hover:text-amber-500">{p.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(p.id); setForm({ name: p.name, details: p.details || "", contacts: p.contacts.map((c: any) => c.contact) }); }} className="text-neutral-700 hover:text-amber-500"><Edit2 size={16} /></button>
                <button onClick={async () => { if(confirm("¿Eliminar?")) { await deleteProvider(p.id); fetchData(); } }} className="text-neutral-700 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="text-xs text-neutral-500 uppercase">{p.details}</p>
          </div>
        ))}
      </div>

      {/* MODAL FICHA TÉCNICA (Se abre al hacer click desde dashboard) */}
      {viewProvider && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-neutral-950 border border-neutral-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-black italic uppercase text-amber-500">{viewProvider.name}</h2>
                <button onClick={handleCloseModal} className="text-neutral-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
                <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-400 uppercase font-bold italic">{viewProvider.details || "Sin descripción"}</div>
                <div className="grid gap-2">
                    {viewProvider.contacts?.map((c: any) => (
                        <div key={c.id} className="flex items-center gap-3 bg-black p-3 rounded-xl border border-neutral-800 text-xs text-white">
                            <div className="text-amber-500">{c.type === "EMAIL" ? <Mail size={14}/> : <Phone size={14}/>}</div>
                            {c.contact}
                        </div>
                    ))}
                </div>
            </div>
            <Button variant="ghost" className="w-full mt-6 rounded-xl border border-neutral-900 text-neutral-500 text-[10px] font-black uppercase" onClick={handleCloseModal}>Cerrar Ficha</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={<div className="text-white p-20 text-center animate-pulse uppercase text-xs tracking-widest">Sincronizando Proveedores...</div>}>
        <ProvidersContent />
      </Suspense>
    </div>
  );
}
