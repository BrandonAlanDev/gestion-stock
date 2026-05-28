"use client";
import { X } from "lucide-react";
import { deleteSubCategory } from "@/actions/garments";
import { toast } from "sonner";

export default function DeleteSubBtn({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta subcategoría?")) return;
    const res = await deleteSubCategory(id);
    if (res?.error) toast.error(res.error);
    else toast.success("Removido");
  };

  return (
    <button onClick={handleDelete} className="text-neutral-700 hover:text-red-500 transition-colors">
      <X size={14} />
    </button>
  );
}