import { NextResponse, NextRequest } from 'next/server';
import { DomainException } from '@/domains/Shared/DomainException';
import { parseFormData, readFileAsText } from '@/infrastructure/middleware/uploadMiddleware';
import { makeTransactionUseCases } from '@/infrastructure/container';

export async function POST(request: NextRequest) {
  try {
    const clerkId = request.headers.get('x-user-id');
    
    if (!clerkId) {
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
    
    // Use the ProcessTransactionImport action to handle the entire import flow
    const result = await transactionUseCases.processImport.execute({
      csvContent,
      clerkId,
      headerMapping
    });
    
    // Return appropriate response based on success
    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
    
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