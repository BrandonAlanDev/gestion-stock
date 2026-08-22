import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPageConfig } from "@/actions/page-config/general.actions";
import { getContrastColor } from "@/lib/utils";

interface MarcoPaginaAdminProps {
  titulo: string;
  subtitulo?: string;
  volverHref?: string;
  acciones?: ReactNode;
  children: ReactNode;
}

export default async function MarcoPaginaAdmin({
  titulo,
  subtitulo,
  volverHref,
  acciones,
  children,
}: MarcoPaginaAdminProps) {
  const { pageConfig } = await getPageConfig();

  const primaryColor = pageConfig?.primaryColor || "#06b6d4";
  const secondaryColor = pageConfig?.secondaryColor || "#fafafa";
  const textColor = getContrastColor(secondaryColor);

  return (
    <div
      className="p-6 sm:p-8 w-full min-h-screen transition-colors duration-200"
      style={{
        backgroundColor: textColor === "#ffffff" ? "#0a0a0a" : "#ffffff",
        color: textColor,
      }}
    >
      <div className="max-w-7xl mx-auto my-6 space-y-6 sm:my-12 sm:space-y-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            {volverHref && (
              <Link
                href={volverHref}
                className="inline-flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
                style={{ color: primaryColor }}
              >
                <ArrowLeft size={14} />
                Volver
              </Link>
            )}
            <h1
              className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4"
              style={{ color: primaryColor }}
            >
              <span
                className="w-2 h-10 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              {titulo}
            </h1>
            {subtitulo && (
              <p
                className="ml-6 mt-2 text-[10px] uppercase tracking-[0.4em] font-black truncate max-w-full"
                style={{ color: textColor + "99" }}
              >
                {subtitulo}
              </p>
            )}
          </div>

          {acciones && <div className="flex flex-wrap items-center gap-3">{acciones}</div>}
        </div>

        {children}
      </div>
    </div>
  );
}
