export const CLASE_INPUT =
  "w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] px-3 py-2 text-sm text-[var(--admin-texto)] placeholder:text-[var(--admin-texto-suave)] focus:border-[var(--admin-primario)] focus:outline-none";

export const CLASE_SELECT =
  "appearance-none cursor-pointer rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)] py-2 pl-3 pr-8 text-sm text-[var(--admin-texto)] focus:border-[var(--admin-primario)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-40";

export const CLASE_BOTON_PRIMARIO =
  "inline-flex items-center gap-2 rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-sm font-semibold text-[var(--admin-primario-texto)] transition hover:opacity-90 disabled:opacity-50";

export const CLASE_BOTON_OUTLINE =
  "inline-flex items-center gap-2 rounded-lg border border-[var(--admin-borde)] px-3 py-1.5 text-xs font-medium text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)] disabled:opacity-50";

export const CLASE_BOTON_ICONO =
  "inline-flex items-center justify-center rounded-lg p-2 text-[var(--admin-texto)] transition hover:bg-[var(--admin-fondo-hover)]";

export const CLASE_SUPERFICIE =
  "rounded-xl border border-[var(--admin-borde)] bg-[var(--admin-fondo-suave)]";

export function colorOpcion() {
  return { color: "var(--admin-texto)", backgroundColor: "var(--admin-fondo)" };
}
