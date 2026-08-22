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
      <section className="w-full bg-white grid grid-cols-1 lg:grid-cols-12 gap-0 border-t-2" style={{ borderColor: "#b2dede" }}>
        <div className="lg:col-span-7 bg-white p-8 md:p-14 flex flex-col justify-between gap-8">
          <div>
            <span className="text-[10px] font-black tracking-[0.4em] block mb-3" style={{ color: "#0d5c63" }}>
              // {section.subtitle}
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic leading-[0.9] uppercase" style={{ color: "#083d42" }}>
              {section.title}
            </h2>
            <p className="normal-case font-medium text-xs md:text-sm tracking-normal mt-4 max-w-md" style={{ color: "#4a7c80" }}>
              {section.config?.description}
            </p>
          </div>
          <div>
            <a
              href={btnLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl"
              style={{ background: "#0d5c63", borderRadius: "14px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#083d42")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0d5c63")}
            >
              {btnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 p-8 md:p-14 flex items-center justify-center" style={{ background: "#f0fafa" }}>
          <section
            className="flex items-center justify-center border-t-2"
            style={{
              backgroundColor: pageConfig.secondaryColor || "#f8fafc",
              borderColor: `${pageConfig.primaryColor}20` || "#b2dede"
            }}
          >
            <LocationCard
              title="Nuestra Sucursal Central"
              days="Lunes a Sábados"
              hours="09:00 hs a 20:00 hs"
              config={config}
            />
          </section>
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full px-4 md:px-12 lg:px-16 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-2"
      style={{ background: "#f0fafa", borderColor: "#b2dede" }}
    >
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter italic leading-none mb-1" style={{ color: "#083d42" }}>{section.title}</h2>
        <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: "#0d5c63" }}>{section.subtitle}</p>
      </div>

      <a
        href={btnLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto text-white px-8 py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shrink-0 shadow-md hover:shadow-xl"
        style={{ background: "#0d5c63", borderRadius: "14px" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#083d42")}
        onMouseLeave={e => (e.currentTarget.style.background = "#0d5c63")}
      >
        {btnText} <ArrowRight className="w-4 h-4 stroke-[3]" />
      </a>
    </section>
  );
}
