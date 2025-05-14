import { NextResponse, NextRequest } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';
import { parseFormData, readFileAsText } from '@/infrastructure/middleware/uploadMiddleware';
import { makeTransactionUseCases } from '@/infrastructure/container';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Parse form data (handles multipart/form-data with file upload)
    const { fields, files } = await parseFormData(request);
    
    // Get CSV file
    const csvFile = files.file?.[0];
    
    if (!csvFile) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }
    
    // Read CSV content
    const csvContent = await readFileAsText(csvFile);
    
    // Extract header mapping from fields if present
    let headerMapping: { [key: string]: string } | undefined;
    if (fields.headerMapping) {
      try {
        headerMapping = JSON.parse(fields.headerMapping[0]);
      } catch (error) {
        console.error('Error parsing header mapping:', error);
      }
    }
    
    // Get transaction use cases
    const transactionUseCases = makeTransactionUseCases();
    
    // Execute import
    const result = await transactionUseCases.import.execute({
      csvContent,
      userId,
      headerMapping
    });
    
    // Return appropriate response based on import results
    if (result.successCount === 0 && result.errors && result.errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Import failed. No transactions were imported.',
        errors: result.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.successCount} transactions.`,
      failedCount: result.failedCount,
      totalCount: result.totalCount,
      errors: result.errors
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error importing transactions:', error);
    
    if (error instanceof DomainException) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to import transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 