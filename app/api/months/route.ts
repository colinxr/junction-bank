import { NextResponse, NextRequest } from 'next/server';
import { makeMonthActions } from '@/infrastructure/container';
import { MonthMapper } from '@/domains/Months/MonthMapper';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

// Create use cases through the dependency injection container
const monthActions = makeMonthActions();

export async function GET() {
  try {
    const result = await monthActions.index.execute();

    const months = result.data.map((month) => MonthMapper.toDTO(month));

    return NextResponse.json(months, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to fetch months');
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
    const month = await monthActions.store.execute({
      month: data.month,
      year: data.year,
      notes: data.notes
    });

    // Convert to DTO for response
    const monthDTO = MonthMapper.toDTO(month);

    return NextResponse.json({ data: monthDTO }, { status: 201 });
  } catch (error) {
    return ApiErrorHandler.handle(error, 'Failed to create month');
  }
} 