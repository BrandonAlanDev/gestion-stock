"use client";

import Link from "next/link";
import { ArrowRight, Instagram, Facebook, Youtube } from "lucide-react";

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
  return (

    <footer className="bg-white border-t border-slate-200 text-slate-900">

      {/* Franja superior */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Marca */}
          <div className="md:col-span-2 space-y-5">
            <span className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
              NewSurf<span className="text-blue-500">Board</span>

            </span>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Equipamiento de surf en Santa Clara del Mar. Tablas, trajes y accesorios para todos los niveles, probados en el Atlántico.
            </p>
            {/* Redes */}
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Instagram, href: "https://instagram.com" },
                { icon: Facebook,  href: "https://facebook.com" },
                { icon: Youtube,   href: "https://youtube.com" },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300"
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
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-500" />
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
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-blue-500" />
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
          © {new Date().getFullYear()} NewSurfBoard — Santa Clara del Mar, Buenos Aires.
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