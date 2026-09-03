"use client";
import { useEffect, useState } from "react";

import { useBloqueoScroll } from "@/hooks/use-bloqueo-scroll";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useTenantId } from "@/hooks/tenants/use-tenant-id";

interface TermsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const parrafosPorDefecto = [
  "El presente sistema es una herramienta de gestión proporcionada “tal cual”, sin garantías de ningún tipo, ya sean expresas o implícitas.",
  "El uso de la plataforma es responsabilidad exclusiva del usuario y/o administradores designados, quienes asumen el control total sobre los datos ingresados, modificados o eliminados dentro del sistema.",
  "El desarrollador no garantiza la disponibilidad continua del servicio ni la ausencia de errores, fallos técnicos o pérdidas de información.",
  "El usuario es responsable de verificar la exactitud de los datos gestionados, incluyendo pero no limitado a stock, operaciones, tickets y registros.",
  "El sistema no se responsabiliza por pérdidas económicas, lucro cesante, interrupción de actividades comerciales, ni daños directos o indirectos derivados del uso o imposibilidad de uso de la aplicación.",
  "Es responsabilidad del usuario realizar copias de seguridad (backups) de la información almacenada. El sistema no garantiza la recuperación de datos ante fallos o incidentes.",
  "En caso de existir múltiples administradores, cada uno será responsable por las acciones realizadas bajo su cuenta, incluyendo el acceso y uso de datos personales de terceros.",
  "El sistema puede almacenar información proporcionada por los usuarios, como correo electrónico, teléfono, historial de operaciones y tickets, los cuales serán utilizados únicamente con fines operativos internos.",
  "El acceso al sistema puede requerir autenticación mediante servicios de terceros. El uso de dichos servicios implica la aceptación de sus propios términos y políticas.",
  "El usuario se compromete a utilizar la plataforma de manera lícita y conforme a la normativa vigente, siendo responsable por cualquier uso indebido de la misma.",
  "El desarrollador se reserva el derecho de modificar estos términos en cualquier momento, siendo responsabilidad del usuario revisarlos periódicamente.",
  "El uso continuado del sistema implica la aceptación plena de los presentes términos y condiciones.",
];

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { pageConfig } = usePageConfig();
  const tenantId = useTenantId();

  useBloqueoScroll(visible);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAccepted(false); // reset cada vez que abre
    }
  }, [isOpen]);

  const handleAccept = () => {
    if (!accepted) return;

    localStorage.setItem(`${tenantId ?? "sin-tenant"}:termsAccepted`, "true");
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  const config = pageConfig as unknown as Record<string, unknown>;
  const rawTexto = config?.termsAndConditions;
  const textoDesdeBd =
    typeof rawTexto === "string" && rawTexto.trim().length > 0 ? rawTexto.trim() : null;
  const parrafos = textoDesdeBd
    ? textoDesdeBd.split("\n").filter((parrafo) => parrafo.trim().length > 0)
    : parrafosPorDefecto;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[var(--color-secundario)] rounded-2xl shadow-xl p-6 max-w-lg w-full border-2 border-[color-mix(in_srgb,var(--color-primario)_25%,transparent)] text-left">
        
        <h2 className="text-xl font-semibold mb-4 text-[var(--texto-sobre-secundario)]">
          Términos y Condiciones
        </h2>

        <div className="text-[var(--texto-sobre-secundario)] opacity-60 text-sm space-y-3 max-h-[55vh] overflow-y-auto pr-2">
          {parrafos.map((parrafo, indice) => (
            <p key={`terminos-${indice}`}>{parrafo}</p>
          ))}
        </div>

        {/* ✅ Checkbox obligatorio */}
        <div className="mt-4 flex items-start gap-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="acceptTerms" className="text-xs text-[var(--texto-sobre-secundario)] opacity-60">
            He leído y acepto los Términos y Condiciones. Entiendo que el uso del
            sistema es bajo mi responsabilidad.
          </label>
        </div>

        {/* 🔘 Botón aceptar */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleAccept}
            disabled={!accepted}
            className={`px-4 py-2 rounded-xl border transition ${
              accepted
                ? "border-[var(--color-primario)] text-[var(--texto-sobre-secundario)] hover:bg-[var(--color-primario)] hover:text-[var(--texto-sobre-primario)]"
                : "border-[color-mix(in_srgb,var(--color-primario)_25%,transparent)] text-[var(--texto-sobre-secundario)] opacity-40 cursor-not-allowed"
            }`}
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  );
}
