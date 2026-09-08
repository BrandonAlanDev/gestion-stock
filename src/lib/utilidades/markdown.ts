function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function convertirEnlaces(texto: string): string {
  return texto.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, texto, url) => {
    return `<a href="${escaparHtml(url)}" target="_blank" rel="noopener noreferrer">${escaparHtml(texto)}</a>`;
  });
}

export function renderMarkdown(markdown: string | null | undefined): string {
  const contenido = (markdown ?? "").trim();
  if (!contenido) return "";

  const lineas = contenido.split(/\r?\n/);
  const bloquesHtml: string[] = [];
  let enLista = false;

  for (const linea of lineas) {
    const esLista = /^\s*[-*]\s+/.test(linea);
    if (esLista) {
      if (!enLista) {
        bloquesHtml.push("<ul>");
        enLista = true;
      }
      const texto = linea.replace(/^\s*[-*]\s+/, "");
      bloquesHtml.push(`<li>${convertirEnlaces(texto.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/<u>(.+?)<\/u>/g, "<u>$1</u>"))}</li>`);
      continue;
    }
    if (enLista) {
      bloquesHtml.push("</ul>");
      enLista = false;
    }
    const textoProcesado = convertirEnlaces(
      linea
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(/<u>(.+?)<\/u>/g, "<u>$1</u>")
    );
    if (textoProcesado.trim() !== "") {
      bloquesHtml.push(`<p>${textoProcesado}</p>`);
    }
  }
  if (enLista) bloquesHtml.push("</ul>");

  return bloquesHtml.join("");
}
