"use client";

import { useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
} from "lucide-react";

import Switch from "@/components/ui/switch";
import Badge from "@/components/ui/badge";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import type { MetodoPagoAdmin } from "@/actions/pagos/obtener-metodos-pago";

interface TarjetaMercadoPagoProps {
  metodo: MetodoPagoAdmin;
  activo: boolean;
  alCambiarActivo: (valor: boolean) => void;
  alDesconectar: () => void;
}

export default function TarjetaMercadoPago({
  metodo,
  activo,
  alCambiarActivo,
  alDesconectar,
}: TarjetaMercadoPagoProps) {
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const ejecutarDesconexion = () => {
    setMostrarConfirmacion(false);
    alDesconectar();
  };

  return (
    <section className="rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-[var(--admin-texto)]">
            <Wallet size={18} />
          </div>
          <div>
            <p className="font-semibold text-[var(--admin-texto)]">{metodo.nombre}</p>
            <p className="text-xs text-[var(--admin-texto-suave)]">{metodo.descripcion}</p>
          </div>
        </div>
        <Badge variante={metodo.conectado ? "activo" : "sin-configurar"}>
          {metodo.conectado ? "Conectado" : "No conectado"}
        </Badge>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3">
        {metodo.conectado ? (
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
        ) : (
          <XCircle size={16} className="mt-0.5 shrink-0 text-[var(--admin-texto-suave)]" />
        )}
        <div>
          <p className="text-sm font-medium text-[var(--admin-texto)]">
            {metodo.conectado ? "Cuenta de Mercado Pago conectada" : "Sin conectar"}
          </p>
          <p className="mt-0.5 text-xs text-[var(--admin-texto-suave)]">
            {metodo.conectado
              ? "Tu cuenta de Mercado Pago está lista para recibir pagos."
              : "Conectá tu cuenta de Mercado Pago para comenzar a recibir pagos."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--admin-borde)] pt-4">
        <div>
          <p className="text-sm font-medium text-[var(--admin-texto)]">Método activo</p>
          <p className="text-xs text-[var(--admin-texto-suave)]">
            {metodo.conectado
              ? "Habilitá o deshabilitá Mercado Pago en el checkout."
              : "Debés conectar tu cuenta para poder activar el método."}
          </p>
        </div>
        <Switch
          activo={activo}
          alCambiar={alCambiarActivo}
          deshabilitado={!metodo.conectado}
          mostrarEstado
        />
      </div>

      <div className="mt-4 border-t border-[var(--admin-borde)] pt-4">
        {metodo.conectado ? (
          <button
            type="button"
            onClick={() => setMostrarConfirmacion(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            <Unlink size={15} />
            Desconectar
          </button>
        ) : (
          <a
            href="/api/mercadopago/oauth/start"
            className="inline-flex items-center gap-2 rounded-lg bg-[#009EE3] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0088CC]"
          >
            <Link2 size={15} />
            Conectar Mercado Pago
          </a>
        )}
      </div>

      {mostrarConfirmacion && (
        <ConfirmDialog
          title="¿Desconectar Mercado Pago?"
          message="Si desconectás tu cuenta, los clientes no podrán utilizar Mercado Pago hasta que vuelvas a conectar una cuenta."
          textoConfirmar="Desconectar"
          onConfirm={ejecutarDesconexion}
          onCancel={() => setMostrarConfirmacion(false)}
        />
      )}
    </section>
  );
}
