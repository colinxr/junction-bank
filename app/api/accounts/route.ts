import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Example: Get all accounts (would need auth in real app)
    // const accounts = await prisma.account.findMany();
    
    return NextResponse.json({ message: 'Accounts endpoint' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 