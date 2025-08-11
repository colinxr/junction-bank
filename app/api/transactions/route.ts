import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionActions } from '@/infrastructure/container';
import { DomainException } from '@/domains/Shared/DomainException';
import { TransactionMapper } from '@/domains/Transactions/Adapters/TransactionMapper';

const transactionActions = makeTransactionActions();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const monthId = url.searchParams.get('monthId') ? parseInt(url.searchParams.get('monthId')!) : undefined;

    const results = await transactionActions.index.execute(monthId);

    const transactions = results.map(TransactionMapper.toDTOFromRaw);

    return NextResponse.json(transactions, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const data = await request.json();

    if (!data.name || !data.amountCAD || !data.category) {
      return NextResponse.json(
        { error: 'Name, amountCAD, and category are required' },
        { status: 400 }
      );
    }

    const transaction = await transactionActions.store.execute({
      userId,
      ...data
    });

    const transactionDTO = TransactionMapper.toDTOFromRaw(transaction);

    return NextResponse.json({ data: transactionDTO }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}