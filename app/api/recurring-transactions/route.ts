import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecurringTransactionService } from '@/lib/services/recurringTransaction.service';

const recurringTransactionService = new RecurringTransactionService(prisma);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const result = await recurringTransactionService.index({
      page,
      limit
    });
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headers = request.headers;
    const userId = headers.get('x-user-id');

    const body = await request.json();

    const transaction = await recurringTransactionService.create({
      ...body,
      userId: userId
    });

    return NextResponse.json(
      { data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Recurring transaction creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create recurring transaction' },
      { status: 400 }
    );
  }
}