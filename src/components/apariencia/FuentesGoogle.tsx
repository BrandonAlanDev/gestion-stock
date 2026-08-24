const FUENTES_BASE = new Set(["Outfit", "Playfair Display"]);

function fuenteValida(valor: unknown, respaldo: string): string {
  return typeof valor === "string" && valor.trim()
    ? valor.trim()
    : respaldo;
}

export default function FuentesGoogle({
  pageConfig,
}: {
  pageConfig: Record<string, unknown>;
}) {
  const principal = fuenteValida(pageConfig.fontPrimary, "Outfit");
  const secundaria = fuenteValida(
    pageConfig.fontSecondary,
    "Playfair Display",
  );

  const fuentes = Array.from(
    new Set(
      [principal, secundaria].filter(
        (fuente) => !FUENTES_BASE.has(fuente),
      ),
    ),
  );

  if (fuentes.length === 0) return null;

  const familias = fuentes
    .map(
      (fuente) =>
        `family=${fuente.replaceAll(" ", "+")}:wght@300;400;500;600;700`,
    )
    .join("&");

  return (
    <style>{`@import url('https://fonts.googleapis.com/css2?${familias}&display=swap');`}</style>
  );
}
