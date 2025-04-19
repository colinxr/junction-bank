import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/subpabase/server';
import { cookies } from 'next/headers';

// Define types
type LoginRequestBody = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    // Validate request data
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase - this will handle user existence and password validation
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Set auth cookies
    if (data.session) {
      // Set cookies
      const cookieStore = await cookies();
      
      cookieStore.set('auth_token', data.session.access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
      
      cookieStore.set('auth_user', JSON.stringify(data.user), {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    // Return session data
    return NextResponse.json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 