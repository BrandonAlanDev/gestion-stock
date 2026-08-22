"use client";

import Link from "next/link";

interface ColumnaNavegacionProps {
  escuelaEnabled: boolean;
  arreglosEnabled: boolean;
  planAhorroEnabled: boolean;
}

export default function ColumnaNavegacion({
  escuelaEnabled,
  arreglosEnabled,
  planAhorroEnabled,
}: ColumnaNavegacionProps) {
  return (
    <nav>
      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">
        Navegación
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <Link
            href="/productos"
            className="opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
          >
            Catálogo
          </Link>
        </li>
        {escuelaEnabled && (
          <li>
            <Link
              href="/escuela"
              className="opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
            >
              Escuela
            </Link>
          </li>
        )}
        {arreglosEnabled && (
          <li>
            <Link
              href="/arreglos"
              className="opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
            >
              Arreglos
            </Link>
          </li>
        )}
        {planAhorroEnabled && (
          <li>
            <Link
              href="/plan-de-ahorro"
              className="opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
            >
              Plan de ahorro
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
