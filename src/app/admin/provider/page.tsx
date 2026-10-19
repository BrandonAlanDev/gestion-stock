"use client";

import { useEffect, useState, Suspense } from "react";
import { getProviders } from "@/actions/proveedores/obtener-proveedores";
import { createProvider } from "@/actions/proveedores/crear-proveedor";
import { updateProvider } from "@/actions/proveedores/actualizar-proveedor";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { SkeletonAdmin, SkeletonTarjetas } from "@/components/ui/skeleton-vistas";

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

    <div className="mx-auto max-w-7xl px-4 py-7 text-[var(--admin-texto)] sm:px-6 lg:px-8">
      <div className="space-y-6">
        
        <div>
          <h1>Proveedores</h1>
          <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">Gestioná los datos y contactos de tus proveedores.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-[var(--admin-fondo-opaco)] p-5">
          <h2 className="text-base font-semibold">
            {editingId ? "Editar proveedor" : "Nuevo proveedor"}
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium">Nombre
              <input required className="w-full rounded-md border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-2.5 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)]" placeholder="Nombre del proveedor" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </label>
            <label className="space-y-1 text-sm font-medium">Detalles
              <input className="w-full rounded-md border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-2.5 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)]" placeholder="Información adicional" value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
            </label>
          </div>

          <div className="flex w-full items-end gap-2">
            <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">Contacto
              <input className="w-full rounded-md border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-2.5 text-sm text-[var(--admin-texto)] outline-none placeholder:text-[var(--admin-texto-suave)]" placeholder="Email o teléfono" value={newContact} onChange={e => setNewContact(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addContact(); } }} />
            </label>
            <button type="button" onClick={addContact} aria-label="Agregar contacto" className="rounded-md bg-[var(--admin-primario)] p-3 text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90">
              <Plus size={20} />
            </button>
          </div>

          {form.contacts.length > 0 && <div className="flex flex-wrap gap-2">{form.contacts.map((contacto, indice) => <button type="button" key={`${contacto}-${indice}`} onClick={() => setForm({ ...form, contacts: form.contacts.filter((_, i) => i !== indice) })} title="Quitar contacto" className="rounded-md bg-[var(--admin-fondo-hover)] px-2.5 py-1.5 text-xs">{contacto} ×</button>)}</div>}
          <button type="submit" className="rounded-md bg-[var(--admin-primario)] px-5 py-2.5 text-sm font-semibold text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90">
            {editingId ? "Actualizar" : "Registrar"}
          </button>
        </form>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {loading ? <div className="col-span-full"><SkeletonTarjetas cantidad={4} /></div> : providers.map(p => (
            <div key={p.id} className="rounded-lg bg-[var(--admin-fondo-opaco)] p-5">
              <h3 className="text-base font-semibold text-[var(--admin-texto)]">{p.name}</h3>
              {p.details && <p className="mt-1 text-sm text-[var(--admin-texto-suave)]">{p.details}</p>}
              {p.contacts.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{p.contacts.map((contacto) => <span key={contacto.id} className="rounded-md bg-[var(--admin-fondo-hover)] px-2 py-1 text-xs text-[var(--admin-texto-suave)]">{contacto.contact}</span>)}</div>}
              <button type="button" onClick={() => { setEditingId(p.id); setForm({ name: p.name, details: p.details ?? "", contacts: p.contacts.map((contacto) => contacto.contact) }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-4 text-sm font-medium text-[var(--admin-primario)] hover:underline">Editar proveedor</button>
            </div>
          ))}
          {!loading && providers.length === 0 && <p className="text-sm text-[var(--admin-texto-suave)]">Todavía no hay proveedores.</p>}
        </div>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<SkeletonAdmin tipo="tarjetas" />}>
      <ProvidersContent />
    </Suspense>
  );
}
