import { T } from "../escuela.data";

export default function EscuelaFooter() {
  return (
    <footer className="text-center py-6 px-4" style={{ background: "#f4ffff", borderTop: "1px solid rgba(0,183,201,0.15)" }}>
      <p className="text-xs tracking-widest" style={{ color: T.textDm }}>
        NewSurfBoard — Mar del Plata
      </p>
    </footer>
  );
}
