import { T, WHATSAPP_URL } from "../escuela.data";
import { WhatsAppIcon } from "../icons";

export default function EscuelaCta() {
  return (
    <section className="px-6 py-20 text-center"
      style={{ background: "linear-gradient(180deg, #ecfeff 0%, #d9fbff 100%)", borderTop: "1px solid rgba(0,183,201,0.12)", borderBottom: "1px solid rgba(0,183,201,0.12)" }}
    >
      <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase px-4 py-2 mb-5"
        style={{ background: "rgba(0,183,201,0.10)", color: T.tealDk, borderRadius: "999px" }}
      >
        Reservas abiertas
      </span>
      <h2 className="text-4xl sm:text-5xl mb-3" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>
        ¿Listo para surfear?
      </h2>
      <p className="text-sm font-light mb-8" style={{ color: T.textMd }}>
        Escribinos y te contamos horarios, precios y disponibilidad.
      </p>
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-7 py-4 font-bold tracking-wide text-white transition-all hover:-translate-y-1 active:scale-95"
        style={{ background: T.tealDk, borderRadius: "999px", fontSize: "15px", boxShadow: "0 10px 30px rgba(0,183,201,0.25)" }}
      >
        <WhatsAppIcon />
        Escribinos por WhatsApp
      </a>
    </section>
  );
}
