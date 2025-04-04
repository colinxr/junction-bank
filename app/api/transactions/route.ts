import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/transaction.service';

const transactionService = new TransactionService(prisma);

// Remove caching for transaction data as it changes frequently
// export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const monthId = url.searchParams.get('monthId') ? parseInt(url.searchParams.get('monthId')!) : undefined;

    const result = await transactionService.index({monthId});
    
    // Set no-cache headers to prevent stale data
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = request.headers;
    const userId = headers.get('x-user-id');

    const transaction = await transactionService.create({
      ...body,
      userId: userId,
    });

    return NextResponse.json(
      { data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 400 }
    );
  }
}