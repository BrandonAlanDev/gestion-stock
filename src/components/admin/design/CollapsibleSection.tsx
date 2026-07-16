"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";
import { getContrastColor } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  primaryColor: string;
  secondaryColor: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  primaryColor,
  secondaryColor,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const textColor = getContrastColor(secondaryColor);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-[2rem] border px-8 py-6 flex items-center gap-4 hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: secondaryColor,
          color: textColor,
          borderColor: textColor + "22",
          borderBottomLeftRadius: isOpen ? "0" : undefined,
          borderBottomRightRadius: isOpen ? "0" : undefined,
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: primaryColor + "33",
            color: primaryColor,
            borderColor: primaryColor,
          }}
        >
          <Icon size={22} />
        </div>

        <div className="flex-1 text-left">
          <h2 className="text-xl font-black uppercase italic tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-xs uppercase tracking-[0.3em] font-bold mt-1"
              style={{ color: textColor + "99" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>

      {isOpen && children}
    </div>
  );
}
