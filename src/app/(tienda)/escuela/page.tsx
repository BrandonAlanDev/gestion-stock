import type { Metadata } from "next";
import EscuelaHeroe from "@/components/escuela/escuela-heroe";
import EscuelaNiveles from "@/components/escuela/escuela-niveles";
import EscuelaIncluye from "@/components/escuela/escuela-incluye";
import EscuelaLlamadaAccion from "@/components/escuela/escuela-llamada-accion";
import EscuelaPie from "@/components/escuela/escuela-pie";
import { verificarModuloHabilitado } from "@/lib/modulos/verificar-modulo";

export const metadata: Metadata = {
  title: "NewSurfBoard — Clases de Surf en Mar del Plata",
  description: "Clases de surf para todos los niveles en Mar del Plata. Principiantes, intermedios y avanzados. Tabla y traje incluidos.",
};

export default async function PaginaEscuela() {
  await verificarModuloHabilitado("escuelaEnabled");
  return (
    <main className="min-h-screen" style={{ background: "var(--color-fondo-sitio)", color: "var(--texto-sobre-fondo)" }}>
      <EscuelaHeroe />
      <EscuelaNiveles />
      <EscuelaIncluye />
      <EscuelaLlamadaAccion />
      <EscuelaPie />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </main>
  );
}
