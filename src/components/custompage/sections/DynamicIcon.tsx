import * as LucideIcons from "lucide-react";

export default function DynamicIcon({ name, className, style }: { name?: string | null, className?: string, style?: React.CSSProperties }) {
  if (!name) return null;
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} style={style} />;
}
