import { NextRequest, NextResponse } from 'next/server';
import { makeMonthActions, makeTransactionActions } from '@/infrastructure/container';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const monthActions = makeMonthActions();
const transactionActions = makeTransactionActions();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const { id } = await params;
    const monthId = Number(id);
    
    // Validate that the month exists first
    const month = await monthActions.show.execute(monthId);
    
    if (!month || month.id === undefined) {
      return ApiErrorHandler.notFound('Month not found');
    }
    
    // Fetch only the spending by category data
    const spendingByCategory = await transactionActions.getSpendingByCategory.execute(monthId);
    
    return NextResponse.json({ spendingByCategory }, {
      headers: {
        'Cache-Control': 'private, max-age=30'
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch month categories');
  }
} 