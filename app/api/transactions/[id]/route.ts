import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionUseCases } from '../../../../infrastructure/di/container';

const transactionUseCases = makeTransactionUseCases();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const id = (await params).id;
    const result = await transactionUseCases.destroy.execute(id);
    
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
  { params }: { params: Promise<{ id: number }> }
) {
  const id = (await params).id;
  const { name, amountCAD, amountUSD, category: categoryId, notes } = await request.json();

  const result = await transactionUseCases.update.execute(id, { name, amountCAD, amountUSD, categoryId, notes });
  return NextResponse.json(result, { status: 200 });
}