"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/actions/providers";
import { toast } from "sonner";
import { Truck, Layers, Plus } from "lucide-react";

// --- UTILIDAD DE CONTRASTE ---
function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

function ProvidersContent() {
  const { pageConfig } = usePageConfig();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", details: "", contacts: [] as string[] });
  const [newContact, setNewContact] = useState("");

  // INVERSIÓN DE COLORES: Usamos secondary como fondo y primary como acento
  const background = pageConfig?.secondaryColor || "#00b4d8";
  const accent = pageConfig?.primaryColor || "#FFFFFF";
  const textColor = getContrastColor(background);
  const accentTextColor = getContrastColor(accent);

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
    <div style={{ backgroundColor: background, color: textColor, minHeight: "100vh" }} className="transition-colors duration-200 md:ml-60 p-6 sm:p-8 pt-24 w-full">
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
        
        <div className="flex justify-between items-end border-b pb-6 font-black italic uppercase tracking-tighter" style={{ borderColor: `${textColor}20` }}>
          <h1 className="text-3xl flex items-center gap-3">
            <Truck style={{ color: accent }} size={32} /> Gestión de Proveedores
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-black/10 border border-white/5 p-6 rounded-3xl relative space-y-4 shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent }} />
          <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: accent }}>
            <Layers size={14} /> {editingId ? "Modificar Registro" : "Nuevo Ingreso"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm placeholder:opacity-50 focus:ring-2 outline-none" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm placeholder:opacity-50 focus:ring-2 outline-none" placeholder="Detalles..." value={form.details} onChange={e => setForm({...form, details: e.target.value})} />
          </div>

          <div className="flex gap-2">
            <input className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm outline-none" placeholder="Añadir contacto" value={newContact} onChange={e => setNewContact(e.target.value)} />
            <button type="button" onClick={addContact} className="p-3 rounded-xl" style={{ backgroundColor: accent, color: accentTextColor }}>
              <Plus size={20} />
            </button>
          </div>

          <button type="submit" className="w-full font-bold py-3 rounded-xl transition-opacity hover:opacity-90" style={{ backgroundColor: accent, color: accentTextColor }}>
            {editingId ? "Actualizar" : "Registrar"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? <div className="animate-pulse">Cargando...</div> : providers.map(p => (
            <div key={p.id} className="bg-black/10 border border-white/5 rounded-[2rem] p-6">
              <h3 className="text-lg font-black uppercase">{p.name}</h3>
              <p className="text-[10px] opacity-60">{p.details}</p>
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