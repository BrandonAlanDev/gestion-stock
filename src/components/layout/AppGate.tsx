"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CookieModal from "../legal/CookieModal";
import PrivacyModal from "../legal/PrivacyModal";
import TermsModal from "../legal/TermsModal";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Evitamos errores de hidratación asegurándonos de que se renderice en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const esRutaAdmin = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Modal Principal de Consentimiento (solo aparece si no aceptó antes) */}
      {!isPrivacyOpen && !isTermsOpen && (
        <CookieModal
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenTerms={() => setIsTermsOpen(true)}
        />
      )}

      {/* 2. Modales Secundarios (controlados manualmente) */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* 3. Contenido de la aplicación */}
      <main className="flex flex-col flex-grow">
        {children}
      </main>

      {/* 4. Footer fijo al fondo para volver a leer los términos */}
      {!esRutaAdmin && (
        <footer className="bg-[var(--color-fondo-sitio)] border-t border-[color-mix(in_srgb,var(--color-primario)_25%,transparent)] py-6 text-center text-sm z-40">
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-100 hover:text-[var(--color-primario)] transition"
            >
              Política de Privacidad
            </button>
            <span className="text-[var(--texto-sobre-fondo)] opacity-40">|</span>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-[var(--texto-sobre-fondo)] opacity-60 hover:opacity-100 hover:text-[var(--color-primario)] transition"
            >
              Términos y Condiciones
            </button>
          </div>
          <p className="mt-4 text-xs text-[var(--texto-sobre-fondo)] opacity-40">
            &copy; {new Date().getFullYear()} - Todos los derechos reservados.
          </p>
        </footer>
      )}
    </div>
  );
}