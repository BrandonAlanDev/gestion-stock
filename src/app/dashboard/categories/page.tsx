"use client";

import { useEffect, useState } from "react";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/actions/garments"; 
import { type CategoryInput, categorySchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryInput>({ name: "", description: "" });

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse(formData);
    if (!result.success) {
      toast.error("Datos inválidos");
      return;
    }

    const res = editingId 
      ? await updateCategory(editingId, formData) 
      : await createCategory(formData);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingId ? "Actualizado" : "Creado");
      setFormData({ name: "", description: "" });
      setEditingId(null);
      fetchCategories();
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 pt-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
        <Link href="/dashboard"><Button variant="ghost">Volver</Button></Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:ring-1 focus:ring-yellow-400"
            placeholder="Nombre"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:ring-1 focus:ring-yellow-400"
            placeholder="Descripción"
            value={formData.description || ""}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="amarillo">{editingId ? "Actualizar" : "Crear Categoría"}</Button>
          {editingId && <Button type="button" variant="ghost" onClick={() => {setEditingId(null); setFormData({name:"", description:""})}}>Cancelar</Button>}
        </div>
      </form>

      <div className="border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-neutral-900 text-neutral-500 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 bg-neutral-950">
            {categories.map(cat => (
              <tr key={cat.id}>
                <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                <td className="px-6 py-4">{cat.description || "-"}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => {setEditingId(cat.id); setFormData({name: cat.name, description: cat.description || ""})}} className="text-yellow-500 hover:underline">Editar</button>
                  <button onClick={async () => { if(confirm("¿Borrar?")) { await deleteCategory(cat.id); fetchCategories(); } }} className="text-red-500 hover:underline">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}