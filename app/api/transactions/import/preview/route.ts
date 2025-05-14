import { NextResponse, NextRequest } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';
import { parseFormData, readFileAsText } from '@/lib/middleware/uploadMiddleware';
import { makeTransactionUseCases } from '@/infrastructure/di/container';
import { TransactionImportService } from '@/domains/Transactions/Services/TransactionImportService';

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
    
    // Get transaction use cases and import service
    const transactionUseCases = makeTransactionUseCases();
    const importService = transactionUseCases.import as any;
    
    // Extract the import service's parseCSV method for preview only
    const { validTransactions, errors } = await importService.transactionImportService.parseCSV(
      csvContent,
      userId,
      {
        headerMapping,
        // Don't validate categories for preview to speed up process
        validateCategories: async () => true
      }
    );
    
    // Return preview data
    return NextResponse.json({
      transactions: validTransactions,
      errors,
      totalCount: validTransactions.length + errors.length
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error previewing transactions:', error);
    
    if (error instanceof DomainException) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to preview transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 