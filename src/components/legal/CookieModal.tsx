// src/components/legal/CookieModal.tsx
"use client";
import { useState, useEffect } from "react";
import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

interface CookieModalProps {
  onAccept?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export default function CookieModal({ onAccept, onOpenPrivacy, onOpenTerms }: CookieModalProps) {
  const [visible, setVisible] = useState(false);
  const tenantId = useTenantId();

  useBloqueoScroll(visible);

  useEffect(() => {
    const acknowledged = localStorage.getItem(
      `${tenantId ?? "sin-tenant"}:allConsentsAcknowledged`
    );
    setVisible(!acknowledged);
  }, [tenantId]);

  const handleAccept = () => {
    const prefijoTenant = tenantId ?? "sin-tenant";
    localStorage.setItem(`${prefijoTenant}:allConsentsAcknowledged`, "true");
    localStorage.setItem(`${prefijoTenant}:cookiesAcknowledged`, "true");
    localStorage.setItem(`${prefijoTenant}:privacySeen`, "true");
    localStorage.setItem(`${prefijoTenant}:termsAccepted`, "true");

    setVisible(false);
    onAccept?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-[var(--color-secundario)] rounded-2xl p-6 max-w-md w-full text-left border-2 border-[color-mix(in_srgb,var(--color-primario)_25%,transparent)] shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-[var(--texto-sobre-secundario)] text-center">
          Aviso de Consentimiento
        </h2>

        <p className="text-[var(--texto-sobre-secundario)] opacity-60 text-sm mb-6 text-center">
          Este sitio utiliza cookies esenciales para gestionar la autenticación y
          garantizar un funcionamiento seguro. Al hacer clic en &quot;Aceptar&quot;
          confirmás que has leído y aceptás nuestra{" "}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[var(--color-primario)] underline hover:opacity-80"
          >
            política de privacidad
          </button>{" "}
          y nuestros{" "}
          <button
            type="button"
            onClick={onOpenTerms}
            className="text-[var(--color-primario)] underline hover:opacity-80"
          >
            términos de uso
          </button>
          .
        </p>

        <div className="flex justify-center">
          <button
            onClick={handleAccept}
            className="w-full px-4 py-2 rounded-xl border border-[var(--color-primario)] text-[var(--texto-sobre-secundario)] hover:bg-[var(--color-primario)] hover:text-[var(--texto-sobre-primario)] transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
