export function imagenAdmiteOptimizacion(url: string): boolean {
  return (url.startsWith("/") && !url.startsWith("//")) ||
    url.startsWith("https://res.cloudinary.com/");
}
