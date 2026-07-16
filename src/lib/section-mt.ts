export type MtValue = number | Record<string, number>;

// Section key → MtValue (number = same for all, object = discriminated by subtype)
export const SECTION_MT: Record<string, MtValue> = {
  hero: {
    default: 0,
    standard: 0,
    split: 0,
    minimal: 0,
    showcase: 10,
  },
  banner: 16,
  featured: {
    GRID: 16,
    COLLAGE: 16,
    MINIMAL: 16,
  },
  cards: 16,
  location: 16,
};

// Helper: resolve the mt value for a section + optional subtype
export function getSectionMt(section: string, subtype?: string): number {
  const value = SECTION_MT[section];
  if (value === undefined) return 0;
  if (typeof value === "number") return value;
  if (subtype && value[subtype] !== undefined) return value[subtype];
  return value.default ?? 0;
}
