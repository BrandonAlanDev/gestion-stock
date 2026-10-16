"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { ContextoCapas } from "@/contextos/capas/contexto-capas";
import { useCapa } from "@/contextos/capas/use-capa";

interface ConfirmacionEliminarSeccionProps {
  onCancelar: () => void;
  onConfirmar: () => void;
  primaryColor: string;
  secondaryColor: string;
}

export default function ConfirmacionEliminarSeccion({
  onCancelar,
  onConfirmar,
}: ConfirmacionEliminarSeccionProps) {
  const { nivel, zIndice } = useCapa();

  return (
    <ContextoCapas.Provider value={nivel + 1}>
      <div className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" style={{ zIndex: zIndice }}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-opaco)] p-6 text-[var(--admin-texto)] shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-peligro-suave)] text-[var(--admin-peligro)]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-[var(--admin-texto)]">Eliminar sección</h3>
        </div>
        <p className="mb-6 text-[var(--admin-texto-suave)]">
          ¿Estás seguro de que quieres eliminar esta sección y todos sus slides? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 font-medium text-[var(--admin-texto-suave)] transition-all hover:bg-[var(--admin-fondo-hover)] hover:text-[var(--admin-texto)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--admin-peligro-accion)] px-4 py-2 font-black uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>
      </div>
    </ContextoCapas.Provider>
  );
}
