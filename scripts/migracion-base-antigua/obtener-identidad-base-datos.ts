export function obtenerIdentidadBaseDatos(urlConexion: string): {
  servidor: string;
  baseDatos: string;
} {
  const url = new URL(urlConexion);
  const baseDatos = decodeURIComponent(url.pathname.replace(/^\//, "")).trim();
  if (!baseDatos) throw new Error("La URL de conexión no indica una base de datos.");
  return {
    servidor: `${url.hostname.toLowerCase()}:${url.port || "3306"}`,
    baseDatos,
  };
}
