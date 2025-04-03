import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecurringTransactionService } from '@/lib/services/recurringTransaction.service';

const recurringTransactionService = new RecurringTransactionService(prisma);

export async function GET(
  request: NextRequest,
) {
  try { 
    const parsedId = Number(request.nextUrl.searchParams.get('id'));
    const transaction = await recurringTransactionService.show(parsedId);
    
    return NextResponse.json({ data: transaction });
  } catch (error) {
    console.error('Error fetching recurring transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch recurring transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
) {
  try {
    const parsedId = Number(request.nextUrl.searchParams.get('id'));
    const body = await request.json();
    
    const updatedTransaction = await recurringTransactionService.edit(
      parsedId, 
      body
    );
    
    return NextResponse.json({ data: updatedTransaction });
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update recurring transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  try {
    const parsedId = Number(request.nextUrl.searchParams.get('id'));
    const result = await recurringTransactionService.destroy(parsedId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete recurring transaction' },
      { status: 500 }
    );
  }
} 