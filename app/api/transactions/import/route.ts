import { NextResponse, NextRequest } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';
import { parseFormData, readFileAsText } from '@/infrastructure/middleware/uploadMiddleware';
import { makeTransactionActions } from '@/infrastructure/container';

const transactionActions = makeTransactionActions();

export async function POST(request: NextRequest) {
  try {
    const { fields, files } = await parseFormData(request);
    const file = files.file?.[0];
    const clerkId = fields.clerkId?.[0];

    if (!file || !clerkId) {
      return NextResponse.json(
        { error: 'File and clerkId are required' },
        { status: 400 }
      );
    }

    if (!file.originalFilename?.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    const csvContent = await readFileAsText(file);

    if (!csvContent) {
      return NextResponse.json(
        { error: 'Failed to read CSV file' },
        { status: 400 }
      );
    }

    // Use the ProcessTransactionImport action to handle the entire import flow
    const result = await transactionActions.processImport.execute({
      csvContent,
      clerkId,
    });

    return NextResponse.json({
      message: 'Import completed successfully',
      data: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing transaction import:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process transaction import' },
      { status: 500 }
    );
  }
} 