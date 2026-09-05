"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductsTableSkeletonProps {
  filas?: number;
}

export default function ProductsTableSkeleton({ filas = 6 }: ProductsTableSkeletonProps) {
  const paleta = useAdminPaleta();

  return (
    <div>
      {Array.from({ length: filas }).map((_, indice) => (
        <div
          key={indice}
          className="flex items-center gap-4 py-4"
          style={{ borderBottom: `1px solid ${paleta.borde}` }}
        >
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/4" />
          </div>
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
