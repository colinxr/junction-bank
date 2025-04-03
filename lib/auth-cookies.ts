import { setCookie, deleteCookie } from 'cookies-next';
import { NextApiResponse } from 'next';
import { NextRouter } from 'next/router';

// Constants
const AUTH_TOKEN_COOKIE = 'auth_token';
const AUTH_USER_COOKIE = 'auth_user';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Set authentication cookies after successful login
 */
export function setAuthCookies(
  token: string, 
  user: AuthUser,
  res?: NextApiResponse
) {
  // Options for the cookies
  const options = {
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  // Set the auth token cookie
  setCookie(AUTH_TOKEN_COOKIE, token, options);
  
  // Set the user cookie (stringify user object)
  setCookie(AUTH_USER_COOKIE, JSON.stringify(user), options);

  // If server-side (API route), also set cookies in the response
  if (res) {
    res.setHeader('Set-Cookie', [
      `${AUTH_TOKEN_COOKIE}=${token}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`,
      `${AUTH_USER_COOKIE}=${JSON.stringify(user)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    ]);
  }
}

/**
 * Clear authentication cookies on logout
 */
export function clearAuthCookies(router?: NextRouter) {
  deleteCookie(AUTH_TOKEN_COOKIE);
  deleteCookie(AUTH_USER_COOKIE);
  
  // Redirect to login page if router is provided
  if (router) {
    router.push('/login');
  }
} 