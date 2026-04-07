import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isGestionRoute = ["/admin", "/excepcionesLaborales", "/diaLaboral"].includes(nextUrl.pathname);
  
  const isProtectedRoute = ["/dashboard", "/turnos", "/admin", "/excepcionesLaborales", "/diaLaboral"].some((route) => 
    nextUrl.pathname.startsWith(route)
  );

  if (isApiAuthRoute) return NextResponse.next();

  // 1. .redirect
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
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
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
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