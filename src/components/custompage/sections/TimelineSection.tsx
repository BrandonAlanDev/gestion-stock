import { CheckCircle2 } from "lucide-react";
import { CustomSection } from "../PageRender";

export default function TimelineSection({ section }: { section: CustomSection }) {
  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16">
      <div className="mb-12 pb-4">
        <span className="text-[10px] font-black tracking-[0.3em]" style={{ color: "var(--texto-sobre-fondo)", opacity: 0.7 }}>// {section.subtitle || "PASO A PASO"}</span>
        <h2 className="text-3xl font-black tracking-tighter italic" style={{ color: "var(--texto-sobre-fondo)" }}>{section.title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {section.items.map((item, i) => {
          const stepNumber = item.config?.stepNumber || `0${i + 1}`.slice(-2);

          return (
            <div
              key={item.id}
              className="p-6 flex flex-col justify-between shadow-md hover:shadow-lg transition-all"
              style={{ background: "var(--color-secundario)", border: "2px solid color-mix(in srgb, var(--color-primario) 30%, transparent)", borderRadius: "24px" }}
            >
              <div>
                <span className="text-4xl font-black italic tracking-tighter block mb-4" style={{ color: "var(--color-primario)" }}>// {stepNumber}</span>
                <h4 className="font-black text-sm tracking-tight mb-2 uppercase" style={{ color: "var(--texto-sobre-secundario)" }}>{item.title}</h4>
                <p className="normal-case tracking-normal text-xs font-medium leading-normal" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.7 }}>{item.description}</p>
              </div>
              <div className="flex justify-end mt-6">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-primario)" }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  );
}
