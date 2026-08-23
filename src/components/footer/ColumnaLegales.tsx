"use client";

interface ColumnaLegalesProps {
  alAbrirPrivacidad?: () => void;
  alAbrirTerminos?: () => void;
}

export default function ColumnaLegales({
  alAbrirPrivacidad,
  alAbrirTerminos,
}: ColumnaLegalesProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">
        Legal
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <button
            type="button"
            onClick={alAbrirPrivacidad}
            className="opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
          >
            Política de Privacidad
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={alAbrirTerminos}
            className="opacity-70 transition hover:text-[var(--color-primario)] hover:opacity-100"
          >
            Términos y Condiciones
          </button>
        </li>
      </ul>
    </div>
  );
}
