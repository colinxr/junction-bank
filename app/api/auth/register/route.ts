import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Define types
type RegisterRequestBody = {
  email: string;
  password: string;
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: RegisterRequestBody = await request.json();
    const { email, password } = body;

    // Validate request data
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user with Supabase
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Set auth cookies if we have a session
    if (data.session) {
      const cookieStore = await cookies();
      
      cookieStore.set('auth_token', data.session.access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: data.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 