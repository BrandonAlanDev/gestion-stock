import { CustomSection } from "../PageRender";

export default function HeroSection({ section }: { section: CustomSection }) {
  const widget = section.config?.widget;
  const filasWidget = widget?.rows ?? [];

  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 border-b-2" style={{ borderColor: "var(--color-primario)" }}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-4xl">
          {section.config?.overline && (
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3" style={{ color: "var(--color-primario)" }}>
              {"// "}{section.config.overline}
            </span>
          )}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6" style={{ color: "var(--texto-sobre-fondo)" }}>
            {section.title}
          </h1>
          {section.subtitle && (
            <p className="normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal" style={{ color: "var(--texto-sobre-fondo)", opacity: 0.7 }}>
              {section.subtitle}
            </p>
          )}
        </div>

        {widget && (
          <div className="border-2 p-6 min-w-[280px] lg:min-w-[350px]" style={{ background: "var(--color-secundario)", borderColor: "color-mix(in srgb, var(--color-primario) 30%, transparent)", borderRadius: "24px" }}>
            <div className="text-[9px] font-black mb-1" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.7 }}>{"// "}{widget.overline}</div>
            <div className="text-lg font-black italic tracking-tighter mb-4" style={{ color: "var(--texto-sobre-secundario)" }}>{widget.title}</div>
            <div className="space-y-2 text-[11px] font-black" style={{ color: "var(--texto-sobre-secundario)" }}>
              {filasWidget.map((row, i) => (
                <div key={i} className={`flex justify-between ${i !== filasWidget.length - 1 ? 'border-b pb-1' : ''}`} style={{ borderColor: "var(--color-secundario)" }}>
                  <span>{row.label}</span>
                  <span className={row.highlight ? "font-bold" : ""} style={{ color: row.highlight ? "var(--color-primario)" : "var(--texto-sobre-secundario)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
