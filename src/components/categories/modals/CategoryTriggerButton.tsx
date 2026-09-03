"use client";

import { Edit2 } from "lucide-react";
import { getContrastColor } from "@/lib/utils";

export default function CategoryTriggerButton({
  isEdit,
  primaryColor,
  innerBg,
  overlayBorder,
  textColor,
  onOpen,
}: {
  isEdit: boolean;
  primaryColor: string;
  innerBg: string;
  overlayBorder: string;
  textColor: string;
  onOpen: () => void;
}) {
  if (isEdit) {
    return (
      <button
        onClick={onOpen}
        className="transition-all"
        style={{
          padding: "10px",
          backgroundColor: innerBg,
          border: `1px solid ${overlayBorder}`,
          borderRadius: "12px",
          color: textColor,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = primaryColor;
          (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = overlayBorder;
          (e.currentTarget as HTMLButtonElement).style.color = textColor;
        }}
      >
        <Edit2 size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className="font-black uppercase italic tracking-tighter transition-all"
      style={{
        backgroundColor: primaryColor,
        color: getContrastColor(primaryColor),
        borderRadius: "12px",
        padding: "10px 20px",
        fontSize: "13px",
        border: "none",
        cursor: "pointer",
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
    >
      + Nueva Categoría
    </button>
  );
}
