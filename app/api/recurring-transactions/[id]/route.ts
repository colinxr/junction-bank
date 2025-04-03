import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RecurringTransactionService } from '@/lib/services/recurringTransaction.service';

const recurringTransactionService = new RecurringTransactionService(prisma);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try { 
    const id = (await params).id;
    const transaction = await recurringTransactionService.show(Number(id));
    
    return NextResponse.json({ data: transaction });
  } catch (error) {
    console.error('Error fetching recurring transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch recurring transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const id = (await params).id;
    const body = await request.json();
    
    const updatedTransaction = await recurringTransactionService.edit(
      Number(id), 
      body
    );
    
    return NextResponse.json({ data: updatedTransaction });
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update recurring transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const id = (await params).id;
    const result = await recurringTransactionService.destroy(id);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete recurring transaction' },
      { status: 500 }
    );
  }
} 