export async function consultarMantenimientoActivo(origin: string): Promise<boolean> {
  try {
    const respuesta = await fetch(`${origin}/api/mantenimiento`, { cache: "no-store" });
    if (!respuesta.ok) {
      return false;
    }
    const data = (await respuesta.json()) as { activo?: unknown };
    return data.activo === true;
  } catch {
    return false;
  }
}
