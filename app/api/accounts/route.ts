import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log(request);
    
    // Example: Get all accounts (would need auth in real app)
    // const accounts = await prisma.account.findMany();
    
    return NextResponse.json({ message: 'Accounts endpoint' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
    
  }
} 