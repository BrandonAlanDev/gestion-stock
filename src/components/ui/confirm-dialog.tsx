"use client";

import { X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { obtenerColorContraste as getContrastColor } from "@/lib/utilidades/obtener-color-contraste";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";
import { useContext } from "react";
import { ContextoTemaAdmin } from "@/contextos/admin/contexto-tema-admin";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  textoConfirmar?: string;
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  textoConfirmar,
}: ConfirmDialogProps) {
  useBloqueoScroll(true);

  const { pageConfig } = usePageConfig();
  const contextoTemaAdmin = useContext(ContextoTemaAdmin);
  const adminActivo = contextoTemaAdmin !== null;
  const temaOscuro = contextoTemaAdmin?.tema === "oscuro";
  const background = adminActivo
    ? "var(--admin-fondo-opaco)"
    : (pageConfig?.secondaryColor as string) || "#00b4d8";
  const textColor = adminActivo
    ? "var(--admin-texto)"
    : getContrastColor(background);
  const isDarkBg = adminActivo
    ? temaOscuro
    : textColor === "#ffffff";
  const inputBg = adminActivo
    ? "var(--admin-fondo-suave)"
    : isDarkBg
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.04)";
  const overlayBorder = adminActivo
    ? "var(--admin-borde)"
    : isDarkBg
      ? "rgba(255,255,255,0.12)"
      : "rgba(0,0,0,0.08)";
  const mutedColor = adminActivo
    ? "var(--admin-texto-suave)"
    : textColor + "99";
  const colorPeligro = adminActivo ? "var(--admin-peligro-accion)" : "#ef4444";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl relative"
        style={{ background: background, border: `1px solid ${overlayBorder}` }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: mutedColor }}
        >
          <X size={20} />
        </button>
        <h3
          className="text-xl font-black uppercase italic mb-4"
          style={{ color: textColor }}
        >
          {title}
        </h3>
        <p className="text-sm mb-8" style={{ color: mutedColor }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold uppercase cursor-pointer"
            style={{ background: inputBg, border: `1px solid ${overlayBorder}`, color: mutedColor }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold uppercase text-white cursor-pointer"
            style={{ background: colorPeligro }}
          >
            {textoConfirmar ?? "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
