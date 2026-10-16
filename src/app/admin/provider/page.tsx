"use client";

import { useEffect, useState, Suspense } from "react";
import { getProviders } from "@/actions/proveedores/obtener-proveedores";
import { createProvider } from "@/actions/proveedores/crear-proveedor";
import { updateProvider } from "@/actions/proveedores/actualizar-proveedor";
import { toast } from "sonner";
import { Truck, Layers, Plus } from "lucide-react";

type Proveedor = Awaited<ReturnType<typeof getProviders>>[number];

function ProvidersContent() {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", details: "", contacts: [] as string[] });
  const [newContact, setNewContact] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getProviders();
    setProviders(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addContact = () => {
    const contact = newContact.trim();
    if (!contact) return;
    setForm({ ...form, contacts: [...form.contacts, contact] });
    setNewContact("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("El nombre es obligatorio");

    const res = editingId 
      ? await updateProvider({ ...form, id: editingId }) 
      : await createProvider(form);

    if (res?.error) return toast.error(res.error);
    toast.success(editingId ? "Proveedor actualizado" : "Proveedor creado");
    setEditingId(null);
    setForm({ name: "", details: "", contacts: [] });
    fetchData();
  };

  return (

    <div className="min-h-screen w-full bg-[var(--admin-fondo)] p-6 pt-12 text-[var(--admin-texto)] transition-colors duration-200 sm:p-8">
      <div className="p-0 max-w-6xl mx-auto space-y-8 pt-12 sm:p-8">
        
        <div className="flex items-end justify-between border-b border-[var(--admin-borde)] pb-6 font-black italic uppercase tracking-tighter">
          <h1 className="flex items-center gap-3 text-3xl text-[var(--admin-texto)]">
            <Truck className="text-[var(--admin-primario)]" size={32} /> Gestión de Proveedores
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="relative space-y-4 overflow-hidden rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-6 shadow-xl">
          <div className="absolute left-0 top-0 h-full w-1 bg-[var(--admin-primario)]" />
          <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--admin-primario)]">
            <Layers size={14} /> {editingId ? "Modificar Registro" : "Nuevo Ingreso"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-2 focus:ring-[var(--admin-primario)]" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-2 focus:ring-[var(--admin-primario)]" placeholder="Detalles..." value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
          </div>

          <div className="flex gap-2 w-full">
            <input className="min-w-0 flex-1 rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)] focus:ring-2 focus:ring-[var(--admin-primario)]" placeholder="Añadir contacto" value={newContact} onChange={e => setNewContact(e.target.value)} />
            <button type="button" onClick={addContact} className="rounded-xl bg-[var(--admin-primario)] p-3 text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90">
              <Plus size={20} />
            </button>
          </div>

          <button type="submit" className="w-full rounded-xl bg-[var(--admin-primario)] py-3 font-bold text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90">
            {editingId ? "Actualizar" : "Registrar"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? <div className="animate-pulse">Cargando...</div> : providers.map(p => (
            <div key={p.id} className="rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-6">
              <h3 className="text-lg font-black uppercase text-[var(--admin-texto)]">{p.name}</h3>
              <p className="text-[10px] text-[var(--admin-texto-suave)]">{p.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProvidersContent />
    </Suspense>
  );
}
