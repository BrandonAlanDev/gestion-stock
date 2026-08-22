"use client";

import { X } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { getContrastColor } from "@/lib/utils";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  const { pageConfig } = usePageConfig();
  const background = (pageConfig?.secondaryColor as string) || "#00b4d8";
  const textColor = getContrastColor(background);
  const isDarkBg = textColor === "#ffffff";
  const inputBg = isDarkBg ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const overlayBorder = isDarkBg ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const mutedColor = textColor + "99";

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
            className="px-4 py-2 rounded-lg text-sm font-bold uppercase"
            style={{ background: inputBg, border: `1px solid ${overlayBorder}`, color: mutedColor }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold uppercase text-white"
            style={{ background: "#ef4444" }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
