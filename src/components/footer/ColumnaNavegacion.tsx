"use client";

import Link from "next/link";

export default function ColumnaNavegacion() {
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
      </ul>
    </nav>
  );
}
