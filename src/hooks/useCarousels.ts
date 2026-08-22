import { useQuery } from "@tanstack/react-query";

type CarouselType = "HERO" | "BANNER" | "CARDS";

interface UseCarouselsOptions {
  type?: CarouselType;
  enabled?: boolean;
}

export function useCarousels(options: UseCarouselsOptions = {}) {
  const { type, enabled = true } = options;

  return useQuery({
    queryKey: ["carousels", type],
    queryFn: async () => {
      const url = type ? `/api/carousels?type=${type}` : "/api/carousels";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar carruseles");
      const data = await res.json();
      return data.data || [];
    },
    staleTime: 60_000,
    enabled,
    refetchOnWindowFocus: false,
  });
}