"use client";

import type { ReactNode } from "react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";
import { cn } from "@/lib/utils";

export function Skeleton({ className, children }: { className?: string; children?: ReactNode }) {
  const paleta = useAdminPaleta();

  return (
    <div className={cn("animate-pulse rounded-md", className)} style={{ backgroundColor: paleta.fondoSuave }}>
      {children}
    </div>
  );
}
