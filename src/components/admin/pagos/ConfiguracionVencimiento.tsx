"use client";

import { useEffect, useId, useState } from "react";
import { Clock3 } from "lucide-react";
import Switch from "@/components/ui/switch";

interface ValorVencimiento {
  habilitado: boolean;
  horas: number;
}

export default function ConfiguracionVencimiento({
  valor,
  alGuardar,
}: {
  valor: ValorVencimiento;
  alGuardar: (siguiente: ValorVencimiento) => Promise<boolean>;
}) {
  const [habilitado, setHabilitado] = useState(valor.habilitado);
  const [horas, setHoras] = useState(String(valor.horas));
  const [guardando, setGuardando] = useState(false);
  const idAyuda = useId();

  useEffect(() => {
    setHabilitado(valor.habilitado);
    setHoras(String(valor.horas));
  }, [valor.habilitado, valor.horas]);

  const cantidadHoras = Number(horas);
  const valido = Number.isInteger(cantidadHoras) && cantidadHoras >= 1 && cantidadHoras <= 720;

  async function guardar() {
    if (!valido || guardando) return;
    setGuardando(true);
    try {
      await alGuardar({ habilitado, horas: cantidadHoras });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--admin-borde)] pt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-[var(--admin-texto)]">
            <Clock3 size={15} /> Vencimiento de la reserva
          </p>
          <p className="mt-1 text-xs text-[var(--admin-texto-suave)]">
            {habilitado
              ? "El pedido se cancelará al vencer si el pago sigue pendiente."
              : "Sin vencimiento automático hasta que actives esta opción."}
          </p>
        </div>
        <Switch activo={habilitado} alCambiar={setHabilitado} mostrarEstado />
      </div>

      <label className="block text-sm text-[var(--admin-texto)]">
        Duración en horas
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={720}
          step={1}
          value={horas}
          onChange={(evento) => setHoras(evento.target.value)}
          aria-describedby={idAyuda}
          className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2"
        />
      </label>
      <p id={idAyuda} className="text-xs text-[var(--admin-texto-suave)]">
        Entre 1 y 720 horas. El valor sugerido es 48 horas. Los cambios aplican a pedidos nuevos.
      </p>
      <button
        type="button"
        disabled={!valido || guardando}
        onClick={() => void guardar()}
        className="rounded-lg border border-[var(--admin-borde)] px-4 py-2 text-sm font-semibold text-[var(--admin-texto)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {guardando ? "Guardando vencimiento..." : "Guardar vencimiento"}
      </button>
    </div>
  );
}
