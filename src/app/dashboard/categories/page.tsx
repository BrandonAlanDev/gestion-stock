"use client";

import { useEffect, useState } from "react";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../../../actions/garments";
import { CategoryInput, categorySchema } from "@/lib/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState<CategoryInput>({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = categorySchema.safeParse(formData);
    if (!result.success) {
        alert("Error: " + result.error.message);
        return;
    }

    try {
        if (editingId) {
        // USANDO LA FUNCIÓN UPDATE
        const response = await updateCategory(editingId, formData);
        if (response.error) throw new Error("No se pudo actualizar");
        setEditingId(null);
        } else {
        // USANDO LA FUNCIÓN CREATE
        const response = await createCategory(formData);
        if (response.error) throw new Error("No se pudo crear");
        }

        // Limpiar y refrescar
        setFormData({ name: "", description: "" });
        fetchCategories();
        alert(editingId ? "Categoría actualizada" : "Categoría creada");
        
    } catch (error: any) {
        alert(error.message);
    }
    };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, description: cat.description || "" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
      await deleteCategory(id);
      fetchCategories();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pt-20 ">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Gestión de Stock</h1>
        <div className="flex flex-row gap-4">
          <Link href="/dashboard" >
            <Button variant={"blanco"} className="px-4 py-2 rounded-lg text-sm font-medium">
              Productos
            </Button>
          </Link>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Remeras, Pantalones..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Descripción (Opcional)</label>
            <input
              type="text"
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={"amarillo"}
            type="submit"
            className="px-4 py-2"
          >
            {editingId ? "Actualizar Categoría" : "Crear Categoría"}
          </Button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setFormData({ name: "", description: "" }); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Descripción</th>
              <th className="px-6 py-3 text-sm font-right text-gray-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400">Cargando...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-400">No hay categorías registradas.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-600">{cat.description || "-"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}