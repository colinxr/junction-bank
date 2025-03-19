import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/transactions", "/categories"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token");

  // Check if the route is protected and user is not authenticated
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !authToken) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If user is already logged in and tries to access login page, redirect to dashboard
  if (pathname === "/auth/login" && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing the root, redirect based on authentication status
  if (pathname === "/") {
    if (authToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher for middleware - it will only run on specified paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - But match /api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 