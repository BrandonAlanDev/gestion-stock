import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

export default function DynamicIcon({ name, className, style }: { name?: string | null, className?: string, style?: React.CSSProperties }) {
  if (!name) return null;
  const candidato = (LucideIcons as Record<string, unknown>)[name];
  if (typeof candidato !== "function") return null;
  const IconComponent = candidato as ComponentType<LucideProps>;
  return <IconComponent className={className} style={style} />;
}
