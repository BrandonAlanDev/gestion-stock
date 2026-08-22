import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface Props {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function Input({
  label,
  value,
  onChange,
}: Props) {
    const pageConfig = usePageConfig();
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.3em] font-black block mb-3"
      style={{ color: getContrastColor(pageConfig?.pageConfig?.secondaryColor)}}
      >
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={{ color: getContrastColor(pageConfig?.pageConfig?.secondaryColor),
        backgroundColor: pageConfig?.pageConfig?.primaryColor.concat("1A"),
        borderColor: getContrastColor(pageConfig?.pageConfig?.primaryColor)
        }}
        className="w-full h-14 px-5 rounded-2xl border text-sm font-bold outline-none transition-all"
      />
    </div>
  );
}