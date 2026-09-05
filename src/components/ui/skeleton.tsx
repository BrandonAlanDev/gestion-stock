"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-[var(--admin-fondo-suave)]", className)}>
      {children}
    </div>
  );
}
