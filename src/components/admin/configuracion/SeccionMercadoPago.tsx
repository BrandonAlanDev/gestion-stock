"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { desconectarMP } from "@/actions/mercadopago/desconectar";
import { obtenerEstadoOAuthMP } from "@/actions/mercadopago/estado-oauth";
import type { EstadoConexionMP, EstadoOAuthMP } from "@/types/mercadopago";

interface SeccionMercadoPagoProps {
  estadoInicial: EstadoConexionMP;
}

export default function SeccionMercadoPago({ estadoInicial }: SeccionMercadoPagoProps) {
  const [estado, setEstado] = useState(estadoInicial);
  const [configOAuth, setConfigOAuth] = useState<EstadoOAuthMP | null>(null);
  const [pendiente, startTransicion] = useTransition();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    void obtenerEstadoOAuthMP().then(setConfigOAuth);
  }, []);

  useEffect(() => {
    setEstado(estadoInicial);
  }, [estadoInicial]);

  const ejecutarDesconexion = () => {
    setMostrarConfirmacion(false);
    startTransicion(async () => {
      const resultado = await desconectarMP();
      if (resultado.success) {
        toast.success("Cuenta desconectada correctamente");
        setEstado({ conectada: false, nombreCuenta: null, actualizadaEn: null });
      } else {
        toast.error("Error al desconectar", {
          description: resultado.error || "No se pudo desconectar la cuenta",
        });
      }
    });
  };

  const conexionDisponible =
    configOAuth?.clientIdConfigurado && configOAuth.clientSecretConfigurado;

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {estado.conectada ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <div>
            <p className="font-semibold text-[var(--admin-texto)]">
              {estado.conectada ? "Cuenta conectada" : "Sin conectar"}
            </p>
            <p className="text-xs text-[var(--admin-texto-suave)]">
              {estado.conectada
                ? "Los pagos se acreditan en esta cuenta"
                : "Conectá una cuenta para poder cobrar online"}
            </p>
          </div>
        </div>
      </div>

      {estado.conectada && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--admin-borde)] pt-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--admin-texto-suave)] mb-1">
              Cuenta que recibe los cobros
            </p>
            <p className="text-[var(--admin-texto)]">
              {estado.nombreCuenta ?? "Cuenta de Mercado Pago conectada"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--admin-texto-suave)] mb-1">
              Última actualización
            </p>
            <p className="text-[var(--admin-texto)]">
              {estado.actualizadaEn
                ? new Date(estado.actualizadaEn).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short" })
                : "-"}
            </p>
          </div>
        </div>
      )}

      {!estado.conectada && !conexionDisponible && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            Faltan variables de entorno para conectarte (
            {!configOAuth?.clientIdConfigurado ? "MP_CLIENT_ID " : ""}
            {!configOAuth?.clientSecretConfigurado ? "MP_CLIENT_SECRET" : ""}).
          </span>
        </div>
      )}

      <div className="border-t border-[var(--admin-borde)] pt-4">
        {estado.conectada ? (
          <button
            onClick={() => setMostrarConfirmacion(true)}
            disabled={pendiente}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {pendiente ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
            Desconectar cuenta
          </button>
        ) : (
          <a
            href="/api/mercadopago/oauth/start"
            className="inline-flex items-center gap-2 rounded-lg bg-[#009EE3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0088CC]"
          >
            <Link2 className="h-4 w-4" />
            Conectar con Mercado Pago
          </a>
        )}
      </div>

      {configOAuth?.uriRedireccion && (
        <div className="rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] p-3 text-xs text-[var(--admin-texto-suave)]">
          <p className="font-semibold text-[var(--admin-texto)]">URL de redirección (OAuth)</p>
          <p className="mt-1 break-all font-mono">{configOAuth.uriRedireccion}</p>
        </div>
      )}

      {mostrarConfirmacion && (
        <ConfirmDialog
          title="Desconectar Mercado Pago"
          message="¿Estás seguro? Dejarás de recibir pagos online hasta que conectes otra cuenta."
          onConfirm={ejecutarDesconexion}
          onCancel={() => setMostrarConfirmacion(false)}
        />
      )}
    </section>
  );
}
