import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { createClient } from "@/lib/supabase/client";
import { TransactionService } from '@/lib/services/transaction.service';

const prisma = new PrismaClient();
const supabase = createClient();
const transactionService = new TransactionService(prisma);

async function getUserIdFromToken(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  console.log(user);
  
  return user?.id || null;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = await getUserIdFromToken(authHeader);
    console.log(userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();

    const transaction = await transactionService.createTransaction({
      ...body,
      userId,
      categoryId: 11
    });

    console.log(transaction);
    

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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userId = await getUserIdFromToken(authHeader);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await transactionService.getTransactions(userId);
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 