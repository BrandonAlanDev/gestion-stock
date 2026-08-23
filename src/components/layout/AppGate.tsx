"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CookieModal from "@/components/legal/CookieModal";
import PrivacyModal from "@/components/legal/PrivacyModal";
import TermsModal from "@/components/legal/TermsModal";
import PiePagina from "@/components/footer/PiePagina";

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
  const esRutaMantenimiento = pathname === "/mantenimiento";

  return (
    <div className="min-h-screen flex flex-col">
      {!esRutaMantenimiento && (
        <>
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
        </>
      )}

      {/* 3. Contenido de la aplicación */}
      <main className="flex flex-col flex-grow">
        {children}
      </main>

      {/* 4. Footer fijo al fondo para volver a leer los términos */}
      {!esRutaAdmin && !esRutaMantenimiento && (
        <PiePagina
          alAbrirPrivacidad={() => setIsPrivacyOpen(true)}
          alAbrirTerminos={() => setIsTermsOpen(true)}
        />
      )}
    </div>
  );
}