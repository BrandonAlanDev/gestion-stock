import Badge from "@/components/ui/badge";

interface CarruselConfig {
  id: string;
  title: string | null;
}

interface ConfigEstructura {
  sectionOrder: string | null;
  carousels: CarruselConfig[];
}

function parsearOrdenSecciones(valor: string | null): string[] {
  if (!valor) return [];
  try {
    const datos: unknown = JSON.parse(valor);
    return Array.isArray(datos)
      ? datos.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export default function BloqueEstructura({
  config,
}: {
  config: ConfigEstructura | null;
}) {
  if (!config) {
    return <p className="text-sm text-[var(--admin-texto-suave)]">No se pudo cargar</p>;
  }

  const secciones = parsearOrdenSecciones(config.sectionOrder);

  const nombreSeccion = (item: string): string => {
    if (item === "featured") return "Sección destacada";
    if (item === "location") return "Ubicación";
    if (item === "hero") return "Portada";
    if (item === "banner") return "Banners";
    if (item === "cards") return "Tarjetas";
    if (item.startsWith("carousel_")) {
      const id = item.slice("carousel_".length);
      const carrusel = config.carousels.find((c) => c.id === id);
      return carrusel ? (carrusel.title || "Carrusel") : "Carrusel eliminado";
    }
    return item;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--admin-texto-suave)]">Secciones en la home</span>
        <span className="text-sm font-semibold text-[var(--admin-texto)]">{secciones.length}</span>
      </div>
      {secciones.length > 0 ? (
        <>
          <ul className="space-y-1.5">
            {secciones.slice(0, 5).map((seccion, indice) => (
              <li
                key={`${seccion}-${indice}`}
                className="flex items-center gap-2 text-xs text-[var(--admin-texto-suave)]"
              >
                <span className="text-[var(--admin-texto-suave)]">{indice + 1}.</span>
                {nombreSeccion(seccion)}
              </li>
            ))}
          </ul>
          {secciones.length > 5 && (
            <p className="text-xs text-[var(--admin-texto-suave)]">
              +{secciones.length - 5} secciones más
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--admin-texto-suave)]">Estado</span>
            <Badge variante="info">Orden personalizado</Badge>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--admin-texto-suave)]">
              Todavía no hay secciones ordenadas
            </span>
            <Badge variante="sin-configurar">Sin configurar</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--admin-texto-suave)]">Estado</span>
            <Badge variante="inactivo">Orden por defecto</Badge>
          </div>
        </>
      )}
    </>
  );
}
