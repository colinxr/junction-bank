import { NextResponse, NextRequest } from 'next/server';
import { parseFormData, readFileAsText } from '@/infrastructure/middleware/uploadMiddleware';
import { makeTransactionActions } from '@/infrastructure/container';
import { ApiErrorHandler } from '@/infrastructure/api-error-handler';

const transactionActions = makeTransactionActions();

export async function POST(request: NextRequest) {
  try {
    const { fields, files } = await parseFormData(request);
    const file = files.file?.[0];
    const clerkId = request.headers.get('x-user-id');

    console.log('got here');
    

    if (!file || !clerkId) {
      return ApiErrorHandler.validationError('File and clerkId are required');
    }

    if (!file.originalFilename?.endsWith('.csv')) {
      return ApiErrorHandler.validationError('File must be a CSV');
    }

    const csvContent = await readFileAsText(file);

    if (!csvContent) {
      return ApiErrorHandler.validationError('Failed to read CSV file');
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
    return ApiErrorHandler.handle(error, 'Failed to process transaction import');
  }
} 