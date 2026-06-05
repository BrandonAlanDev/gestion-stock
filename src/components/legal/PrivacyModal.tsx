"use client";
import { useEffect, useState } from "react";

interface PrivacyModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem("cookiesAcknowledged");
    const privacySeen = localStorage.getItem("privacySeen");

    // abrir automático SOLO la primera vez después de aceptar cookies
    if (cookiesAccepted && !privacySeen) {
      const timer = setTimeout(() => {
        setVisible(true);
        localStorage.setItem("privacySeen", "true");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  // apertura manual (botón externo)
  useEffect(() => {
    if (isOpen) setVisible(true);
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-black rounded-2xl shadow-xl p-6 max-w-lg w-full border-2 border-white text-left">
        
        <h2 className="text-xl font-semibold mb-4 text-white">
          Política de Privacidad
        </h2>

        <div className="text-gray-400 text-sm space-y-3 max-h-[60vh] overflow-y-auto pr-2">

          <p>
            Esta aplicación recopila y almacena datos proporcionados por los
            usuarios, como correo electrónico y teléfono, con el único fin de
            gestionar cuentas, operaciones y tickets dentro del sistema.
          </p>

          <p>
            Los datos no son vendidos ni compartidos con terceros, salvo cuando
            sea necesario para autenticación mediante servicios externos o por
            obligación legal.
          </p>

          <p>
            El acceso a la información está limitado a administradores del
            sistema, quienes pueden utilizar los datos únicamente con fines
            operativos.
          </p>

          <p>
            Los usuarios pueden solicitar la modificación o eliminación de sus
            datos en cualquier momento.
          </p>

          <p>
            Se aplican medidas de seguridad razonables para proteger la
            información, aunque no se garantiza seguridad absoluta.
          </p>

        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-white hover:bg-white hover:text-black transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}