import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionUseCases } from '@/infrastructure/container';
import { TransactionMapper } from '@/domains/Transactions/TransactionMapper';

const transactionUseCases = makeTransactionUseCases();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const id = (await params).id;
    await transactionUseCases.destroy.execute(Number(id));
    
    return NextResponse.json({ success: true }, { status: 200 });
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
  { params }: { params: Promise<{ id: number }> }
) {
  const id = (await params).id;
  const { name, amountCAD, amountUSD, category: categoryId, notes } = await request.json();

  const result = await transactionUseCases.update.execute(Number(id), { name, amountCAD, amountUSD, categoryId, notes });
  const transactionDTO = TransactionMapper.toDTO(result);
  return NextResponse.json(transactionDTO, { status: 200 });
}