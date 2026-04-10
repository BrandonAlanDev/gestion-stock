"use client";

import { useEffect, useState } from "react";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/actions/providers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Truck,
  X,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ChevronRight,
  Plus,
} from "lucide-react";

export default function ProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    details: "",
    contacts: [] as string[],
  });

  const [newContact, setNewContact] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getProviders();
    setProviders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 👉 agregar contacto
  const addContact = () => {
    if (!newContact.trim()) return;

    if (form.contacts.includes(newContact.trim())) {
      toast.error("Contacto duplicado");
      return;
    }

    setForm({
      ...form,
      contacts: [...form.contacts, newContact.trim()],
    });

    setNewContact("");
  };

  const removeContact = (c: string) => {
    setForm({
      ...form,
      contacts: form.contacts.filter((x) => x !== c),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", details: "", contacts: [] });
    setError("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");

    const res = editingId
      ? await updateProvider({ ...form, id: editingId })
      : await createProvider(form);

    if (res.error) {
      setError(res.error);
      toast.error(res.error);
      return;
    }

    toast.success(editingId ? "Proveedor actualizado" : "Proveedor creado");

    resetForm();
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <div className="p-8 max-w-6xl mx-auto space-y-8 pt-24">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-neutral-900 pb-6">
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Truck className="text-amber-500" size={32} />
              Gestión de Proveedores
            </h1>
            <p className="text-neutral-500 text-xs uppercase tracking-[0.3em] mt-2 font-light">
              Control de proveedores y contactos
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-950 border border-neutral-900 p-6 rounded-3xl shadow-2xl relative overflow-hidden space-y-4"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/50" />

          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            <ChevronRight size={14} />
            {editingId
              ? `Actualizando "${form.name || "Proveedor"}"`
              : "Crear proveedor nuevo"}
          </h3>

          <input
            className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500"
            placeholder="Nombre del proveedor"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500"
            placeholder="Detalles (ej: Calzados, pantalones)"
            value={form.details}
            onChange={(e) =>
              setForm({ ...form, details: e.target.value })
            }
          />

          {/* CONTACTOS */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-black border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                placeholder="Agregar contacto"
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
              />
              <button
                type="button"
                onClick={addContact}
                className="bg-neutral-900 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl px-4 flex items-center justify-center transition-all"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* chips */}
            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {form.contacts.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2 bg-black px-3 py-1 rounded-xl border border-neutral-800 hover:border-amber-500/30 transition-all text-xs"
                >
                  {c.includes("@") ? (
                    <Mail size={12} />
                  ) : (
                    <Phone size={12} />
                  )}
                  {c}
                  <button onClick={() => removeContact(c)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs uppercase tracking-wider">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="amarillo" className="px-6">
              {editingId ? "Actualizar" : "Crear"}
            </Button>

            {editingId && (
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        {/* LISTADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-neutral-800 uppercase text-[10px] tracking-[0.5em] animate-pulse">
              Cargando proveedores...
            </div>
          ) : providers.map((p) => (
            <div
              key={p.id}
              className="bg-neutral-950 border border-neutral-900 rounded-[2.5rem] p-6 space-y-4 hover:border-neutral-800 transition-all group"
            >
              <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
                <h3 className="font-black text-lg italic uppercase tracking-tighter group-hover:text-amber-500 transition-colors flex items-center gap-2">
                  <ChevronRight size={18} className="text-amber-500" />
                  {p.name}
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setForm({
                        name: p.name,
                        details: p.details || "",
                        contacts: p.contacts.map((c: any) => c.contact),
                      });

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="text-neutral-700 hover:text-amber-500"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm("¿Eliminar proveedor?")) {
                        await deleteProvider(p.id);
                        fetchData();
                      }
                    }}
                    className="text-neutral-700 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-500">{p.details}</p>

              <div className="flex flex-wrap gap-2">
                {p.contacts.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 bg-black px-3 py-1 rounded-xl border border-neutral-800 text-xs"
                  >
                    {c.type === "EMAIL" ? (
                      <Mail size={12} />
                    ) : (
                      <Phone size={12} />
                    )}
                    {c.contact}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!loading && providers.length === 0 && (
          <div className="text-center py-20 border border-dashed border-neutral-900 rounded-[2rem]">
            <p className="text-neutral-800 uppercase text-[10px] tracking-[0.3em] font-black">
              No hay proveedores cargados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}