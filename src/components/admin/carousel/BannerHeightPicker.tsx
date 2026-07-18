"use client";

import { getContrastColor } from "@/lib/utils";

interface BannerHeightPickerProps {
  value: number;
  onChange: (value: number) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

const PRESETS = [200, 250, 300, 350, 400, 450, 500];

export default function BannerHeightPicker({ value, onChange, primaryColor = "#06b6d4", secondaryColor = "#fafafa" }: BannerHeightPickerProps) {
  const textColor = getContrastColor(secondaryColor);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" style={{ color: textColor + "CC" }}>Altura del banner (px)</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {PRESETS.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onChange(h)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: value === h ? primaryColor : textColor + "1A",
              color: value === h ? getContrastColor(primaryColor) : textColor,
            }}
            onMouseEnter={(e) => { if (value !== h) { e.currentTarget.style.backgroundColor = primaryColor + "20"; } }}
            onMouseLeave={(e) => { if (value !== h) { e.currentTarget.style.backgroundColor = textColor + "1A"; } }}
          >
            {h}px
          </button>
        ))}
      </div>
      <input
        type="range"
        min="150"
        max="600"
        step="50"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none"
        style={{ accentColor: primaryColor, backgroundColor: textColor + "1A" }}
      />
      <p className="text-xs text-right" style={{ color: textColor + "80" }}>Actual: {value}px</p>
    </div>
  );
}
