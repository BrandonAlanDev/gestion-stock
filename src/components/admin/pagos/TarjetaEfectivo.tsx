"use client";

import { Banknote } from "lucide-react";
import Switch from "@/components/ui/switch";
import Badge from "@/components/ui/badge";
import type { MetodoPagoAdmin } from "@/actions/pagos/obtener-metodos-pago";

export default function TarjetaEfectivo({
  metodo,
  activo,
  alCambiarActivo,
}: {
  metodo: MetodoPagoAdmin;
  activo: boolean;
  alCambiarActivo: (valor: boolean) => void;
}) {
  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]">
            <Banknote size={18} />
          </div>
          <div>
            <p className="font-semibold text-[var(--admin-texto)]">{metodo.nombre}</p>
            <p className="text-xs text-[var(--admin-texto-suave)]">{metodo.descripcion}</p>
          </div>
        </div>
        <Badge variante={activo ? "activo" : "inactivo"}>
          {activo ? "Activado" : "Desactivado"}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--admin-borde)] pt-4">
        <div>
          <p className="text-sm font-medium text-[var(--admin-texto)]">Método activo</p>
          <p className="text-xs text-[var(--admin-texto-suave)]">
            El cliente paga en efectivo al retirar el pedido en la tienda.
          </p>
        </div>
        <Switch activo={activo} alCambiar={alCambiarActivo} mostrarEstado />
      </div>
    </section>
  );
}
