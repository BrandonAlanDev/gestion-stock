"use client";
import { useEffect, useState } from "react";

interface TermsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const [visible, setVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setAccepted(false); // reset cada vez que abre
    }
  }, [isOpen]);

  const handleAccept = () => {
    if (!accepted) return;

    localStorage.setItem("termsAccepted", "true");
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black rounded-2xl shadow-xl p-6 max-w-lg w-full border-2 border-white text-left">
        
        <h2 className="text-xl font-semibold mb-4 text-white">
          Términos y Condiciones
        </h2>

        <div className="text-gray-400 text-sm space-y-3 max-h-[55vh] overflow-y-auto pr-2">

          <p>
            El presente sistema es una herramienta de gestión proporcionada “tal cual”,
            sin garantías de ningún tipo, ya sean expresas o implícitas.
          </p>

          <p>
            El uso de la plataforma es responsabilidad exclusiva del usuario y/o
            administradores designados, quienes asumen el control total sobre los datos
            ingresados, modificados o eliminados dentro del sistema.
          </p>

          <p>
            El desarrollador no garantiza la disponibilidad continua del servicio ni la
            ausencia de errores, fallos técnicos o pérdidas de información.
          </p>

          <p>
            El usuario es responsable de verificar la exactitud de los datos gestionados,
            incluyendo pero no limitado a stock, operaciones, tickets y registros.
          </p>

          <p>
            El sistema no se responsabiliza por pérdidas económicas, lucro cesante,
            interrupción de actividades comerciales, ni daños directos o indirectos
            derivados del uso o imposibilidad de uso de la aplicación.
          </p>

          <p>
            Es responsabilidad del usuario realizar copias de seguridad (backups) de la
            información almacenada. El sistema no garantiza la recuperación de datos ante
            fallos o incidentes.
          </p>

          <p>
            En caso de existir múltiples administradores, cada uno será responsable por
            las acciones realizadas bajo su cuenta, incluyendo el acceso y uso de datos
            personales de terceros.
          </p>

          <p>
            El sistema puede almacenar información proporcionada por los usuarios, como
            correo electrónico, teléfono, historial de operaciones y tickets, los cuales
            serán utilizados únicamente con fines operativos internos.
          </p>

          <p>
            El acceso al sistema puede requerir autenticación mediante servicios de
            terceros. El uso de dichos servicios implica la aceptación de sus propios
            términos y políticas.
          </p>

          <p>
            El usuario se compromete a utilizar la plataforma de manera lícita y conforme
            a la normativa vigente, siendo responsable por cualquier uso indebido de la
            misma.
          </p>

          <p>
            El desarrollador se reserva el derecho de modificar estos términos en cualquier
            momento, siendo responsabilidad del usuario revisarlos periódicamente.
          </p>

          <p>
            El uso continuado del sistema implica la aceptación plena de los presentes
            términos y condiciones.
          </p>

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
          <label htmlFor="acceptTerms" className="text-xs text-gray-400">
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
                ? "border-gray-300 text-white hover:bg-white hover:text-black"
                : "border-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            Aceptar
          </button>
        </div>

      </div>
    </div>
  );
}