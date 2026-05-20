"use client";

import { useState, useEffect } from "react";
import CookieModal from "@/components/CookieModal";
import PrivacyModal from "@/components/PrivacyModal";
import TermsModal from "@/components/TermsModal";
import { Footer } from "./Footer";

export default function AppGate({ children }: { children: React.ReactNode }) {
  const [acceptedCookies, setAcceptedCookies] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [initialized, setInitialized] = useState(false);

  // 🔍 Inicialización robusta
  useEffect(() => {
    const cookies = localStorage.getItem("cookiesAcknowledged");
    const terms = localStorage.getItem("termsAccepted");
    const privacySeen = localStorage.getItem("privacySeen");

    if (cookies) setAcceptedCookies(true);
    if (terms) setAcceptedTerms(true);

    // 🔁 reconstrucción del flujo según estado previo
    if (cookies) {
      if (!privacySeen) {
        setTimeout(() => setPrivacyOpen(true), 500);
      } else if (!terms) {
        setTimeout(() => setTermsOpen(true), 500);
      }
    }

    setInitialized(true);
  }, []);

  // ✅ aceptar cookies
  const handleAcceptCookies = () => {
    localStorage.setItem("cookiesAcknowledged", "true");
    setAcceptedCookies(true);

    setTimeout(() => {
      const privacySeen = localStorage.getItem("privacySeen");

      if (!privacySeen) {
        setPrivacyOpen(true);
        localStorage.setItem("privacySeen", "true");
      } else if (!localStorage.getItem("termsAccepted")) {
        setTermsOpen(true);
      }
    }, 1000);
  };

  // ✅ cerrar privacy
  const handleClosePrivacy = () => {
    setPrivacyOpen(false);

    // si no aceptó terms → abrirlo sí o sí
    if (!localStorage.getItem("termsAccepted")) {
      setTimeout(() => setTermsOpen(true), 300);
    }
  };

  // ✅ aceptar terms
  const handleAcceptTerms = () => {
    localStorage.setItem("termsAccepted", "true");
    setAcceptedTerms(true);
    setTermsOpen(false);
  };

  const isFullyAccepted = acceptedCookies && acceptedTerms;

  // ⛔ evitar flicker antes de cargar estado
  if (!initialized) return null;

  return (
    <>
      {/* 🔒 COOKIES BLOQUEAN TODO */}
      {!acceptedCookies && (
        <CookieModal onAccept={handleAcceptCookies} />
      )}

      {/* 🔐 PRIVACY */}
      <PrivacyModal
        isOpen={privacyOpen}
        onClose={handleClosePrivacy}
      />

      {/* 📜 TERMS */}
      <TermsModal
        isOpen={termsOpen}
        onClose={handleAcceptTerms}
      />

      {/* 🚫 APP BLOQUEADA HASTA ACEPTAR TODO */}
      {isFullyAccepted && children}

      {/* Footer solo si todo está aceptado */}
      {isFullyAccepted && (
        <Footer
          openPrivacy={() => setPrivacyOpen(true)}
          openTerms={() => setTermsOpen(true)}
        />
      )}
    </>
  );
}