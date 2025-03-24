import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/transaction.service';

const transactionService = new TransactionService(prisma);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await transactionService.deleteTransaction(params.id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete transaction' },
      { status: 500 }
    );
  }
} 