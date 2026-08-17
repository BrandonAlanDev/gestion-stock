import { ArrowRight } from "lucide-react";
import { usePageConfig } from "../../providers/PageConfigProvider";
import LocationCard from "../../ui/LocationCard";
import { CustomSection } from "../PageRender";

export default function CtaSection({ section }: { section: CustomSection }) {
  const { pageConfig } = usePageConfig();
  const config = pageConfig || {};
  const btnText = section.config?.buttonText || "ESCRIBINOS";
  const btnLink = section.config?.buttonLink || "#";

  if (section.config?.style === "block") {
    return (
      <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-0 border-t-2" style={{ borderColor: "var(--color-primario)" }}>
        <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-between gap-8">
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3" style={{ color: "var(--color-primario)" }}>
              {"// "}{section.subtitle}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-[0.9] uppercase" style={{ color: "var(--texto-sobre-fondo)" }}>
              {section.title}
            </h2>
            <p className="normal-case font-medium text-xs md:text-sm tracking-normal mt-4 max-w-md" style={{ color: "var(--texto-sobre-fondo)", opacity: 0.7 }}>
              {section.config?.description}
            </p>
          </div>
          <div>
            <a
              href={btnLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl hover:opacity-90"
              style={{ background: "var(--color-primario)", color: "var(--texto-sobre-primario)", borderRadius: "14px" }}
            >
              {btnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 p-8 md:p-14 flex items-center justify-center">
          <section
            className="flex items-center justify-center border-t-2"
            style={{
              borderColor: "color-mix(in srgb, var(--color-primario) 20%, transparent)"
            }}
          >
            <LocationCard
              title="Nuestra Sucursal Central"
              days="Lunes a Sábados"
              hours="09:00 hs a 20:00 hs"
              config={config as { address: string | null; city: string | null; province?: string | null; phone?: string | null; whatsapp?: string | null; mapsUrl?: string | null }}
            />
          </section>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full px-4 md:px-12 lg:px-16 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-2"
      style={{ background: "var(--color-fondo-sitio)", borderColor: "var(--color-primario)" }}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none mb-1" style={{ color: "var(--texto-sobre-fondo)" }}>{section.title}</h2>
        <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--color-primario)" }}>{section.subtitle}</p>
      </div>

      <a
        href={btnLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl hover:opacity-90"
        style={{ background: "var(--color-primario)", color: "var(--texto-sobre-primario)", borderRadius: "14px" }}
      >
        {btnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
      </a>
    </section>
  );
}
