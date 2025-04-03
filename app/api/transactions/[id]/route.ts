import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/transaction.service';

const transactionService = new TransactionService(prisma);

export async function DELETE(
  request: NextRequest,
) {
  try {
  const parsedId = Number(request.nextUrl.searchParams.get('id'));
    const result = await transactionService.destroy(parsedId);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete transaction' },
      { status: 500 }
    );
  }
} 

export async function PUT(
  request: NextRequest,
) {
  const parsedId = Number(request.nextUrl.searchParams.get('id'));
  const { name, amountCAD, amountUSD, date, category: categoryId, notes } = await request.json();

  const result = await transactionService.update(parsedId, { name, amountCAD, amountUSD, date, categoryId, notes });
  return NextResponse.json(result, { status: 200 });
}