import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionActions } from '@/infrastructure/container';
import { TransactionMapper } from '@/domains/Transactions/Adapters/TransactionMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

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
    return ApiErrorHandler.handle(error, 'Failed to fetch transactions');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const data = await request.json();

    if (!data.name || !data.amountCAD || !data.categoryId) {
      return ApiErrorHandler.validationError('Name, amountCAD, and categoryId are required');
    }

    const transaction = await transactionActions.store.execute({
      userId,
      ...data
    });

    const transactionDTO = TransactionMapper.toDTOFromRaw(transaction);

    return NextResponse.json({ data: transactionDTO }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to create transaction');
  }
}