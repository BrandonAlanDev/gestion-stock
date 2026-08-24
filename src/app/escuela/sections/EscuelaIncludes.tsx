import { features } from "@/app/escuela/escuela.data";
import CheckIcon from "@/app/escuela/icons/CheckIcon";

export default function EscuelaIncludes() {
  return (
    <section className="px-6 py-16" style={{ background: "var(--color-fondo-sitio)", borderTop: "1px solid color-mix(in srgb, var(--color-primario) 8%, transparent)" }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl sm:text-5xl mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>
          ¿Qué incluye?
        </h2>
        <div className="mb-8 rounded-full" style={{ width: "60px", height: "4px", background: "var(--color-primario)" }} />
        <ul className="flex flex-col gap-5">
          {features.map((feat) => (
            <li key={feat} className="flex items-start gap-3 p-4" style={{ background: "color-mix(in srgb, var(--color-primario) 5%, transparent)", borderRadius: "18px" }}>
              <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5"
                style={{ width: "24px", height: "24px", background: "color-mix(in srgb, var(--color-primario) 8%, transparent)" }}
              >
                <CheckIcon />
              </span>
              <span className="text-sm font-light leading-relaxed" style={{ color: "color-mix(in srgb, var(--texto-sobre-fondo) 60%, transparent)" }}>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
