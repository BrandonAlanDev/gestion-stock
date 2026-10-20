import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import { resolverHostnameTenant } from "@/lib/tenants/resolver-hostname-tenant";

const { auth } = NextAuth(authConfig);

const RUTAS_ADMIN_VALIDAS = new Set([
  "/admin",
  "/admin/categories",
  "/admin/custom-page",
  "/admin/dashboard",
  "/admin/design",
  "/admin/design/apariencia",
  "/admin/design/apariencia/colores",
  "/admin/design/apariencia/tipografia",
  "/admin/design/apariencia/estilo",
  "/admin/design/contenido",
  "/admin/design/estructura",
  "/admin/movements",
  "/admin/orders",
  "/admin/envios",
  "/admin/transportistas",
  "/admin/pageConfig",
  "/admin/productos",
  "/admin/provider",
  "/admin/sizes",
]);

const RUTAS_GESTION = ["/dashboard", "/provider", "/sizes", "/movements"];

export default auth(async (solicitud) => {
  const hostname = resolverHostnameTenant(solicitud.headers.get("host") ?? "");
  const estaAutenticado = Boolean(
    solicitud.auth?.user?.id &&
    hostname &&
    solicitud.auth.user.tenantHost === hostname,
  );
  const rolUsuario = estaAutenticado ? solicitud.auth?.user?.role : undefined;
  const { nextUrl } = solicitud;

  const esRutaApiAutenticacion = nextUrl.pathname.startsWith("/api/auth");
  const esRutaAutenticacion = ["/login", "/register"].includes(nextUrl.pathname);
  const esRutaAdmin = nextUrl.pathname.startsWith("/admin");
  const esRutaGestion = RUTAS_GESTION.some(
    (ruta) => nextUrl.pathname === ruta || nextUrl.pathname.startsWith(`${ruta}/`),
  );

  if (esRutaApiAutenticacion) return NextResponse.next();

  const esDetallePedido = /^\/admin\/orders\/[^/]+$/.test(nextUrl.pathname);
  if (esRutaAdmin && !RUTAS_ADMIN_VALIDAS.has(nextUrl.pathname) && !esDetallePedido) {
    return NextResponse.redirect(new URL("/404", nextUrl));
  }

  if (esRutaAutenticacion) {
    const debeRecuperarSesion =
      nextUrl.searchParams.get("recuperarSesion") === "1";

    if (estaAutenticado && !debeRecuperarSesion) {
      return NextResponse.redirect(new URL(rolUsuario === "ADMIN" ? "/admin" : "/", nextUrl));
    }

    return NextResponse.next();
  }

  if (esRutaAdmin || esRutaGestion) {
    if (!estaAutenticado) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      const destino = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
      return NextResponse.redirect(new URL(destino, nextUrl));
    }

    if (esRutaAdmin && rolUsuario !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};
