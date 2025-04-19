import { NextResponse } from 'next/server';
import { createClient } from '@/infrastructure/supabase/server';
import { cookies } from 'next/headers';
import { prisma } from '@/infrastructure/prisma';
import bcrypt from 'bcryptjs';

// Define types
type RegisterRequestBody = {
  email: string;
  password: string;
};

// Salt rounds for bcrypt (10 is a good default)
const SALT_ROUNDS = 10;

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

    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user with Supabase
    const supabase = await createClient();
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (supabaseError) {
      return NextResponse.json(
        { error: supabaseError.message },
        { status: 400 }
      );
    }

    if (!supabaseData.user) {
      throw new Error('Failed to create Supabase user');
    }

    // Hash password for Prisma
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user in Prisma
    const prismaUser = await prisma.user.create({
      data: {
        id: supabaseData.user.id, // Use the same ID as Supabase
        email: email,
        passwordHash: hashedPassword,
      },
    });

    // Set auth cookies if we have a session
    if (supabaseData.session) {
      const cookieStore = await cookies();
      
      cookieStore.set('auth_token', supabaseData.session.access_token, {
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
      });
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: prismaUser.id,
        email: prismaUser.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 