import { URL_WHATSAPP } from "@/components/escuela/datos-escuela";
import IconoWhatsApp from "@/components/escuela/icono-whatsapp";

export default function EscuelaLlamadaAccion() {
  return (
    <section className="px-6 py-20 text-center" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--color-fondo-sitio) 94%, var(--color-primario)) 0%, color-mix(in srgb, var(--color-fondo-sitio) 88%, var(--color-primario)) 100%)", borderTop: "1px solid color-mix(in srgb, var(--color-primario) 12%, transparent)", borderBottom: "1px solid color-mix(in srgb, var(--color-primario) 12%, transparent)" }}>
      <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase px-4 py-2 mb-5" style={{ background: "color-mix(in srgb, var(--color-primario) 10%, transparent)", color: "var(--color-primario)", borderRadius: "999px" }}>Reservas abiertas</span>
      <h2 className="text-4xl sm:text-5xl mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>¿Listo para surfear?</h2>
      <p className="text-sm font-light mb-8" style={{ color: "color-mix(in srgb, var(--texto-sobre-fondo) 60%, transparent)" }}>Escribinos y te contamos horarios, precios y disponibilidad.</p>
      <a href={URL_WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-7 py-4 font-bold tracking-wide transition-all hover:-translate-y-1 active:scale-95" style={{ background: "var(--color-primario)", color: "var(--texto-sobre-primario)", borderRadius: "999px", fontSize: "15px", boxShadow: "0 10px 30px color-mix(in srgb, var(--color-primario) 25%, transparent)" }}><IconoWhatsApp />Escribinos por WhatsApp</a>
    </section>
  );
}
