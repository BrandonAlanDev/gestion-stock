import { createContext } from "react";

export type DispositivoVistaPrevia = "desktop" | "tablet" | "mobile";

export interface EstadoVistaPrevia {
  abierta: boolean;
  pagina: string | null;
  dispositivo: DispositivoVistaPrevia;
}

export interface ContextoVistaPreviaValor extends EstadoVistaPrevia {
  abrirVistaPrevia: (pagina?: string | null) => void;
  cerrarVistaPrevia: () => void;
  cambiarDispositivo: (dispositivo: DispositivoVistaPrevia) => void;
}

export const ContextoVistaPrevia = createContext<ContextoVistaPreviaValor | null>(null);
