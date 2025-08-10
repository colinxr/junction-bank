import { NextRequest, NextResponse } from 'next/server';
import { makeMonthUseCases, makeTransactionUseCases } from '@/infrastructure/container';
import { DomainException } from '@/domains/Shared/DomainException';
import { MonthNotFoundException } from '@/domains/Months/MonthException';

// Create use cases through the dependency injection container
const monthUseCases = makeMonthUseCases();
const transactionUseCases = makeTransactionUseCases();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { id } = await params;
    const monthId = Number(id);
    
    // Validate that the month exists first
    const month = await monthUseCases.show.execute(monthId);
    
    if (!month || month.id === undefined) {
      return NextResponse.json({ error: 'Month not found' }, { status: 404 });
    }
    
    // Fetch only the spending by category data
    const spendingByCategory = await transactionUseCases.getSpendingByCategory.execute(monthId);
    
    return NextResponse.json({ spendingByCategory }, {
      headers: {
        'Cache-Control': 'private, max-age=30'
      }
    });
  } catch (error) {
    console.error('Error fetching month categories:', error);

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
      { error: 'Failed to fetch month categories' },
      { status: 500 }
    );
  }
} 