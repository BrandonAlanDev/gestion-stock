import { levels } from "@/app/escuela/escuela.data";

export default function EscuelaLevels() {
  return (
    <section className="px-6 py-16" style={{ background: "var(--color-fondo-sitio)" }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl sm:text-5xl mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>
          Clases
        </h2>
        <div className="mb-8 rounded-full" style={{ width: "60px", height: "4px", background: "var(--color-primario)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {levels.map(({ icon, title, desc }) => (
            <div key={title}
              className="flex flex-col items-center text-center p-7 transition-all hover:-translate-y-1"
              style={{ background: "color-mix(in srgb, var(--color-secundario) 85%, transparent)", border: "1px solid color-mix(in srgb, var(--color-primario) 15%, transparent)", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", backdropFilter: "blur(10px)", color: "var(--texto-sobre-secundario)" }}
            >
              <span style={{ color: "var(--color-primario)", marginBottom: "14px" }}>{icon}</span>
              <h3 className="text-xl mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "1px" }}>{title}</h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: "color-mix(in srgb, var(--texto-sobre-secundario) 60%, transparent)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
