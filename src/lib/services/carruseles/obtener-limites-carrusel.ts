import type { LimitesCarrusel } from "@/lib/services/carruseles/tipos";

const LIMITES: LimitesCarrusel = { HERO: 10, BANNER: 10, CARDS: 10 };

export async function obtenerLimitesCarrusel(): Promise<LimitesCarrusel> {
  return { ...LIMITES };
}
