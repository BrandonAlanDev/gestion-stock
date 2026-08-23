import Image from "next/image";
import { Wrench } from "lucide-react";
import Link from "next/link";

interface PantallaMantenimientoProps {
  storeName: string;
  logo: string | null;
}

export default function PantallaMantenimiento({
  storeName,
  logo,
}: PantallaMantenimientoProps) {
  const tieneLogo = typeof logo === "string" && logo.trim() !== "";

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "var(--color-fondo-sitio)" }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[color-mix(in_srgb,var(--color-primario)_12%,transparent)] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[color-mix(in_srgb,var(--color-primario)_6%,transparent)] rounded-full blur-[120px]" />

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-primario)] to-transparent" />
      </div>

      <div className="relative z-10 text-center max-w-lg px-6">
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border border-[color-mix(in_srgb,var(--color-primario)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-fondo-sitio)_80%,transparent)] mb-8 overflow-hidden">
          {tieneLogo ? (
            <Image
              src={logo}
              alt={`Logo de ${storeName}`}
              fill
              sizes="80px"
              className="object-cover rounded-full"
            />
          ) : (
            <Wrench className="w-9 h-9 text-[var(--color-primario)]" />
          )}
        </div>

        <h1 className="font-black italic uppercase tracking-tighter text-4xl md:text-5xl">
          {"Página en mantenimiento"
            .split(" ")
            .map((palabra, index) => (
              <span
                key={index}
                className={
                  index % 2 !== 0
                    ? "text-[var(--color-primario)]"
                    : "text-[var(--texto-sobre-fondo)]"
                }
              >
                {palabra}{" "}
              </span>
            ))}
        </h1>

        <p
          className="mt-4 text-lg text-[var(--texto-sobre-fondo)]/60"
          style={{ fontFamily: "var(--fuente-principal)" }}
        >
          Estamos trabajando para mejorar tu experiencia. Volvé pronto.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primario)_40%,transparent)] px-4 py-1.5 text-xs uppercase tracking-widest font-bold text-[var(--color-primario)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primario)] animate-pulse" />
          Mantenimiento en curso
        </div>

        <div className="mt-10">
          <Link
            href="/login"
            className="text-sm text-[var(--texto-sobre-fondo)]/50 hover:opacity-100 hover:text-[var(--color-primario)] transition-colors"
          >
            ¿Sos administrador? Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
