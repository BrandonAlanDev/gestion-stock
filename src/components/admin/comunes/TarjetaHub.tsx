import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { getContrastColor } from "@/lib/utils";

interface TarjetaHubProps {
  href: string;
  titulo: string;
  descripcion?: string;
  icono: LucideIcon;
  primaryColor: string;
  secondaryColor: string;
}

export default function TarjetaHub({
  href,
  titulo,
  descripcion,
  icono: Icono,
  primaryColor,
  secondaryColor,
}: TarjetaHubProps) {
  const textColor = getContrastColor(secondaryColor);

  return (
    <Link
      href={href}
      className="group rounded-[1.5rem] border p-6 flex items-center gap-5 transition-all duration-200 hover:-translate-y-1"
      style={{
        backgroundColor: secondaryColor,
        borderColor: textColor + "22",
        color: textColor,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{
          backgroundColor: primaryColor + "22",
          color: primaryColor,
          borderColor: primaryColor + "66",
        }}
      >
        <Icono size={22} />
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-black uppercase italic tracking-tight">
          {titulo}
        </h2>
        {descripcion && (
          <p
            className="text-[11px] font-bold mt-1"
            style={{ color: textColor + "99" }}
          >
            {descripcion}
          </p>
        )}
      </div>

      <ChevronRight
        size={20}
        className="flex-shrink-0 opacity-40 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
      />
    </Link>
  );
}
