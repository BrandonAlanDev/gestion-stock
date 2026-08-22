"use client";

import { X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(7,26,24,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl relative"
        style={{ background: "#ffffff", border: "1px solid #b2dede" }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: "#4a7c80" }}
        >
          <X size={20} />
        </button>
        <h3
          className="text-xl font-black uppercase italic mb-4"
          style={{ color: "#083d42" }}
        >
          {title}
        </h3>
        <p className="text-sm mb-8" style={{ color: "#4a7c80" }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-bold uppercase"
            style={{ background: "#f0fafa", color: "#4a7c80" }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-bold uppercase text-white"
            style={{ background: "#e05050" }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}