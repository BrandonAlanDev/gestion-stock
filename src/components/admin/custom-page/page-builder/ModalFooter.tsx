"use client";

import { Save } from "lucide-react";

export default function ModalFooter({
  onClose,
  isSaving,
}: {
  onClose: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="z-10 flex flex-col-reverse gap-3 border-t border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-4 shadow-lg sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={isSaving}
        className="w-full rounded-xl bg-[var(--admin-primario-suave)] px-6 py-3 font-bold text-[var(--admin-primario)] transition-opacity hover:opacity-80 disabled:opacity-60 sm:w-auto"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="page-builder-form"
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-primario)] px-6 py-3 font-bold text-[var(--admin-primario-texto)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Save size={18} />
        {isSaving ? "Guardando..." : "Guardar Página Dinámica"}
      </button>
    </div>
  );
}
