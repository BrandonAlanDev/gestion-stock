"use client";

import { usePageConfig } from "@/components/providers/PageConfigProvider";
import ColumnaContacto from "@/components/footer/ColumnaContacto";
import ColumnaLegales from "@/components/footer/ColumnaLegales";
import ColumnaNavegacion from "@/components/footer/ColumnaNavegacion";
import ColumnaRedes from "@/components/footer/ColumnaRedes";
import ColumnaSobre from "@/components/footer/ColumnaSobre";
import ColumnaUbicacion from "@/components/footer/ColumnaUbicacion";

interface PiePaginaProps {
  alAbrirPrivacidad?: () => void;
  alAbrirTerminos?: () => void;
}

export default function PiePagina({ alAbrirPrivacidad, alAbrirTerminos }: PiePaginaProps) {
  const { pageConfig } = usePageConfig();
  const config = pageConfig as unknown as Record<string, unknown>;

  const texto = (campo: string): string | null => {
    const valor = config?.[campo];
    return typeof valor === "string" && valor.trim().length > 0 ? valor.trim() : null;
  };

  const activo = (campo: string): boolean => config?.[campo] === true;

  const storeName = texto("storeName") ?? "Mi tienda";
  const anio = new Date().getFullYear();
  const copyright = texto("footerCopyrightText") ?? storeName;

  return (
    <footer
      className="w-full border-t"
      style={{
        backgroundColor: "var(--color-fondo-sitio)",
        borderColor: "color-mix(in srgb, var(--color-primario) 25%, transparent)",
        color: "var(--texto-sobre-fondo)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {activo("footerShowSobre") && (
            <ColumnaSobre
              logo={texto("logo")}
              storeName={storeName}
              texto={texto("footerAboutText") ?? texto("description")}
            />
          )}
          {activo("footerShowNavegacion") && (
            <ColumnaNavegacion />
          )}
          {activo("footerShowContacto") && (
            <ColumnaContacto
              phone={texto("phone")}
              whatsapp={texto("whatsapp")}
              email={texto("email")}
            />
          )}
          {activo("footerShowUbicacion") && activo("locationEnabled") && (
            <ColumnaUbicacion
              address={texto("address")}
              city={texto("city")}
              mapsUrl={texto("mapsUrl")}
            />
          )}
          {activo("footerShowRedes") && (
            <ColumnaRedes
              instagram={texto("instagram")}
              facebook={texto("facebook")}
              youtube={texto("youtube")}
              linkedin={texto("linkedin")}
              x={texto("x")}
              tiktok={texto("tiktok")}
            />
          )}
          {activo("footerShowLegales") && (
            <ColumnaLegales
              alAbrirPrivacidad={alAbrirPrivacidad}
              alAbrirTerminos={alAbrirTerminos}
            />
          )}
        </div>

        <div
          className="mt-10 flex flex-col items-center gap-1 border-t pt-6 text-center text-xs opacity-60"
          style={{
            borderColor: "color-mix(in srgb, var(--color-primario) 15%, transparent)",
          }}
        >
          <p>© {anio} {copyright}</p>
          <a
            href="https://logabyte.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 hover:opacity-100 hover:[text-shadow:0_0_8px_var(--color-primario),0_0_16px_var(--color-primario)]"
          >
            Creado por LOGABYTE
          </a>
        </div>
      </div>
    </footer>
  );
}
