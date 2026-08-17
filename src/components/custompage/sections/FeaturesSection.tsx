import { CustomSection } from "../PageRender";
import DynamicIcon from "./DynamicIcon";

export default function FeaturesSection({ section }: { section: CustomSection }) {
  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
      {section.items.map((item) => (
        <div
          key={item.id}
          className="p-8 border flex flex-col justify-between group shadow-md hover:shadow-xl transition-all duration-300"
          style={{ background: "var(--color-secundario)", borderColor: "color-mix(in srgb, var(--color-primario) 30%, transparent)", borderRadius: "24px" }}
        >
          <div>
            <div className="w-10 h-10 flex items-center justify-center mb-6" style={{ background: "color-mix(in srgb, var(--color-primario) 12%, transparent)", color: "var(--color-primario)", borderRadius: "10px" }}>
              <DynamicIcon name={item.icon} className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-lg tracking-tight mb-3 italic" style={{ color: "var(--texto-sobre-secundario)" }}>{item.title}</h3>
            <p className="normal-case tracking-normal font-medium text-xs leading-relaxed" style={{ color: "var(--texto-sobre-secundario)", opacity: 0.7 }}>
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
