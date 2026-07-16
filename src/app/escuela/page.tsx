import type { Metadata } from "next";
import { T } from "./escuela.data";
import EscuelaHero from "./sections/EscuelaHero";
import EscuelaLevels from "./sections/EscuelaLevels";
import EscuelaIncludes from "./sections/EscuelaIncludes";
import EscuelaCta from "./sections/EscuelaCta";
import EscuelaFooter from "./sections/EscuelaFooter";

export const metadata: Metadata = {
  title: "NewSurfBoard — Clases de Surf en Mar del Plata",
  description: "Clases de surf para todos los niveles en Mar del Plata. Principiantes, intermedios y avanzados. Tabla y traje incluidos.",
};

export default function NewSurfBoardPage() {
  return (
    <main className="min-h-screen font-sans" style={{ background: T.bg1, color: T.text }}>
      <EscuelaHero />
      <EscuelaLevels />
      <EscuelaIncludes />
      <EscuelaCta />
      <EscuelaFooter />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </main>
  );
}
