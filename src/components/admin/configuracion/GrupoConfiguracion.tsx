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
    <section id={idAncla} className="scroll-mt-20">
      <header className="px-1 pb-2">
        <h2 className="text-base font-semibold text-[var(--admin-texto)]">
          {titulo}
        </h2>
      </header>
      <div className="divide-y divide-[var(--admin-borde)] overflow-hidden rounded-lg bg-[var(--admin-fondo-opaco)]">
        {children}
      </div>
    </section>
  );
}
