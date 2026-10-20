"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarTransportista } from "@/actions/pedidos/gestionar-transportistas";

type Transportista = { id?: string; nombre: string; plantillaUrl: string | null; requiereUrl: boolean; activo: boolean };

export default function FormularioTransportista({ inicial }: { inicial?: Transportista }) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [plantillaUrl, setPlantillaUrl] = useState(inicial?.plantillaUrl ?? "");
  const [requiereUrl, setRequiereUrl] = useState(inicial?.requiereUrl ?? false);
  const [activo, setActivo] = useState(inicial?.activo ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const router = useRouter();
  return <form onSubmit={(evento) => { evento.preventDefault(); iniciar(async () => {
    const resultado = await guardarTransportista({ id: inicial?.id, nombre, plantillaUrl, requiereUrl, activo });
    if (!resultado.ok) setError(resultado.error);
    else { setError(null); if (!inicial) { setNombre(""); setPlantillaUrl(""); } router.refresh(); }
  }); }} className="admin-panel space-y-3 p-5 text-sm">
    <h2 className="font-semibold">{inicial ? inicial.nombre : "Agregar transportista"}</h2>
    {error && <p role="alert" className="text-[var(--admin-peligro)]">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label>Nombre<input value={nombre} onChange={(evento) => setNombre(evento.target.value)} required maxLength={100} className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2" /></label>
      <label>URL de seguimiento con {"{codigo}"}<input value={plantillaUrl} onChange={(evento) => setPlantillaUrl(evento.target.value)} placeholder="https://ejemplo.com/seguimiento/{codigo}" className="mt-1 w-full rounded-lg border border-[var(--admin-borde)] bg-[var(--admin-fondo)] px-3 py-2" /></label>
    </div>
    <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2"><input type="checkbox" checked={requiereUrl} onChange={(evento) => setRequiereUrl(evento.target.checked)} />Exigir URL manual</label><label className="flex items-center gap-2"><input type="checkbox" checked={activo} onChange={(evento) => setActivo(evento.target.checked)} />Activo</label></div>
    <button disabled={pendiente} className="rounded-lg bg-[var(--admin-primario)] px-4 py-2 text-[var(--admin-primario-texto)] disabled:opacity-50">Guardar</button>
  </form>;
}
