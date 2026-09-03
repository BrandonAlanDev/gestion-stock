"use client";

import { useEffect } from "react";

let contadorActivos = 0;
let overflowAnterior: string | null = null;
let paddingAnterior: string | null = null;

export function useBloqueoScroll(activo: boolean): void {
  useEffect(() => {
    if (!activo) return;

    const body = document.body;
    const anchoScrollbar =
      window.innerWidth - document.documentElement.clientWidth;

    if (contadorActivos === 0) {
      overflowAnterior = body.style.overflow;
      paddingAnterior = body.style.paddingRight;
      body.style.overflow = "hidden";
      if (anchoScrollbar > 0) {
        const paddingComputado = Number.parseFloat(
          window.getComputedStyle(body).paddingRight
        ) || 0;
        body.style.paddingRight = `${paddingComputado + anchoScrollbar}px`;
      }
    }
    contadorActivos += 1;

    return () => {
      contadorActivos = Math.max(0, contadorActivos - 1);
      if (contadorActivos === 0) {
        body.style.overflow = overflowAnterior ?? "";
        body.style.paddingRight = paddingAnterior ?? "";
      }
    };
  }, [activo]);
}
