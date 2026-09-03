import { URL_WHATSAPP } from "@/components/escuela/datos-escuela";
import IconoWhatsApp from "@/components/escuela/icono-whatsapp";

export default function EscuelaHeroe() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-32 overflow-hidden" style={{ minHeight: "560px" }}>
      <div className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, var(--color-fondo-sitio) 0%, color-mix(in srgb, var(--color-fondo-sitio) 94%, var(--color-primario)) 35%, color-mix(in srgb, var(--color-fondo-sitio) 88%, var(--color-primario)) 70%, color-mix(in srgb, var(--color-fondo-sitio) 82%, var(--color-primario)) 100%)" }} />
      <div className="absolute bottom-0 left-0 right-0 -z-10 overflow-hidden leading-none">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,10 1440,40 L1440,80 L0,80 Z" style={{ fill: "var(--color-fondo-sitio)" }} />
        </svg>
      </div>
      <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase border px-3 py-1 mb-6" style={{ color: "var(--color-primario)", borderColor: "color-mix(in srgb, var(--color-primario) 60%, transparent)", borderRadius: "999px", background: "color-mix(in srgb, var(--color-secundario) 80%, transparent)" }}>Mar del Plata</span>
      <h1 className="text-7xl sm:text-8xl font-black leading-none tracking-wide mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>New<span style={{ color: "var(--color-primario)" }}>Surf</span>Board</h1>
      <p className="text-base font-light leading-relaxed mb-8 max-w-xs sm:max-w-sm" style={{ color: "color-mix(in srgb, var(--texto-sobre-fondo) 60%, transparent)" }}>Clases de surf para todos los niveles. Del primer pop-up a las olas más desafiantes.</p>
      <a href={URL_WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-7 py-4 font-bold tracking-wide transition-all hover:-translate-y-1 active:scale-95" style={{ background: "var(--color-primario)", color: "var(--texto-sobre-primario)", borderRadius: "999px", fontSize: "15px", boxShadow: "0 10px 30px color-mix(in srgb, var(--color-primario) 25%, transparent)" }}><IconoWhatsApp />Consultar por WhatsApp</a>
    </section>
  );
}
