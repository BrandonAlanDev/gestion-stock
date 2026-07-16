import { T, features } from "../escuela.data";
import { CheckIcon } from "../icons";

export default function EscuelaIncludes() {
  return (
    <section className="px-6 py-16" style={{ background: "#ffffff", borderTop: "1px solid rgba(0,183,201,0.08)" }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl sm:text-5xl mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "2px" }}>
          ¿Qué incluye?
        </h2>
        <div className="mb-8 rounded-full" style={{ width: "60px", height: "4px", background: T.tealDk }} />
        <ul className="flex flex-col gap-5">
          {features.map((feat) => (
            <li key={feat} className="flex items-start gap-3 p-4" style={{ background: "rgba(124,239,255,0.08)", borderRadius: "18px" }}>
              <span className="shrink-0 flex items-center justify-center rounded-full mt-0.5"
                style={{ width: "24px", height: "24px", background: "rgba(0,183,201,0.12)" }}
              >
                <CheckIcon />
              </span>
              <span className="text-sm font-light leading-relaxed" style={{ color: T.textMd }}>{feat}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
