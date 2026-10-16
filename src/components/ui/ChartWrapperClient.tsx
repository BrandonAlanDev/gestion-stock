"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const ChartsWrapper = dynamic(() => import("./ChartsWrapper"), {
  ssr: false,
});

export default function GraficosEnCliente(
  propiedades: ComponentProps<typeof ChartsWrapper>,
) {
  return <ChartsWrapper {...propiedades} />;
}
