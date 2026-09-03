export const NUMERO_WHATSAPP = "";
export const MENSAJE_WHATSAPP =
  "Hola! Me interesa info sobre las clases de surf";
export const URL_WHATSAPP = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;

export const caracteristicas = [
  "Tabla y traje incluidos — no necesitás traer nada.",
  "Instructor certificado en agua durante toda la clase.",
  "Grupos reducidos — máximo 4 personas por clase.",
  "Clases individuales o grupales disponibles.",
  "Adaptadas a las condiciones del mar del día.",
];

export const niveles = [
  {
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17c3-2 6-2 9 0s6 2 9 0M3 12c3-2 6-2 9 0s6 2 9 0" />
      </svg>
    ),
    titulo: "Principiantes",
    descripcion:
      "Tu primera vez en el agua. Técnica de remo, equilibrio y el primer pop-up.",
  },
  {
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.714-.952m3.714.952l-.952 3.714" />
      </svg>
    ),
    titulo: "Intermedios",
    descripcion: "Mejorá tu postura, lectura de olas y maniobras básicas en el mar.",
  },
  {
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    titulo: "Avanzados",
    descripcion:
      "Trabajá giros, tubos y llevá tu surf al siguiente nivel con olas más potentes.",
  },
];
