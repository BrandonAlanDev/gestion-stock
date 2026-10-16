"use client";

import { Edit2 } from "lucide-react";

export default function CategoryTriggerButton({
  isEdit,
  onOpen,
}: {
  isEdit: boolean;
  onOpen: () => void;
}) {
  if (isEdit) {
    return (
      <button
        onClick={onOpen}
        className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-2.5 text-[var(--admin-texto-suave)] transition-colors hover:border-[var(--admin-primario)] hover:text-[var(--admin-primario)]"
      >
        <Edit2 size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="rounded-xl bg-[var(--admin-primario)] px-5 py-2.5 text-[13px] font-black uppercase italic tracking-tighter text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90"
    >
      + Nueva Categoría
    </button>
  );
}
