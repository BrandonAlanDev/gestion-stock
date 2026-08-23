export const WHATSAPP_NUMBER = "";
export const WHATSAPP_MESSAGE = "Hola! Me interesa info sobre las clases de surf";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const features = [
  "Tabla y traje incluidos — no necesitás traer nada.",
  "Instructor certificado en agua durante toda la clase.",
  "Grupos reducidos — máximo 4 personas por clase.",
  "Clases individuales o grupales disponibles.",
  "Adaptadas a las condiciones del mar del día.",
];

export const levels = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17c3-2 6-2 9 0s6 2 9 0M3 12c3-2 6-2 9 0s6 2 9 0" />
      </svg>
    ),
    title: "Principiantes",
    desc: "Tu primera vez en el agua. Técnica de remo, equilibrio y el primer pop-up.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.714-.952m3.714.952l-.952 3.714" />
      </svg>
    ),
    title: "Intermedios",
    desc: "Mejorá tu postura, lectura de olas y maniobras básicas en el mar.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
    title: "Avanzados",
    desc: "Trabajá giros, tubos y llevá tu surf al siguiente nivel con olas más potentes.",
  },
];
