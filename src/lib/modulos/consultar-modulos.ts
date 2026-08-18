export type ModulosActivos = {
  escuelaEnabled: boolean;
  arreglosEnabled: boolean;
  personalizadoEnabled: boolean;
};

export async function consultarModulosActivos(origin: string): Promise<ModulosActivos> {
  const desactivados: ModulosActivos = {
    escuelaEnabled: false,
    arreglosEnabled: false,
    personalizadoEnabled: false,
  };
  try {
    const respuesta = await fetch(`${origin}/api/paginas-config`, { cache: "no-store" });
    if (!respuesta.ok) {
      return desactivados;
    }
    const data = (await respuesta.json()) as Partial<ModulosActivos>;
    return {
      escuelaEnabled: data.escuelaEnabled === true,
      arreglosEnabled: data.arreglosEnabled === true,
      personalizadoEnabled: data.personalizadoEnabled === true,
    };
  } catch {
    return desactivados;
  }
}
