import { NextResponse, NextRequest } from 'next/server';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    console.log(request);
    
    // Example: Get all accounts (would need auth in real app)
    // const accounts = await prisma.account.findMany();
    
    return NextResponse.json({ message: 'Accounts endpoint' });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Server error');
  }
} 