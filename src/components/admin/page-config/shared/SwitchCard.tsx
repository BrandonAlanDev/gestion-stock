import { usePageConfig } from "@/components/providers/PageConfigProvider";

interface Props {
  title: string;
  checked: boolean;
  onChange: (
    value: boolean
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

export default function SwitchCard({
  title,
  checked,
  onChange,
}: Props) {
    const pageConfig = usePageConfig();
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`
        h-32 rounded-[2rem] border transition-all p-6 text-left

      `}
      style={checked ? {
        color: getContrastColor(pageConfig?.pageConfig?.primaryColor),
        backgroundColor: pageConfig?.pageConfig?.primaryColor.concat("44"),
        borderColor: getContrastColor(pageConfig?.pageConfig?.primaryColor)
      } : {
        color: "#222222",
        backgroundColor: "#33333333",
        borderColor: getContrastColor(pageConfig?.pageConfig?.secondaryColor)
      }}
    >
      <div className="flex flex-col h-full justify-between">
        <h3 className="text-xl font-black uppercase italic tracking-tight ">
          {title}
        </h3>

        <div
          className={`
            w-14 h-8 rounded-full p-1 transition-all
          `}
          style={checked ? {
            color: getContrastColor(pageConfig?.pageConfig?.primaryColor),
            backgroundColor: pageConfig?.pageConfig?.primaryColor,
            borderColor: getContrastColor(pageConfig?.pageConfig?.primaryColor)
          } : {
            color: "#222222",
            backgroundColor: "#33333333",
            borderColor: getContrastColor(pageConfig?.pageConfig?.secondaryColor)
          }}
        >
          <div
            className={`
              w-6 h-6 rounded-full bg-white transition-all
              ${
                checked
                  ? "translate-x-6"
                  : "translate-x-0"
              }
            `}
          />
        </div>
      </div>
    </button>
  );
}