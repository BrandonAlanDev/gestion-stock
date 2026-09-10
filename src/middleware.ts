import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

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
  "/admin/pageConfig",
  "/admin/productos",
  "/admin/provider",
  "/admin/sizes",
]);

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isGestionRoute = ["/dashboard", "/provider", "/sizes", "/movements"].includes(nextUrl.pathname);
  const isProtectedRoute = [].some((route) => 
    nextUrl.pathname.startsWith(route)
  );

  if (isApiAuthRoute) return NextResponse.next();

  if (isAdminRoute && !RUTAS_ADMIN_VALIDAS.has(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/404", nextUrl));
  }

  // 1. .redirect
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Lógica de ADMIN
  if (isAdminRoute || isGestionRoute) {
    if (!isLoggedIn) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }
    
    if (userRole !== "ADMIN") {
      // Redirigir si no tiene permisos
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    
    return NextResponse.next();
  }

  // 3. Protección de rutas generales
  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)",
  ],
};


//cambio