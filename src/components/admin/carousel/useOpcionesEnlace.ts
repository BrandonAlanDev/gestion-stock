"use client";

import { useState, useEffect } from "react";
import { getProductsPicker } from "@/actions/home-config/getProductsPicker";
import { getCategoriesPicker } from "@/actions/home-config/getCategoriesPicker";

export function useOpcionesEnlace() {
  const [productos, setProductos] = useState<{ id: string; name: string }[]>([]);
  const [categorias, setCategorias] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let activo = true;
    Promise.all([getProductsPicker(), getCategoriesPicker()])
      .then(([productosData, categoriasData]) => {
        if (!activo) return;
        setProductos(productosData.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        setCategorias(categoriasData.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  return { productos, categorias };
}
