"use client";

import Switch from "@/components/ui/switch";

interface Props {
  activo: boolean;
  onChange: (valor: boolean) => void;
}

export default function ProductoEstadoVisibilidad({ activo, onChange }: Props) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--admin-texto)]">Estado y visibilidad</h3>
      <div className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-2">
        <Switch
          activo={activo}
          alCambiar={onChange}
          etiqueta="Producto activo"
          descripcion="Visible en tu tienda online"
          mostrarEstado
        />
      </div>
    </section>
  );
}
