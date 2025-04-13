import { NextRequest, NextResponse } from 'next/server';
import { makeMonthUseCases, makeTransactionUseCases } from '@/infrastructure/di/container';
import { MonthMapper } from '@/infrastructure/mappers/MonthMapper';
import { DomainException } from '@/domain/exceptions/DomainException';
import { MonthNotFoundException } from '@/domain/exceptions/MonthException';
import { MonthDTO } from '@/application/dtos/month/MonthDTO';

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
    const month = await monthUseCases.show.execute(id);

    if (!month || month.id == undefined) {
      // Handle case where month exists but has no ID
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
    const { id } = await params;
    const data = await request.json();

    const month = await monthUseCases.update.execute(id, {
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
    const { id } = await params;
    await monthUseCases.delete.execute(id);

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