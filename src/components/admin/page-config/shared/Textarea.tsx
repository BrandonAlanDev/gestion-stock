"use client";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#ffffff";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function Textarea({
  label,
  value,
  onChange,
  primaryColor = "#06b6d4",
  secondaryColor = "#ffffff",
}: Props) {
  const textColor = getContrastColor(secondaryColor);
  const bgColor = primaryColor + "1A";
  const borderColor = getContrastColor(primaryColor);

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black block mb-3" style={{ color: textColor }}>
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        style={{ color: textColor, backgroundColor: bgColor, borderColor }}
        className="w-full p-5 rounded-2xl border text-sm font-bold outline-none transition-all resize-none"
      />
    </div>
  );
}