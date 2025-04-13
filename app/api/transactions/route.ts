import { NextResponse, NextRequest } from 'next/server';
import { makeTransactionUseCases } from '@/infrastructure/di/container';
import { DomainException } from '@/domain/exceptions/DomainException';
import { TransactionMapper } from '../../../infrastructure/mappers/TransactionMapper';

const transactionUseCases = makeTransactionUseCases();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const monthId = url.searchParams.get('monthId') ? parseInt(url.searchParams.get('monthId')!) : undefined;

    const results = await transactionUseCases.index.execute(monthId);

    const transactions = results.map((result) => TransactionMapper.toDTO(result));
    
    // Set no-cache headers to prevent stale data
    return NextResponse.json(transactions, {
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
      date: data.date,
      categoryId: data.categoryId,
      notes: data.notes,
      type: data.type,
      monthId: data.monthId
    });

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