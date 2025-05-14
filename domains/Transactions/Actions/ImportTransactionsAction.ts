import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionImportService } from '../Services/TransactionImportService';
import { TransactionImportResultDTO } from '../TransactionImportDTO';
import { ICategoryRepository } from '@/domains/Categories/ICategoryRepository';

interface ImportTransactionsRequest {
  csvContent: string;
  userId: string;
  headerMapping?: { [key: string]: string };
}

export class ImportTransactionsAction {
  constructor(
    private transactionRepository: ITransactionRepository,
    private transactionImportService: TransactionImportService,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute({ csvContent, userId, headerMapping }: ImportTransactionsRequest): Promise<TransactionImportResultDTO> {
    // Parse and validate the CSV content
    const { validTransactions, errors } = await this.transactionImportService.parseCSV(
      csvContent,
      userId,
      {
        headerMapping,
        validateCategories: this.validateCategories.bind(this)
      }
    );

    // If no valid transactions, return early with errors
    if (validTransactions.length === 0) {
      return {
        successCount: 0,
        failedCount: errors.length,
        totalCount: errors.length,
        errors
      };
    }

    // Import valid transactions using repository
    const importResult = await this.transactionRepository.importTransactions(validTransactions);

    // Combine validation errors with import errors
    return {
      ...importResult,
      errors: [...(importResult.errors || []), ...errors],
      totalCount: validTransactions.length + errors.length
    };
  }

  /**
   * Validate that all categories exist in the database
   */
  private async validateCategories(categoryIds: number[]): Promise<boolean[]> {
    // Check each category individually since findByIds is not available
    const results: boolean[] = [];
    
    for (const categoryId of categoryIds) {
      const category = await this.categoryRepository.show(categoryId);
      results.push(category !== null);
    }
    
    return results;
  }
} 