"use client";

import { useState } from "react";
import { Landmark, Pencil } from "lucide-react";

import Switch from "@/components/ui/switch";
import Badge from "@/components/ui/badge";
import type { MetodoPagoAdmin } from "@/actions/pagos/obtener-metodos-pago";

interface TarjetaTransferenciaProps {
  metodo: MetodoPagoAdmin;
  activo: boolean;
  alCambiarActivo: (valor: boolean) => void;
  alGuardarConfig: (instrucciones: string) => void;
}

export default function TarjetaTransferencia({
  metodo,
  activo,
  alCambiarActivo,
  alGuardarConfig,
}: TarjetaTransferenciaProps) {
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);
  const [texto, setTexto] = useState(metodo.instrucciones ?? "");

  const alternarConfiguracion = () => {
    if (!configuracionAbierta) {
      setTexto(metodo.instrucciones ?? "");
    }
    setConfiguracionAbierta((abierto) => !abierto);
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]">
            <Landmark size={18} />
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
            Permití que tus clientes paguen mediante transferencia bancaria.
          </p>
        </div>
        <Switch activo={activo} alCambiar={alCambiarActivo} mostrarEstado />
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[var(--admin-borde)] pt-4">
        <button
          type="button"
          onClick={alternarConfiguracion}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-4 py-2 text-sm font-semibold text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]"
        >
          <Pencil size={15} />
          {configuracionAbierta ? "Ocultar configuración" : "Configurar"}
        </button>

        {configuracionAbierta && (
          <div className="space-y-3 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3">
            <label
              htmlFor="instrucciones-transferencia"
              className="text-xs font-medium text-[var(--admin-texto)]"
            >
              Instrucciones para el cliente
            </label>
            <textarea
              id="instrucciones-transferencia"
              rows={5}
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Ej.: CBU: 0000000000000000000000, titular: Juan Pérez, banco: ..."
              className="w-full resize-y rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-3 text-sm text-[var(--admin-texto)] outline-none transition focus:border-[var(--admin-primario)]"
            />
            <button
              type="button"
              onClick={() => alGuardarConfig(texto)}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Pencil size={14} />
              Guardar
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
