import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";
import { CustomSection } from "../PageRender";

export default function FaqSection({ section }: { section: CustomSection }) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <section className="w-full px-4 md:px-12 lg:px-16 py-16 border-t" style={{ borderColor: "var(--color-primario)" }}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <span className="text-[10px] font-black tracking-[0.3em]" style={{ color: "var(--color-primario)" }}>{"// "}DESPEJÁ TUS DUDAS</span>
          <h2 className="text-3xl font-black tracking-tighter italic mb-4" style={{ color: "var(--texto-sobre-fondo)" }}>{section.title || "PREGUNTAS FRECUENTES"}</h2>
          {section.subtitle && (
            <p className="normal-case text-xs font-medium tracking-normal leading-relaxed" style={{ color: "var(--texto-sobre-fondo)", opacity: 0.7 }}>
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="lg:col-span-8 space-y-3">
          {section.items.map((faq) => (
            <div
              key={faq.id}
              className="border transition-all shadow-sm"
              style={{ background: "var(--color-secundario)", borderColor: "color-mix(in srgb, var(--color-primario) 30%, transparent)", borderRadius: "16px" }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id ?? null)}
                className="w-full p-5 flex items-center justify-between text-left font-black text-xs tracking-wide transition-colors cursor-pointer"
                style={{ color: "var(--texto-sobre-secundario)" }}
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 shrink-0" style={{ color: "var(--color-primario)" }} />
                  {faq.title}
                </span>
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-300"
                  style={{
                    color: openFaq === faq.id ? "var(--color-primario)" : "var(--texto-sobre-secundario)",
                    transform: openFaq === faq.id ? "rotate(180deg)" : "none"
                  }}
                />
              </button>

              <motion.div
                initial={false}
                animate={{ height: openFaq === faq.id ? "auto" : 0 }}
                className="overflow-hidden"
              >
                <div
                  className="p-5 pt-0 border-t normal-case font-medium text-xs tracking-normal leading-relaxed"
                  style={{ color: "var(--texto-sobre-secundario)", opacity: 0.7, borderColor: "var(--color-secundario)" }}
                >
                  {faq.description}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
