"use client";
import { loginAction } from "@/actions/auth-actions";
import GoogleButton from "@/components/auth/google-button";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(loginAction, { error: "", success: false });

  useEffect(() => {
    if (state.success) {
      onClose();
      router.push("/dashboard");
      router.refresh();
    }
  }, [state.success, router, onClose]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative max-w-md w-full bg-[var(--color-secundario)] text-[var(--texto-sobre-secundario)] rounded-xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--texto-sobre-secundario)]/50 hover:text-[var(--texto-sobre-secundario)]/80 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
        </div>

        <div className="space-y-4">
          <GoogleButton />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[color-mix(in_srgb,var(--texto-sobre-secundario)_15%,transparent)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[var(--color-secundario)] px-2 text-[var(--texto-sobre-secundario)]/50">O con tu email</span>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--texto-sobre-secundario)]/80 mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-3 py-2 border border-[color-mix(in_srgb,var(--texto-sobre-secundario)_15%,transparent)] rounded-lg outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primario)_50%,transparent)]" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--texto-sobre-secundario)]/80 mb-1">Contraseña</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full px-3 py-2 border border-[color-mix(in_srgb,var(--texto-sobre-secundario)_15%,transparent)] rounded-lg outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primario)_50%,transparent)]" 
            />
          </div>

          {state.error && (
            <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg text-center">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[var(--color-primario)] hover:opacity-90 text-[var(--texto-sobre-primario)] font-medium py-2 px-4 rounded-lg transition-all disabled:opacity-70"
          >
            {isPending ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--texto-sobre-secundario)]/60">
          ¿No tienes cuenta?{" "}
          <button 
            onClick={onClose}
            className="text-[var(--color-primario)] hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}