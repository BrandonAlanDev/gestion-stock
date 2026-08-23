const FUENTES_BASE = new Set(["Outfit", "Playfair Display"]);

const enlacesCargados = new Map<string, HTMLLinkElement>();

export function aplicarTipografiaDocumento(
  principal: string,
  secundaria: string,
): void {
  const principalNormalizada = principal || "Outfit";
  const secundariaNormalizada = secundaria || "Playfair Display";

  document.documentElement.style.setProperty(
    "--fuente-principal",
    `'${principalNormalizada}', sans-serif`,
  );

  document.documentElement.style.setProperty(
    "--fuente-secundaria",
    `'${secundariaNormalizada}', serif`,
  );

  const fuentesNecesarias = new Set(
    [principalNormalizada, secundariaNormalizada].filter(
      (fuente) => !FUENTES_BASE.has(fuente),
    ),
  );

  for (const [fuente, link] of enlacesCargados) {
    if (!fuentesNecesarias.has(fuente)) {
      link.remove();
      enlacesCargados.delete(fuente);
    }
  }

  for (const fuente of fuentesNecesarias) {
    if (enlacesCargados.has(fuente)) continue;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fuente.replaceAll(" ", "+")}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
    enlacesCargados.set(fuente, link);
  }
}
