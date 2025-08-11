import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params;
    const month = await monthUseCases.show.execute(Number(id));

    if (!month || month.id == undefined) {
      return NextResponse.json({ error: 'Invalid month data' }, { status: 400 });
    }

    const spendingByCategory = await transactionUseCases.getSpendingByCategory.execute(month.id);
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
    console.error('Error fetching month:', error);


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
      { error: 'Failed to fetch month' },
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

    const { id } = await params;
    const data = await request.json();

    const month = await monthUseCases.update.execute(Number(id), {
      month: data.month,
      year: data.year,
      notes: data.notes
    });

    // Convert to DTO
    const monthDTO = MonthMapper.toDTO(month);

    return NextResponse.json({ data: monthDTO });
  } catch (error) {
    console.error('Error updating month:', error);

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
      { error: 'Failed to update month' },
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

    const { id } = await params;
    await monthUseCases.delete.execute(Number(id));

    return NextResponse.json(
      { success: true, message: 'Month deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting month:', error);

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
      { error: 'Failed to delete month' },
      { status: 500 }
    );
  }
} 