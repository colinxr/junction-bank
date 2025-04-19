import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/middleware'

// Define route configurations
const ROUTES = {
  home: "/",
  api: "/api",
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
  protected: ["/dashboard", "/transactions", "/categories"],
  publicApi: ["/api/auth/login", "/api/auth/register", "/api/auth/logout"], // Add public API routes
};

export async function middleware(request: NextRequest) {
  // Get current pathname
  const { pathname } = request.nextUrl;

  // Create Supabase client with middleware helper
  const { supabase, response } = createClient(request)
  
  // Get the authenticated user (if any)
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user;

  // Handle API routes
  if (pathname.startsWith(ROUTES.api)) {
    return handleApiRoute(request, user, pathname);
  }
  
  // Handle frontend routes
  return handleFrontendRoute(request, response, isAuthenticated, pathname);
}

/**
 * Handle API route authentication
 */
function handleApiRoute(request: NextRequest, user: any, pathname: string) {
  // Check if the current API route is public
  const isPublicRoute = ROUTES.publicApi.some(route => pathname.startsWith(route));
  
  // Allow public routes without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Reject unauthenticated requests to protected API routes
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Attach user information to the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', user.id);
  
  // Continue with the authorized request
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

/**
 * Handle frontend route protection and redirects
 */
function handleFrontendRoute(
  request: NextRequest, 
  response: NextResponse,
  isAuthenticated: boolean,
  pathname: string
) {
  // Case 1: Protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return redirectTo(request, ROUTES.login);
  }

  // Case 2: Login page - redirect to dashboard if already authenticated
  if (pathname === ROUTES.login && isAuthenticated) {
    return redirectTo(request, ROUTES.dashboard);
  }

  // Case 3: Home page - redirect based on authentication status
  if (pathname === ROUTES.home) {
    return isAuthenticated 
      ? redirectTo(request, ROUTES.dashboard)
      : redirectTo(request, ROUTES.login);
  }

  // Default: continue with the request
  return response;
}

/**
 * Check if a path is a protected route
 */
function isProtectedRoute(pathname: string): boolean {
  return ROUTES.protected.some(route => pathname.startsWith(route));
}

/**
 * Create a redirect response to the specified path
 */
function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

// Configure matcher for middleware
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 