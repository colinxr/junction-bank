import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionActions } from '@/infrastructure/container';
import { TransactionMapper } from '@/domains/Transactions/Adapters/TransactionMapper';

const transactionActions = makeTransactionActions();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const result = await transactionActions.show.execute(id);
    const transactionDTO = TransactionMapper.toDTOFromRaw(result);
    return NextResponse.json(transactionDTO, { status: 200 });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const id = (await params).id;
    await transactionActions.destroy.execute(Number(id));
    
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
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const id = (await params).id;
    const { name, amountCAD, amountUSD, category: categoryId, notes } = await request.json();

    const result = await transactionActions.update.execute(Number(id), { name, amountCAD, amountUSD, categoryId, notes });
    const transactionDTO = TransactionMapper.toDTOFromRaw(result);
    return NextResponse.json(transactionDTO, { status: 200 });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update transaction' },
      { status: 500 }
    );
  }
}