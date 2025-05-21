import { NextResponse } from 'next/server';
import { makeRecurringTransactionUseCases } from '@/infrastructure/container';
import { RecurringTransactionMapper } from '@/domains/RecurringTransactions/RecurringTransactionMapper';
import { DomainException } from '@/domains/Shared/DomainException';

// Create use cases through the dependency injection container
const recurringTransactionUseCases = makeRecurringTransactionUseCases();

export async function GET() {
  try {
    const result = await recurringTransactionUseCases.index.execute();

    const recurringTransactions = result.data.map((recurringTransaction) => RecurringTransactionMapper.toDTO(recurringTransaction));
    return NextResponse.json(recurringTransactions, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch recurring transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const headers = request.headers;
    const userId = headers.get('x-user-id');

    // Execute use case
    const recurringTransaction = await recurringTransactionUseCases.store.execute({
      userId: userId!,
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
    console.error('Error creating recurring transaction:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create recurring transaction' },
      { status: 500 }
    );
  }
} 