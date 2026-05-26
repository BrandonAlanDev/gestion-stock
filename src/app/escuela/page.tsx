import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NewSurfBoard — Clases de Surf en Mar del Plata",
  description:
    "Clases de surf para todos los niveles en Mar del Plata. Principiantes, intermedios y avanzados. Tabla y traje incluidos.",
};

const WHATSAPP_NUMBER = ""; // ← reemplazá con tu número real
const WHATSAPP_MESSAGE =
  "Hola! Me interesa info sobre las clases de surf";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

/* ── NUEVA PALETA BLANCO + CYAN ───────────────────────────── */

const T = {
  bg1: "#f8ffff",
  bg2: "#efffff",

  tealDk: "#00b7c9",
  tealMd: "#33d6e8",
  tealLt: "#7cefff",

  text: "#062b30",
  textMd: "#4c6b70",
  textDm: "rgba(6,43,48,0.35)",
} as const;

const features = [
  "Tabla y traje incluidos — no necesitás traer nada.",
  "Instructor certificado en agua durante toda la clase.",
  "Grupos reducidos — máximo 4 personas por clase.",
  "Clases individuales o grupales disponibles.",
  "Adaptadas a las condiciones del mar del día.",
];

const levels = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-7 h-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 17c3-2 6-2 9 0s6 2 9 0M3 12c3-2 6-2 9 0s6 2 9 0"
        />
      </svg>
    ),
    title: "Principiantes",
    desc: "Tu primera vez en el agua. Técnica de remo, equilibrio y el primer pop-up.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-7 h-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.714-.952m3.714.952l-.952 3.714"
        />
      </svg>
    ),
    title: "Intermedios",
    desc: "Mejorá tu postura, lectura de olas y maniobras básicas en el mar.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-7 h-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
        />
      </svg>
    ),
    title: "Avanzados",
    desc: "Trabajá giros, tubos y llevá tu surf al siguiente nivel con olas más potentes.",
  },
];

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 fill-white shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.555 4.122 1.526 5.858L0 24l6.337-1.505A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.65-.487-5.18-1.34l-.37-.22-3.762.894.948-3.657-.244-.38A9.946 9.946 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      style={{ color: T.tealDk }}
      className="w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      />
    </svg>
  );
}

export default function NewSurfBoardPage() {
  return (
    <main
      className="min-h-screen font-sans"
      style={{
        background: T.bg1,
        color: T.text,
      }}
    >
      {/* ── HERO ── */}

      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 overflow-hidden"
        style={{ minHeight: "560px" }}
      >
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, #ffffff 0%, #f2feff 35%, #dffcff 70%, #baf6ff 100%)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 -z-10 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-20"
          >
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,80 L0,80 Z"
              fill={T.bg2}
            />
          </svg>
        </div>

        <span
          className="inline-block text-[11px] font-bold tracking-[3px] uppercase border px-3 py-1 mb-6"
          style={{
            color: T.tealDk,
            borderColor: T.tealMd,
            borderRadius: "999px",
            background: "rgba(255,255,255,0.8)",
          }}
        >
          Mar del Plata
        </span>

        <h1
          className="text-7xl sm:text-8xl font-black leading-none tracking-wide mb-3"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "2px",
          }}
        >
          New<span style={{ color: T.tealDk }}>Surf</span>Board
        </h1>

        <p
          className="text-base font-light leading-relaxed mb-8 max-w-xs sm:max-w-sm"
          style={{ color: T.textMd }}
        >
          Clases de surf para todos los niveles. Del primer pop-up a las olas más desafiantes.
        </p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-7 py-4 font-bold tracking-wide text-white transition-all hover:-translate-y-1 active:scale-95"
          style={{
            background: T.tealDk,
            borderRadius: "999px",
            fontSize: "15px",
            boxShadow: "0 10px 30px rgba(0,183,201,0.25)",
          }}
        >
          <WhatsAppIcon />
          Consultar por WhatsApp
        </a>
      </section>

      {/* ── LEVELS ── */}

      <section
        className="px-6 py-16"
        style={{ background: T.bg2 }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl mb-1"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "2px",
            }}
          >
            Clases
          </h2>

          <div
            className="mb-8 rounded-full"
            style={{
              width: "60px",
              height: "4px",
              background: T.tealDk,
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {levels.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col items-center text-center p-7 transition-all hover:-translate-y-1"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  border: "1px solid rgba(0,183,201,0.15)",
                  borderRadius: "24px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span
                  style={{
                    color: T.tealDk,
                    marginBottom: "14px",
                  }}
                >
                  {icon}
                </span>

                <h3
                  className="text-xl mb-2"
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    letterSpacing: "1px",
                  }}
                >
                  {title}
                </h3>

                <p
                  className="text-sm font-light leading-relaxed"
                  style={{ color: T.textMd }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INCLUDES ── */}

      <section
        className="px-6 py-16"
        style={{
          background: "#ffffff",
          borderTop: "1px solid rgba(0,183,201,0.08)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl mb-1"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "2px",
            }}
          >
            ¿Qué incluye?
          </h2>

          <div
            className="mb-8 rounded-full"
            style={{
              width: "60px",
              height: "4px",
              background: T.tealDk,
            }}
          />

          <ul className="flex flex-col gap-5">
            {features.map((feat) => (
              <li
                key={feat}
                className="flex items-start gap-3 p-4"
                style={{
                  background: "rgba(124,239,255,0.08)",
                  borderRadius: "18px",
                }}
              >
                <span
                  className="shrink-0 flex items-center justify-center rounded-full mt-0.5"
                  style={{
                    width: "24px",
                    height: "24px",
                    background: "rgba(0,183,201,0.12)",
                  }}
                >
                  <CheckIcon />
                </span>

                <span
                  className="text-sm font-light leading-relaxed"
                  style={{ color: T.textMd }}
                >
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ── */}

      <section
        className="px-6 py-20 text-center"
        style={{
          background:
            "linear-gradient(180deg, #ecfeff 0%, #d9fbff 100%)",
          borderTop: "1px solid rgba(0,183,201,0.12)",
          borderBottom: "1px solid rgba(0,183,201,0.12)",
        }}
      >
        <span
          className="inline-block text-[11px] font-bold tracking-[2px] uppercase px-4 py-2 mb-5"
          style={{
            background: "rgba(0,183,201,0.10)",
            color: T.tealDk,
            borderRadius: "999px",
          }}
        >
          Reservas abiertas
        </span>

        <h2
          className="text-4xl sm:text-5xl mb-3"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "2px",
          }}
        >
          ¿Listo para surfear?
        </h2>

        <p
          className="text-sm font-light mb-8"
          style={{ color: T.textMd }}
        >
          Escribinos y te contamos horarios, precios y disponibilidad.
        </p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-7 py-4 font-bold tracking-wide text-white transition-all hover:-translate-y-1 active:scale-95"
          style={{
            background: T.tealDk,
            borderRadius: "999px",
            fontSize: "15px",
            boxShadow: "0 10px 30px rgba(0,183,201,0.25)",
          }}
        >
          <WhatsAppIcon />
          Escribinos por WhatsApp
        </a>
      </section>

      {/* ── FOOTER ── */}

      <footer
        className="text-center py-6 px-4"
        style={{
          background: "#f4ffff",
          borderTop: "1px solid rgba(0,183,201,0.15)",
        }}
      >
        <p
          className="text-xs tracking-widest"
          style={{ color: T.textDm }}
        >
          NewSurfBoard — Mar del Plata
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
      `}</style>
    </main>
  );
}