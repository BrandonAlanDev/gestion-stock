"use client";

import { AlertTriangle } from "lucide-react";

interface PropiedadesConfirmacionEliminacion {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName, isDeleting }: PropiedadesConfirmacionEliminacion) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-6 text-[var(--admin-texto)] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="mb-4 flex items-center gap-4 text-[var(--admin-peligro)]">
          <div className="rounded-full bg-[var(--admin-peligro-suave)] p-3">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-black">Eliminar Página</h2>
        </div>

        <p className="mb-6 text-[var(--admin-texto-suave)]">
          ¿Estás seguro que deseas eliminar la página <b>{itemName}</b>? Esta acción eliminará también todas sus secciones y los ítems que contengan. <b>Esta acción no se puede deshacer.</b>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl bg-[var(--admin-primario-suave)] px-5 py-2.5 font-bold text-[var(--admin-primario)] transition-opacity hover:opacity-80 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-xl bg-[var(--admin-peligro-accion)] px-5 py-2.5 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
