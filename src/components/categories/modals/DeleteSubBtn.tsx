"use client";
import { X } from "lucide-react";
import { deleteSubCategory } from "@/actions/categories";
import { toast } from "sonner";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

export default function DeleteSubBtn({ id, onDeleted }: { id: string; onDeleted?: () => void }) {
  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const textColor = getContrastColor(background);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta subcategoría?")) return;
    const res = await deleteSubCategory(id);
    if (res?.error) toast.error(res.error);
    else { toast.success("Removido"); onDeleted?.(); }
  };

  return (
    <button
      onClick={handleDelete}
      className="transition-colors"
      style={{ color: textColor, opacity: 0.5 }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = textColor;
        (e.currentTarget as HTMLButtonElement).style.opacity = "0.5";
      }}
    >
      <X size={14} />
    </button>
  );
}
