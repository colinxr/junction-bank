import { NextResponse, NextRequest } from 'next/server';
import { makeMonthUseCases, makeTransactionUseCases } from '@/infrastructure/container';
import { MonthMapper } from '@/domains/Months/MonthMapper';
import { DomainException } from '@/domains/Shared/DomainException';
import { MonthNotFoundException } from '@/domains/Months/MonthException';
import { MonthDTO } from '@/domains/Months/MonthDTO';

// Create use cases through the dependency injection container
const monthUseCases = makeMonthUseCases();
const transactionUseCases = makeTransactionUseCases();

export interface MonthDetailDTO extends MonthDTO {
  spendingByCategory: CategorySpendingDTO[];
}

export interface CategorySpendingDTO {
  categoryId: number;
  categoryName: string;
  total: number;
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the latest month from the database
    const month = await monthUseCases.showLatest.execute();

    if (!month || month.id === undefined) {
      return NextResponse.json({ error: 'No months found in the database' }, { status: 404 });
    }

    // Get spending by category for the month
    const spendingByCategory = await transactionUseCases.getSpendingByCategory.execute(month.id);
    
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
    console.error('Error fetching latest month:', error);

    if (error instanceof MonthNotFoundException) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch latest month' },
      { status: 500 }
    );
  }
}
