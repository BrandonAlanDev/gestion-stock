"use client";

import { ArrowRight } from "lucide-react";

export default function HeroCtaButton({
  url,
  ctaText,
  primaryColor,
  hideButton,
}: {
  url?: string;
  ctaText?: string;
  primaryColor: string;
  hideButton?: boolean;
}) {
  if (hideButton || !url) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-10">
      <button
        onClick={() => {
          window.location.href = url;
        }}
        className="group relative overflow-hidden px-8 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
        style={{
          background: primaryColor,
          color: "#000",
          boxShadow: `0 0 40px ${primaryColor}35`,
        }}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative z-10">{ctaText || "Ver más"}</span>
        <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </button>
    </div>
  );
}
