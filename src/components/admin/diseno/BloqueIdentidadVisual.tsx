import Image from "next/image";

import Badge from "@/components/ui/badge";

interface ConfigIdentidad {
  storeName: string;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  fontPrimary: string | null;
  fontSecondary: string | null;
  borderRadius: string | null;
  shadowLevel: string | null;
  density: string | null;
}

function traducirRadius(valor: string | null | undefined): string {
  if (valor === "redondeado") return "Redondeado";
  if (valor === "recto") return "Recto";
  if (valor === "muy-redondeado") return "Muy redondeado";
  return valor ?? "—";
}

function traducirSombras(valor: string | null | undefined): string {
  if (valor === "sutil") return "Sombras sutiles";
  if (valor === "sin-sombra") return "Sin sombras";
  if (valor === "marcada") return "Sombras marcadas";
  return valor ?? "—";
}

function traducirDensidad(valor: string | null | undefined): string {
  if (valor === "comoda") return "Densidad cómoda";
  if (valor === "compacta") return "Compacta";
  if (valor === "espaciosa") return "Espaciosa";
  return valor ?? "—";
}

export default function BloqueIdentidadVisual({
  config,
}: {
  config: ConfigIdentidad | null;
}) {
  if (!config) {
    return <p className="text-sm text-[var(--admin-texto-suave)]">No se pudo cargar</p>;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {config.logo ? (
          <Image
            src={config.logo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg border border-[var(--admin-borde)] object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] text-sm font-semibold text-[var(--admin-texto-suave)]">
            {(config.storeName || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-[var(--admin-texto)]">
          {config.storeName || "Sin nombre"}
        </span>
        <Badge variante={config.logo ? "activo" : "sin-configurar"}>
          {config.logo ? "Configurada" : "Sin logo"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="h-4 w-4 rounded-full border border-[var(--admin-borde)]"
          style={{ backgroundColor: config.primaryColor ?? "#06b6d4" }}
        />
        <span
          className="h-4 w-4 rounded-full border border-[var(--admin-borde)]"
          style={{ backgroundColor: config.secondaryColor ?? "#fafafa" }}
        />
        <span className="text-xs text-[var(--admin-texto-suave)]">Colores</span>
      </div>
      <p className="text-xs text-[var(--admin-texto-suave)]">
        Fuentes: {config.fontPrimary ?? "—"} / {config.fontSecondary ?? "—"}
      </p>
      <p className="text-xs text-[var(--admin-texto-suave)]">
        Estilo: {traducirRadius(config.borderRadius)} ·{" "}
        {traducirSombras(config.shadowLevel)} · {traducirDensidad(config.density)}
      </p>
    </>
  );
}
