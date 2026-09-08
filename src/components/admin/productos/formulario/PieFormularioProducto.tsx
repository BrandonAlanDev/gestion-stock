"use client";

import { CLASE_BOTON_PRIMARIO } from "@/lib/productos/estilos";

interface Props {
  esEdicion: boolean;
  cargando: boolean;
  onCancelar: () => void;
  onGuardarBorrador: () => void;
}

export default function PieFormularioProducto({ esEdicion, cargando, onCancelar, onGuardarBorrador }: Props) {
  return (
    <div className="flex flex-col-reverse items-stretch gap-2 border-t border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onCancelar}
        disabled={cargando}
        className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)] disabled:opacity-50"
      >
        Cancelar
      </button>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onGuardarBorrador}
          disabled={cargando}
          className="cursor-pointer rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)] disabled:opacity-50"
        >
          Guardar como borrador
        </button>
        <button
          type="submit"
          disabled={cargando}
          className={`${CLASE_BOTON_PRIMARIO} cursor-pointer`}
        >
          {cargando ? "Procesando..." : esEdicion ? "Guardar cambios" : "Crear producto"}
        </button>
      </div>
    </div>
  );
}
