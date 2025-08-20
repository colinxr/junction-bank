import { NextResponse, NextRequest } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';
import { parseFormData, readFileAsText } from '@/infrastructure/middleware/uploadMiddleware';
import { makeTransactionActions } from '@/infrastructure/container';

const transactionActions = makeTransactionActions();

export async function POST(request: NextRequest) {
  try {
    const { fields, files } = await parseFormData(request);
    const file = files.file?.[0];
    const clerkId = request.headers.get('x-user-id');

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

    // Use the preview action to process the CSV content
    const result = await transactionActions.preview.execute({
      csvContent,
      userId: clerkId,
    });

    return NextResponse.json({
      message: 'Preview generated successfully',
      data: result
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating preview:', error);

    if (error instanceof DomainException) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
} 