"use client";

import Link from "next/link";
import { ArrowRight, Instagram, Facebook, Youtube, Twitter, Music2Icon, Linkedin } from "lucide-react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";


const LINKS = {
  tienda: [
    { label: "Tablas", href: "/productos?categoria=tablas" },
    { label: "Indumentaria", href: "/productos?categoria=indumentaria" },
    { label: "Trajes", href: "/productos?categoria=trajes" },
    { label: "Accesorios", href: "/productos?categoria=accesorios" },
  ],
  info: [
    { label: "Escuela de Surf", href: "/escuela" },
    { label: "Personalizado", href: "/personalizado" },
    { label: "Sobre Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ],
};

export function Footer({
  openPrivacy,
  openTerms,
}: {
  openPrivacy: () => void;
  openTerms: () => void;
}) {
  const pageConfig = usePageConfig();
  return (

    <footer className="bg-white border-t border-slate-200 text-slate-900">

      {/* Franja superior */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Marca */}
          <div className="md:col-span-2 space-y-5">
            <span className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
              {pageConfig?.pageConfig?.storeName || <>GESTION<span className="text-cyan-500">OK</span></>}

            </span>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              {pageConfig?.pageConfig?.description || "Tu tienda online de respaldo para tu comercio físico. Gestiona tu stock, exhibe tus productos y llega a más clientes con nuestra plataforma de ecommerce integrada."}
            </p>
            {/* Redes */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Instagram, href: pageConfig?.pageConfig?.instagram },
                { icon: Facebook, href: pageConfig?.pageConfig?.facebook },
                { icon: Youtube, href: pageConfig?.pageConfig?.youtube },
                { icon: Linkedin, href: pageConfig?.pageConfig?.linkedin },
                { icon: Twitter, href: pageConfig?.pageConfig?.x },
                { icon: Music2Icon, href: pageConfig?.pageConfig?.tiktok },
              ].map(({ icon: Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${!href ? "hidden" : ""} w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-500 hover:bg-cyan-50 transition-all duration-300`}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Tienda
            </p>
            <ul className="space-y-3">
              {LINKS.tienda.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-cyan-500" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Información
            </p>
            <ul className="space-y-3">
              {LINKS.info.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-cyan-500" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Línea divisoria */}
      <div className="border-t border-slate-100" />

      {/* Franja inferior */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} {pageConfig?.pageConfig?.storeName || "GestionOK"} — {pageConfig?.pageConfig?.location ? pageConfig?.pageConfig?.location + ", Argentina" : "Argentina"}.
        </p>
        <div className="flex gap-5">
          <button
            onClick={(e) => { e.preventDefault(); openTerms(); }}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            Términos
          </button>
          <button
            onClick={(e) => { e.preventDefault(); openPrivacy(); }}
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            Privacidad
          </button>
        </div>
      </div>

    </footer>
  );
}