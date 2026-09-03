import { AlertTriangle } from "lucide-react";
import { CustomSection } from "../PageRender";

export default function CardsSection({ section }: { section: CustomSection }) {
  const isHorizontal = section.config?.style === "horizontal";

  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 overflow-hidden">
      {section.config?.alert && (
         <div className="mb-8 w-full py-3 flex items-center gap-3 font-bold text-xs" style={{ color: "var(--color-primario)" }}>
            <AlertTriangle className="w-4 h-4 shrink-0 stroke-[2.5]" style={{ color: "var(--color-primario)" }} />
            <span>{section.config.alert}</span>
         </div>
      )}

      {section.title && (
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between pb-4 gap-4">
          <div>
            {section.subtitle && <span className="text-[10px] font-black tracking-[0.3em] block mb-2" style={{ color: "var(--texto-sobre-fondo)", opacity: 0.7 }}>{"// "}{section.subtitle}</span>}
            <h2 className="text-3xl font-black tracking-tighter italic" style={{ color: "var(--texto-sobre-fondo)" }}>{section.title}</h2>
          </div>
        </div>
      )}

      <div className={`flex ${isHorizontal ? 'flex-col md:flex-row overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory' : 'grid grid-cols-1 md:grid-cols-3'} gap-6`}>
        {section.items.map((item) => (
          <div
            key={item.id}
            className={`p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl relative group ${isHorizontal ? 'snap-center shrink-0 w-full md:w-[calc(33.333%-16px)] min-w-[290px]' : ''}`}
            style={{ background: "var(--color-secundario)", border: "2px solid color-mix(in srgb, var(--color-primario) 30%, transparent)", borderRadius: "24px" }}
          >
            <div>
              <h3 className="text-xl font-black tracking-tight mb-3 italic uppercase min-h-[56px] flex items-center" style={{ color: "var(--texto-sobre-secundario)" }}>
                {item.title}
              </h3>
              <p className="normal-case font-medium text-xs leading-relaxed mb-6 max-w-xl" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.7 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
