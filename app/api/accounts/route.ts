import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log(request);
    
    // Example: Get all accounts (would need auth in real app)
    // const accounts = await prisma.account.findMany();
    
    return NextResponse.json({ message: 'Accounts endpoint' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
    
  }
} 