import type { LucideIcon } from "lucide-react";

interface EstadoVacioProps {
  icono: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: React.ReactNode;
}

export default function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
}: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
        <Icono size={20} className="text-[var(--admin-texto-suave)]" />
      </div>
      <p className="mt-4 text-sm font-medium text-[var(--admin-texto)]">{titulo}</p>
      {descripcion && (
        <p className="mt-1 max-w-sm text-sm text-[var(--admin-texto-suave)]">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
