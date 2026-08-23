import type { ReactNode } from "react";

interface GrupoConfiguracionProps {
  idAncla: string;
  titulo: string;
  children: ReactNode;
}

export default function GrupoConfiguracion({
  idAncla,
  titulo,
  children,
}: GrupoConfiguracionProps) {
  return (
    <section id={idAncla} className="scroll-mt-28">
      <header className="px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-texto-suave)]">
          {titulo}
        </h2>
      </header>
      <div className="divide-y divide-[var(--admin-borde)] rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]">
        {children}
      </div>
    </section>
  );
}
