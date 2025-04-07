import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionUseCases } from '@/infrastructure/di/container';
import { DomainException } from '@/domain/exceptions/DomainException';
import { TransactionMapper } from '@/infrastructure/mappers/TransactionMapper';

const transactionUseCases = makeTransactionUseCases();

// Remove caching for transaction data as it changes frequently
// export const revalidate = 300;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const monthId = url.searchParams.get('monthId') ? parseInt(url.searchParams.get('monthId')!) : undefined;

    const result = await transactionUseCases.index.execute(monthId);
    
    // Set no-cache headers to prevent stale data
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Execute use case with input data
    const transaction = await transactionUseCases.store.execute({
      userId: data.userId,
      name: data.name,
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD,
      date: new Date(data.date),
      categoryId: data.categoryId,
      notes: data.notes,
      type: data.type
    });
    
    // Map to DTO for response
    const transactionDTO = TransactionMapper.toDTO(transaction);
    
    return NextResponse.json({ data: transactionDTO }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    if (error instanceof DomainException) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}