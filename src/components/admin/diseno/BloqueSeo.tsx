import Badge from "@/components/ui/badge";

interface ConfigSeo {
  metaTitle: string | null;
  metaDescription: string | null;
  maintenanceMode: boolean;
}

function truncar(texto: string, maximo: number): string {
  return texto.length > maximo ? `${texto.slice(0, maximo)}...` : texto;
}

export default function BloqueSeo({ config }: { config: ConfigSeo | null }) {
  function FilaSeo({
    etiqueta,
    valor,
    falta,
  }: {
    etiqueta: string;
    valor: string;
    falta?: boolean;
  }) {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--admin-texto-suave)]">{etiqueta}</span>
        <span className="flex items-center gap-2 text-right">
          <span
            className={`text-xs ${falta ? "text-[var(--admin-texto-suave)]" : "text-[var(--admin-texto)]"}`}
          >
            {valor}
          </span>
          {falta && <Badge variante="sin-configurar">Falta</Badge>}
        </span>
      </div>
    );
  }

  if (!config) {
    return <p className="text-sm text-[var(--admin-texto-suave)]">No se pudo cargar</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <FilaSeo
        etiqueta="Título"
        valor={
          config.metaTitle ? truncar(config.metaTitle, 60) : "Sin título"
        }
        falta={!config.metaTitle}
      />
      <FilaSeo
        etiqueta="Descripción"
        valor={
          config.metaDescription
            ? truncar(config.metaDescription, 120)
            : "Sin descripción"
        }
        falta={!config.metaDescription}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--admin-texto-suave)]">Estado</span>
        <Badge
          variante={
            config.metaTitle && config.metaDescription
              ? "activo"
              : "sin-configurar"
          }
        >
          {config.metaTitle && config.metaDescription
            ? "Completo"
            : "Incompleto"}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--admin-texto-suave)]">Modo mantenimiento</span>
        <Badge variante={config.maintenanceMode ? "borrador" : "info"}>
          {config.maintenanceMode ? "Activado" : "Desactivado"}
        </Badge>
      </div>
    </div>
  );
}
