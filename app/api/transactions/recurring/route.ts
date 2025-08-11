import { NextResponse, NextRequest } from 'next/server';
import { makeRecurringTransactionActions } from '@/infrastructure/container';
import { RecurringTransactionMapper } from '@/domains/RecurringTransactions/RecurringTransactionMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const recurringTransactionActions = makeRecurringTransactionActions();

export async function GET() {
  try {
    const result = await recurringTransactionActions.index.execute();

    const recurringTransactions = result.data.map((recurringTransaction) => RecurringTransactionMapper.toDTO(recurringTransaction));
    return NextResponse.json(recurringTransactions, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch recurring transactions');
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const data = await request.json();

    // Execute use case
    const recurringTransaction = await recurringTransactionActions.store.execute({
      clerkId: userId,
      name: data.name,
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD,
      categoryId: data.categoryId,
      notes: data.notes,
      dayOfMonth: data.dayOfMonth,
      type: data.type
    });

    const recurringTransactionDTO = RecurringTransactionMapper.toDTO(recurringTransaction);

    return NextResponse.json({ data: recurringTransactionDTO }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to create recurring transaction');
  }
} 