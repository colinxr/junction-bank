import { NextResponse } from 'next/server';
import { makeMonthUseCases } from '@/infrastructure/di/container';
import { MonthMapper } from '@/infrastructure/mappers/MonthMapper';
import { DomainException } from '@/domain/exceptions/DomainException';

// Create use cases through the dependency injection container
const monthUseCases = makeMonthUseCases();

export async function GET() {
  try {
    const result = await monthUseCases.index.execute();

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching months:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch months' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Execute use case
    const month = await monthUseCases.store.execute({
      month: data.month,
      year: data.year,
      notes: data.notes
    });

    // Convert to DTO for response
    const monthDTO = MonthMapper.toDTO(month);

    return NextResponse.json({ data: monthDTO }, { status: 201 });
  } catch (error) {
    console.error('Error creating month:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create month' },
      { status: 500 }
    );
  }
} 