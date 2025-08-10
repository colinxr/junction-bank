import { ImportTransactions } from './ImportTransactions';
import { BatchStoreTransactions, BatchStoreResult } from './BatchStoreTransactions';
import { ImportError } from '../TransactionImportDTO';

interface ProcessTransactionImportRequest {
  csvContent: string;
  clerkId: string;
  headerMapping?: { [key: string]: string };
}

interface ProcessTransactionImportResult {
  success: boolean;
  message: string;
  successCount: number;
  failedCount: number;
  totalCount: number;
  errors?: ImportError[];
}

export class ProcessTransactionImport {
  constructor(
    private importTransactions: ImportTransactions,
    private batchStoreTransactions: BatchStoreTransactions
  ) {}

  async execute({ csvContent, clerkId, headerMapping }: ProcessTransactionImportRequest): Promise<ProcessTransactionImportResult> {
    // Step 1: Parse and validate CSV to get valid transactions
    const { validTransactions, errors } = await this.importTransactions.execute({
      csvContent,
      clerkId,
      headerMapping
    });

    const allErrors: ImportError[] = [...errors];
    
    if (validTransactions.length === 0) {
      return {
        success: false,
        message: 'Import failed. No transactions were imported.',
        errors: allErrors,
        successCount: 0,
        failedCount: allErrors.length,
        totalCount: allErrors.length
      };
    }
    
    // Step 2: Store valid transactions in batch
    const storeResult = await this.batchStoreTransactions.execute(validTransactions);
    
    // Convert BatchStoreResult errors to ImportError format
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
    
    if (storeResult.successCount === 0) {
      return {
        success: false,
        message: 'Import failed. No transactions were imported.',
        errors: allErrors,
        successCount: 0,
        failedCount: errors.length,
        totalCount
      };
    }
    
    return {
      success: true,
      message: `Successfully imported ${storeResult.successCount} transactions.`,
      successCount: storeResult.successCount,
      failedCount: storeResult.failedCount + errors.length,
      totalCount,
      errors: allErrors.length > 0 ? allErrors : undefined
    };
  }
}
