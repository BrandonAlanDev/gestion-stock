"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { eliminarDireccion, guardarDatosPersonales, guardarDireccion } from "@/actions/perfil/gestionar-perfil";

type Direccion = { id: string; alias: string | null; destinatario: string | null; telefono: string | null; calle: string; numero: string; piso: string | null; departamento: string | null; codigoPostal: string; localidad: string; provincia: string; referencias: string | null; esPrincipal: boolean };
type Props = { nombre: string | null; telefono: string | null; email: string; direcciones: Direccion[]; puedeVincularGoogle: boolean };
const vacia = { alias: "", destinatario: "", telefono: "", calle: "", numero: "", piso: "", departamento: "", codigoPostal: "", localidad: "", provincia: "", referencias: "", esPrincipal: false };

export default function PerfilCliente({ nombre: inicial, telefono: telefonoInicial, email, direcciones, puedeVincularGoogle }: Props) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [nombre, setNombre] = useState(inicial ?? "");
  const [telefono, setTelefono] = useState(telefonoInicial ?? "");
  const [editando, setEditando] = useState<string | null>(null);
  const [direccion, setDireccion] = useState({ ...vacia });
  const [mensaje, setMensaje] = useState<string | null>(null);
  const campo = (clave: keyof typeof vacia, etiqueta: string, obligatorio = false) => <label key={clave} className="text-sm">{etiqueta}{obligatorio ? " *" : ""}<input value={String(direccion[clave])} onChange={(evento) => setDireccion((actual) => ({ ...actual, [clave]: evento.target.value }))} required={obligatorio} className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2" /></label>;

  function ejecutar(operacion: () => Promise<{ ok: boolean; error?: string }>, alGuardar?: () => void) {
    setMensaje(null);
    iniciar(async () => {
      const resultado = await operacion();
      if (resultado.ok) { setMensaje("Cambios guardados."); alGuardar?.(); router.refresh(); }
      else setMensaje(resultado.error ?? "No se pudieron guardar los cambios.");
    });
  }

  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-8" style={{ color: "var(--texto-sobre-fondo)" }}>
    <div><h1 className="text-2xl font-bold">Mi perfil</h1><p className="mt-1 text-sm opacity-70">Tus datos y direcciones para próximas compras.</p></div>
    <Link href="/mis-pedidos" className="inline-block rounded-lg px-4 py-2 text-sm" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>Ver mis pedidos</Link>
    {mensaje && <p role="status" className="rounded-lg border p-3 text-sm">{mensaje}</p>}
    <form onSubmit={(evento) => { evento.preventDefault(); ejecutar(() => guardarDatosPersonales({ nombre, telefono })); }} className="space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Datos personales</h2>
      <p className="text-sm opacity-70">Correo: {email}</p>
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Nombre completo<input value={nombre} onChange={(evento) => setNombre(evento.target.value)} required className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2" /></label><label className="text-sm">Teléfono<input value={telefono} onChange={(evento) => setTelefono(evento.target.value)} className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2" /></label></div>
      <button disabled={pendiente} className="rounded-lg px-4 py-2 text-sm disabled:opacity-50" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>Guardar datos</button>
    </form>
    {puedeVincularGoogle && (
      <section className="space-y-3 rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Acceso a tu cuenta</h2>
        <p className="text-sm opacity-70">Vinculá Google para poder ingresar también con esa cuenta.</p>
        <button type="button" onClick={() => void signIn("google", { redirectTo: "/perfil" })} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>Vincular Google</button>
      </section>
    )}
    <section className="space-y-4"><h2 className="text-lg font-semibold">Direcciones</h2>
      {direcciones.length === 0 && <p className="text-sm opacity-70">Todavía no guardaste direcciones.</p>}
      {direcciones.map((item) => <div key={item.id} className="rounded-xl border p-4 text-sm"><div className="flex flex-wrap justify-between gap-3"><div><strong>{item.alias || item.destinatario || "Dirección"}{item.esPrincipal ? " · Principal" : ""}</strong><p className="mt-1">{item.calle} {item.numero}, {item.localidad}, {item.provincia} ({item.codigoPostal})</p></div><div className="flex gap-2"><button type="button" onClick={() => { setEditando(item.id); setDireccion({ alias: item.alias ?? "", destinatario: item.destinatario ?? "", telefono: item.telefono ?? "", calle: item.calle, numero: item.numero, piso: item.piso ?? "", departamento: item.departamento ?? "", codigoPostal: item.codigoPostal, localidad: item.localidad, provincia: item.provincia, referencias: item.referencias ?? "", esPrincipal: item.esPrincipal }); }} className="underline">Editar</button><button type="button" disabled={pendiente} onClick={() => ejecutar(() => eliminarDireccion(item.id))} className="underline">Eliminar</button></div></div></div>)}
      <form onSubmit={(evento) => { evento.preventDefault(); ejecutar(() => guardarDireccion({ id: editando ?? undefined, ...direccion }), () => { setEditando(null); setDireccion({ ...vacia }); }); }} className="space-y-4 rounded-xl border p-5">
        <h3 className="font-semibold">{editando ? "Editar dirección" : "Nueva dirección"}</h3>
        <div className="grid gap-3 sm:grid-cols-2">{campo("alias", "Alias")}{campo("destinatario", "Destinatario")}{campo("telefono", "Teléfono")}{campo("calle", "Calle", true)}{campo("numero", "Número", true)}{campo("piso", "Piso")}{campo("departamento", "Departamento")}{campo("codigoPostal", "Código postal", true)}{campo("localidad", "Localidad", true)}{campo("provincia", "Provincia", true)}{campo("referencias", "Referencias")}</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={direccion.esPrincipal} onChange={(evento) => setDireccion((actual) => ({ ...actual, esPrincipal: evento.target.checked }))} />Usar como dirección principal</label>
        <div className="flex gap-3"><button disabled={pendiente} className="rounded-lg px-4 py-2 text-sm disabled:opacity-50" style={{ backgroundColor: "var(--color-primario)", color: "var(--texto-sobre-primario)" }}>Guardar dirección</button>{editando && <button type="button" onClick={() => { setEditando(null); setDireccion({ ...vacia }); }} className="text-sm underline">Cancelar edición</button>}</div>
      </form>
    </section>
  </div>;
}
