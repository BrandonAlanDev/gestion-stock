"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { usePageConfig } from "@/components/providers/PageConfigProvider";
import { useState } from "react";
import {
  Package,
  Tags,
  Truck,
  Ruler,
  History,
  LogOut,
  Home,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  ArrowUpDown,
  TrendingUp,
  Menu,
  X
} from "lucide-react";

function getContrastColor(hexColor: string) {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export default function Admin(){
  return (
    <>Hola Mundo</>
  );
}