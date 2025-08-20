import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Define route configurations
const ROUTES = {
  home: "/",
  api: "/api",
  login: "/auth/login",
  register: "/auth/register",
  dashboard: "/dashboard",
  protected: ["/dashboard", "/transactions", "/categories"],
  publicApi: ["/api/auth/login", "/api/auth/register", "/api/auth/logout"],
};

// Create matcher for public routes
const isPublicRoute = createRouteMatcher([
  ROUTES.login,
  ROUTES.register,
  ...ROUTES.publicApi
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // E2E test bypass: when E2E_AUTH_BYPASS_USER_ID is set, skip Clerk for API routes
  if (pathname.startsWith(ROUTES.api) && process.env.E2E_AUTH_BYPASS_USER_ID) {
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', process.env.E2E_AUTH_BYPASS_USER_ID);
    return NextResponse.next({
      request: { headers: requestHeaders }
    });
  }

  // Allow public routes without protection
  if (isPublicRoute(req)) {
    // For login page - redirect to dashboard if already authenticated
    if (pathname === ROUTES.login) {
      try {
        await auth.protect();
        return redirectTo(req, ROUTES.dashboard);
      } catch {
        // Not authenticated, no redirect needed
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle home page redirects
  if (pathname === ROUTES.home) {
    try {
      await auth.protect();
      return redirectTo(req, ROUTES.dashboard);
    } catch {
      return redirectTo(req, ROUTES.login);
    }
  }

  // Protect non-public routes
  try {
    // This will throw if not authenticated
    await auth.protect();
    
    // Add user ID to headers for API routes
    if (pathname.startsWith(ROUTES.api)) {
      // After auth.protect() succeeds, we know the user is authenticated
      // Get the session claims from auth
      const { sessionClaims } = await auth();
      
      if (sessionClaims?.sub) {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('x-user-id', sessionClaims.sub);
        return NextResponse.next({
          request: { headers: requestHeaders }
        });
      }
    }
    
    // Continue with the authenticated request
    return NextResponse.next();
  } catch {
    // Check if this is an API route
    if (pathname.startsWith(ROUTES.api)) {
      return ApiErrorHandler.unauthorized();
    }
    
    // Frontend route - redirect to login
    return redirectTo(req, ROUTES.login);
  }
});

function redirectTo(request: NextRequest, path: string): NextResponse {
  return NextResponse.redirect(new URL(path, request.url));
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 