import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from '@/lib/supabase/server';

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/transactions", "/categories"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

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

  // Only run this middleware for dashboard routes
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  try {
    // Get Supabase client
    const supabase = createClient();
    
    // Verify token and get user
    const { data: { user }, error } = await supabase.auth.getUser(authToken);
    
    if (error || !user) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // User is authenticated with Supabase, continue
    return NextResponse.next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
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