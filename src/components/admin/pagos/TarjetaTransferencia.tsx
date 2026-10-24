"use client";

import { useState } from "react";
import { Landmark, Pencil } from "lucide-react";

import Switch from "@/components/ui/switch";
import Badge from "@/components/ui/badge";
import type { MetodoPagoAdmin } from "@/actions/pagos/obtener-metodos-pago";
import ConfiguracionVencimiento from "./ConfiguracionVencimiento";

interface TarjetaTransferenciaProps {
  metodo: MetodoPagoAdmin;
  activo: boolean;
  alCambiarActivo: (valor: boolean) => void;
  alGuardarConfig: (instrucciones: string) => void;
  alGuardarVencimiento: (valor: MetodoPagoAdmin["vencimiento"]) => Promise<boolean>;
}

export default function TarjetaTransferencia({
  metodo,
  activo,
  alCambiarActivo,
  alGuardarConfig,
  alGuardarVencimiento,
}: TarjetaTransferenciaProps) {
  const [configuracionAbierta, setConfiguracionAbierta] = useState(false);
  const [texto, setTexto] = useState(metodo.instrucciones ?? "");

  const alternarConfiguracion = () => {
    if (!configuracionAbierta) {
      setTexto(metodo.instrucciones ?? "");
    }
    setConfiguracionAbierta((abierto) => !abierto);
  };

  const estadoConfiguracion = !metodo.activo || metodo.estadoConfiguracion === "DESACTIVADA"
    ? "El método está desactivado. La configuración se conserva y no se consulta su disponibilidad."
    : metodo.estadoConfiguracion === "ERROR_TEMPORAL"
    ? "No pudimos verificar temporalmente la configuración bancaria. La transferencia no aparecerá en el checkout hasta que se pueda comprobar."
    : metodo.estadoConfiguracion === "INCOMPLETA"
      ? "Faltan instrucciones bancarias. La transferencia no aparecerá en el checkout hasta completar la configuración."
      : "Configuración bancaria lista. El método aparecerá en el checkout cuando esté activado.";

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

      <p
        role={metodo.estadoConfiguracion === "ERROR_TEMPORAL" ? "status" : undefined}
        className="mt-3 text-xs text-[var(--admin-texto-suave)]"
      >
        {estadoConfiguracion}
      </p>

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
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90"
            >
              <Pencil size={14} />
              Guardar
            </button>
          </div>
        )}
      </div>
      <ConfiguracionVencimiento
        valor={metodo.vencimiento}
        alGuardar={alGuardarVencimiento}
      />
      <p className="mt-3 text-xs text-[var(--admin-texto-suave)]">
        Cuando el cliente informa la transferencia, la reserva queda en revisión sin vencimiento automático hasta que administración confirme o rechace el pago.
      </p>
    </section>
  );
}
