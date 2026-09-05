"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { CLASE_INPUT } from "@/lib/productos/estilos";

interface ProductsSearchProps {
  valor: string;
  alCambiar: (valor: string) => void;
}

export default function ProductsSearch({ valor, alCambiar }: ProductsSearchProps) {
  const [valorLocal, setValorLocal] = useState(valor);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValorLocal(valor);
  }, [valor]);

  const manejarCambio = (nuevoValor: string) => {
    setValorLocal(nuevoValor);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      alCambiar(nuevoValor);
    }, 500);
  };

  return (
    <div className="relative">
      <SearchIcon
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-texto-suave)]"
      />
      <input
        type="text"
        value={valorLocal}
        onChange={(e) => manejarCambio(e.target.value)}
        placeholder="Buscar productos..."
        className={`${CLASE_INPUT} pl-10`}
      />
    </div>
  );
}
