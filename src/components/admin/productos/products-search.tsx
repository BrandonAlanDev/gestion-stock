"use client";

import { useEffect, useRef, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useAdminPaleta } from "@/hooks/use-admin-paleta";

interface ProductsSearchProps {
  valor: string;
  alCambiar: (valor: string) => void;
}

export default function ProductsSearch({ valor, alCambiar }: ProductsSearchProps) {
  const paleta = useAdminPaleta();
  const [valorLocal, setValorLocal] = useState(valor);
  const [enfocado, setEnfocado] = useState(false);
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
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: paleta.textoSuave }}
      />
      <input
        type="text"
        value={valorLocal}
        onChange={(e) => manejarCambio(e.target.value)}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        placeholder="Buscar productos..."
        className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none"
        style={{
          backgroundColor: paleta.fondo,
          border: `1px solid ${enfocado ? paleta.primario : paleta.borde}`,
          color: paleta.texto,
        }}
      />
    </div>
  );
}
