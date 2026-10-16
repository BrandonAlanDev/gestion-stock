"use client";
import { X } from "lucide-react";
import { deleteSubCategory } from "@/actions/categorias/eliminar-subcategoria";
import { toast } from "sonner";

export default function DeleteSubBtn({ id, onDeleted }: { id: string; onDeleted?: () => void }) {
  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta subcategoría?")) return;
    const res = await deleteSubCategory(id);
    if (res?.error) toast.error(res.error);
    else { toast.success("Removido"); onDeleted?.(); }
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-md p-1 text-[var(--admin-texto-suave)] opacity-60 transition-colors hover:bg-[var(--admin-peligro-suave)] hover:text-[var(--admin-peligro)] hover:opacity-100"
    >
      <X size={14} />
    </button>
  );
}
