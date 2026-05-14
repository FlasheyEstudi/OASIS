import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas públicas que NO requieren autenticación
const publicRoutes = ["/", "/acceso/login", "/acceso/registro", "/explorar"];

// Configuración de roles y sus prefijos de ruta
const roleRoutes: Record<string, string> = {
  patient: "/dashboard/patient",
  doctor: "/dashboard/doctor",
  pharmacy_admin: "/dashboard/pharmacy",
  pharmacy_staff: "/dashboard/pharmacy",
  delivery_person: "/dashboard/delivery",
  superadmin: "/dashboard/admin",
  admin: "/dashboard/admin",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Obtener token y rol de las cookies (establecidas por el login)
  const token = request.cookies.get("oasis_token")?.value;
  const userRole = request.cookies.get("oasis_role")?.value;

  // 2. Permitir acceso a rutas públicas (incluyendo assets y api internas de next)
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    // Si ya está logueado e intenta ir a login/registro, redirigir a su dashboard
    if (token && userRole && (pathname === "/acceso/login" || pathname === "/acceso/registro")) {
      const dashboard = roleRoutes[userRole] || "/dashboard";
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
    return NextResponse.next();
  }

  // 3. Protección de /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    // Si no hay token, redirigir a login
    if (!token) {
      const loginUrl = new URL("/acceso/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 4. Verificación de Rol (RBAC)
    // Evitar que un paciente entre a /dashboard/admin, etc.
    const requiredPrefix = roleRoutes[userRole || ""];
    
    if (requiredPrefix && !pathname.startsWith(requiredPrefix)) {
      // Redirigir a su propio dashboard si intenta entrar a uno ajeno
      return NextResponse.redirect(new URL(requiredPrefix, request.url));
    }
  }

  return NextResponse.next();
}

// Limitar el middleware a las rutas relevantes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/acceso/:path*",
    "/explorar/:path*",
  ],
};
