import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/transactions", "/categories"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create Supabase client with middleware helper
  const { supabase, response } = createClient(request)
  
  // Refresh the session
  const { data: { user } } = await supabase.auth.getUser()


  // Redirect logic based on authentication status
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If user is already logged in and tries to access login page, redirect to dashboard
  if (pathname === "/auth/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing the root, redirect based on authentication status
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Return the response with any updated cookies
  return response;
}

// Configure matcher for middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 