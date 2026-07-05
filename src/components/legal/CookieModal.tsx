"use client";
import { useState, useEffect } from "react";

interface CookieModalProps {
  onAccept?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export default function CookieModal({ onAccept, onOpenPrivacy, onOpenTerms }: CookieModalProps) {
  const [visible, setVisible] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const acknowledged = localStorage.getItem("allConsentsAcknowledged");
    if (!acknowledged) setVisible(true);
  }, []);

  const handleAcceptAll = () => {
    if (!cookiesAccepted || !termsAccepted) return;
    
    localStorage.setItem("allConsentsAcknowledged", "true");
    localStorage.setItem("cookiesAcknowledged", "true");
    localStorage.setItem("privacySeen", "true");
    localStorage.setItem("termsAccepted", "true");
    
    setVisible(false);
    onAccept?.();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]">
      <div className="bg-black rounded-2xl p-6 max-w-md w-full text-left border-2 border-white shadow-xl">
        
        <h2 className="text-xl font-semibold mb-4 text-white text-center">
          Aviso de Consentimiento
        </h2>

        <p className="text-gray-400 text-sm mb-6 text-center">
          Este sitio utiliza cookies esenciales para gestionar la autenticación y garantizar un funcionamiento seguro. Debés aceptar nuestras políticas para continuar.
        </p>

        <div className="space-y-4 mb-6">
          {/* Cookies */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptCookies"
              checked={cookiesAccepted}
              onChange={(e) => setCookiesAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="acceptCookies" className="text-sm text-gray-300 cursor-pointer">
              Acepto el uso de cookies esenciales.
            </label>
          </div>

          {/* Privacidad y Términos */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-300 select-none">
              He leído y acepto la{" "}
              <button 
                type="button" 
                onClick={onOpenPrivacy} 
                className="text-blue-400 underline hover:text-blue-300"
              >
                política de privacidad
              </button>{" "}
              y los{" "}
              <button 
                type="button" 
                onClick={onOpenTerms} 
                className="text-blue-400 underline hover:text-blue-300"
              >
                términos de uso
              </button>.
            </label>
          </div>
        </div>

        {/* Botón Aceptar Todo */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handleAcceptAll}
            disabled={!cookiesAccepted || !termsAccepted}
            className={`w-full px-4 py-2 rounded-xl border transition ${
              cookiesAccepted && termsAccepted
                ? "border-gray-300 text-white hover:bg-white hover:text-black"
                : "border-gray-700 text-gray-600 cursor-not-allowed"
            }`}
          >
            Continuar
          </button>
        </div>

      </div>
    </div>
  );
}