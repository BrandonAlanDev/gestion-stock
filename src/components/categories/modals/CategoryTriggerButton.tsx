"use client";

import { Edit2 } from "lucide-react";

export default function CategoryTriggerButton({
  isEdit,
  isAdmin,
  primaryColor,
  innerBg,
  overlayBorder,
  textColor,
  getContrastColor,
  onOpen,
}: {
  isEdit: boolean;
  isAdmin: boolean;
  primaryColor: string;
  innerBg: string;
  overlayBorder: string;
  textColor: string;
  getContrastColor: (hex: string) => string;
  onOpen: () => void;
}) {
  if (isEdit) {
    return (
      <button
        onClick={onOpen}
        className={isAdmin
          ? "p-2.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:text-amber-500 text-neutral-400 rounded-[1.0rem] transition-all shadow-xl"
          : "transition-all"
        }
        style={!isAdmin ? {
          padding: "10px",
          backgroundColor: innerBg,
          border: `1px solid ${overlayBorder}`,
          borderRadius: "12px",
          color: textColor,
        } : undefined}
        onMouseEnter={!isAdmin ? e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = primaryColor;
          (e.currentTarget as HTMLButtonElement).style.color = primaryColor;
        } : undefined}
        onMouseLeave={!isAdmin ? e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = overlayBorder;
          (e.currentTarget as HTMLButtonElement).style.color = textColor || '';
        } : undefined}
      >
        <Edit2 size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={onOpen}
      className={isAdmin
        ? "font-black uppercase italic tracking-tighter rounded-[1.0rem] bg-amber-500 text-black px-5 py-2.5"
        : "font-black uppercase italic tracking-tighter transition-all"
      }
      style={!isAdmin ? {
        backgroundColor: primaryColor,
        color: getContrastColor(primaryColor),
        borderRadius: "12px",
        padding: "10px 20px",
        fontSize: "13px",
        border: "none",
        cursor: "pointer",
      } : undefined}
      onMouseEnter={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.9") : undefined}
      onMouseLeave={!isAdmin ? e => ((e.currentTarget as HTMLButtonElement).style.opacity = "1") : undefined}
    >
      + Nueva Categoría
    </button>
  );
}
