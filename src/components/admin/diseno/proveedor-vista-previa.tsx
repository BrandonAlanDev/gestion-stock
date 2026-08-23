"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ContextoVistaPrevia,
  type DispositivoVistaPrevia,
  type EstadoVistaPrevia,
} from "./contexto-vista-previa";

export default function ProveedorVistaPrevia({
  children,
}: {
  children: React.ReactNode;
}) {
  const [estado, setEstado] = useState<EstadoVistaPrevia>({
    abierta: false,
    pagina: null,
    dispositivo: "desktop",
  });

  const abrirVistaPrevia = useCallback((pagina?: string | null) => {
    setEstado((previo) => ({
      abierta: true,
      pagina: pagina ?? null,
      dispositivo: previo.dispositivo,
    }));
  }, []);

  const cerrarVistaPrevia = useCallback(() => {
    setEstado((previo) => ({ ...previo, abierta: false }));
  }, []);

  const cambiarDispositivo = useCallback(
    (dispositivo: DispositivoVistaPrevia) => {
      setEstado((previo) => ({ ...previo, dispositivo }));
    },
    []
  );

  const valor = useMemo(
    () => ({
      ...estado,
      abrirVistaPrevia,
      cerrarVistaPrevia,
      cambiarDispositivo,
    }),
    [estado, abrirVistaPrevia, cerrarVistaPrevia, cambiarDispositivo]
  );

  return (
    <ContextoVistaPrevia.Provider value={valor}>
      {children}
    </ContextoVistaPrevia.Provider>
  );
}
