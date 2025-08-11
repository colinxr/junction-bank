import { NextResponse, NextRequest } from 'next/server';
import { makeMonthActions, makeTransactionActions } from '@/infrastructure/container';
import { MonthMapper } from '@/domains/Months/MonthMapper';
import { MonthDTO } from '@/domains/Months/MonthDTO';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const monthActions = makeMonthActions();
const transactionActions = makeTransactionActions();

export interface MonthDetailDTO extends MonthDTO {
  spendingByCategory: any[];
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    // Get the latest month from the database
    const month = await monthActions.showLatest.execute();

    if (!month || month.id === undefined) {
      return ApiErrorHandler.notFound('No months found in the database');
    }

    // Get spending by category for the month
    const spendingByCategory = await transactionActions.getSpendingByCategory.execute(month.id);
    
    // Convert to DTO
    const monthDTO = MonthMapper.toDTO(month);
    
    // Combine into the response format
    const response: MonthDetailDTO = {
      ...monthDTO,
      spendingByCategory
    };
    
    // Return with short cache TTL since this is current data
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch latest month');
  }
}
