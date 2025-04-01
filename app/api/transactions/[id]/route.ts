import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionService } from '@/lib/services/transaction.service';

const transactionService = new TransactionService(prisma);

export async function DELETE(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const { id } = await params;
    const parsedId = Number(id);
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
  request: Request,
  { params }: { params: { id: number } }
) {
  const { id } = await params;
  const { name, amountCAD, amountUSD, date, category: categoryId, notes } = await request.json();
  const parsedId = Number(id);

  const result = await transactionService.update(parsedId, { name, amountCAD, amountUSD, date, categoryId, notes });
  return NextResponse.json(result, { status: 200 });
}