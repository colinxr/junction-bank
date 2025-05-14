import { NextResponse, NextRequest } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';
import { parseFormData, readFileAsText } from '@/infrastructure/middleware/uploadMiddleware';
import { makeTransactionUseCases } from '@/infrastructure/container';
import { ImportError } from '@/domains/Transactions/TransactionImportDTO';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    console.log(userId);
    
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
    
    // Step 1: Parse and validate CSV to get valid transactions
    const {validTransactions, errors} = await transactionUseCases.import.execute({
      csvContent,
      userId,
      headerMapping
    });

    console.log(validTransactions);
    
    
    // Collect all errors
    const allErrors: ImportError[] = [...errors];
    
    // If no valid transactions, return early with errors
    if (validTransactions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Import failed. No transactions were imported.',
        errors: allErrors,
        successCount: 0,
        failedCount: allErrors.length,
        totalCount: allErrors.length
      }, { status: 400 });
    }
    
    // Step 2: Store validated transactions in batch
    const storeResult = await transactionUseCases.batchStore.execute(
      validTransactions
    );
    
    // Combine validation errors with storage errors
    storeResult.errors.forEach(error => {
      allErrors.push({
        message: error.error,
        originalData: {
          date: error.transaction.date.toISOString(),
          name: error.transaction.name,
          amount_cad: error.transaction.amountCAD?.toString() || '',
          amount_usd: error.transaction.amountUSD?.toString() || '',
          category_id: error.transaction.categoryId.toString(),
          notes: error.transaction.notes || ''
        }
      });
    });
    
    const totalCount = validTransactions.length + errors.length;
    
    // Return appropriate response
    if (storeResult.successCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Import failed. No transactions were imported.',
        errors: allErrors,
        successCount: 0,
        failedCount: errors.length,
        totalCount
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${storeResult.successCount} transactions.`,
      successCount: storeResult.successCount,
      failedCount: storeResult.failedCount + errors.length,
      totalCount,
      errors: allErrors.length > 0 ? allErrors : undefined
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