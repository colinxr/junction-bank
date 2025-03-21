import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { TransactionService } from '@/lib/services/transaction.service';

const transactionService = new TransactionService(prisma);

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const transactions = await transactionService.getTransactions();
    
    return NextResponse.json({ data: transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const transaction = await transactionService.createTransaction({
      ...body,
      userId: user?.id,
      categoryId: 11
    });

    return NextResponse.json(
      { data: transaction },
      { status: 200 }
    );
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create transaction' },
      { status: 400 }
    );
  }
} 