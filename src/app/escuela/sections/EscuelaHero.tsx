import { T, WHATSAPP_URL } from "../escuela.data";
import { WhatsAppIcon } from "../icons";

export default function EscuelaHero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 overflow-hidden" style={{ minHeight: "560px" }}>
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f2feff 35%, #dffcff 70%, #baf6ff 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 -z-10 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,80 L0,80 Z" fill={T.bg2} />
        </svg>
      </div>
      <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase border px-3 py-1 mb-6"
        style={{ color: T.tealDk, borderColor: T.tealMd, borderRadius: "999px", background: "rgba(255,255,255,0.8)" }}
      >
        Mar del Plata
      </span>
      <h1 className="text-7xl sm:text-8xl font-black leading-none tracking-wide mb-3"
        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}
      >
        New<span style={{ color: T.tealDk }}>Surf</span>Board
      </h1>
      <p className="text-base font-light leading-relaxed mb-8 max-w-xs sm:max-w-sm" style={{ color: T.textMd }}>
        Clases de surf para todos los niveles. Del primer pop-up a las olas más desafiantes.
      </p>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-7 py-4 font-bold tracking-wide text-white transition-all hover:-translate-y-1 active:scale-95"
        style={{ background: T.tealDk, borderRadius: "999px", fontSize: "15px", boxShadow: "0 10px 30px rgba(0,183,201,0.25)" }}
      >
        <WhatsAppIcon />
        Consultar por WhatsApp
      </a>
    </section>
  );
}
