import { CustomSection } from "../PageRender";

export default function HeroSection({ section }: { section: CustomSection }) {
  const widget = section.config?.widget;

  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-12 md:py-20 border-b-2" style={{ borderColor: "#b2dede" }}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-4xl">
          {section.config?.overline && (
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3" style={{ color: "#0d5c63" }}>
              // {section.config.overline}
            </span>
          )}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] mb-6" style={{ color: "#0d5c63" }}>
            {section.title}
          </h1>
          {section.subtitle && (
            <p className="normal-case font-medium text-sm md:text-base max-w-2xl tracking-normal" style={{ color: "#4a7c80" }}>
              {section.subtitle}
            </p>
          )}
        </div>

        {widget && (
          <div className="bg-[#ffffff] border-2 p-6 min-w-[280px] lg:min-w-[350px]" style={{ borderColor: "#b2dede", borderRadius: "24px" }}>
            <div className="text-[9px] font-black mb-1" style={{ color: "#4a7c80" }}>// {widget.overline}</div>
            <div className="text-lg font-black italic tracking-tighter mb-4" style={{ color: "#083d42" }}>{widget.title}</div>
            <div className="space-y-2 text-[11px] font-black" style={{ color: "#4a7c80" }}>
              {widget.rows?.map((row: any, i: number) => (
                <div key={i} className={`flex justify-between ${i !== widget.rows.length - 1 ? 'border-b pb-1' : ''}`} style={{ borderColor: "#f0fafa" }}>
                  <span>{row.label}</span>
                  <span className={row.highlight ? "font-bold" : ""} style={{ color: row.highlight ? "#0d5c63" : "#083d42" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
