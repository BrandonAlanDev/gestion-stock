"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ContextoTemaAdmin,
  type TemaAdmin,
} from "@/contextos/admin/contexto-tema-admin";
import CargandoRuta from "@/components/ui/cargando-ruta";

const CLAVE_TEMA_ADMIN = "tema-admin";

export default function ProveedorTemaAdmin({
  children,
}: {
  children: ReactNode;
}) {
  const [tema, setTema] = useState<TemaAdmin | null>(null);

  useEffect(() => {
    const temaGuardado = window.localStorage.getItem(CLAVE_TEMA_ADMIN);
    setTema(temaGuardado === "oscuro" ? "oscuro" : "claro");
  }, []);

  useEffect(() => {
    if (!tema) return;
    document.documentElement.dataset.temaAdmin = tema;
    document.body.dataset.temaAdmin = tema;
    return () => {
      delete document.documentElement.dataset.temaAdmin;
      delete document.body.dataset.temaAdmin;
    };
  }, [tema]);

  const alternarTema = () => {
    setTema((temaActual) => {
      const siguienteTema = temaActual === "oscuro" ? "claro" : "oscuro";
      window.localStorage.setItem(CLAVE_TEMA_ADMIN, siguienteTema);
      return siguienteTema;
    });
  };

  if (!tema) return <CargandoRuta />;

  return (
    <ContextoTemaAdmin.Provider value={{ tema, alternarTema }}>
      <div
        className="admin-tema min-h-dvh w-full"
        data-tema-admin={tema}
      >
        {children}
      </div>
    </ContextoTemaAdmin.Provider>
  );
}
