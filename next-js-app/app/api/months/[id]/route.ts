import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    const month = await monthActions.show.execute(Number(id));

    if (!month || month.id == undefined) {
      return ApiErrorHandler.validationError('Invalid month data');
    }

    const spendingByCategory = await transactionActions.getSpendingByCategory.execute(month.id);
    const monthDTO = MonthMapper.toDTO(month);
    
    const response: MonthDetailDTO = {
      ...monthDTO,
      spendingByCategory
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch month');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const { id } = await params;
    const data = await request.json();

    const month = await monthActions.update.execute(Number(id), {
      month: data.month,
      year: data.year,
      notes: data.notes
    });

    // Convert to DTO
    const monthDTO = MonthMapper.toDTO(month);

    return NextResponse.json({ data: monthDTO });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to update month');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return ApiErrorHandler.validationError('User ID is required');
    }

    const { id } = await params;
    await monthActions.delete.execute(Number(id));

    return NextResponse.json(
      { success: true, message: 'Month deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to delete month');
  }
} 