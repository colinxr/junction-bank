import { TransactionImportService } from '../Services/TransactionImportService';
import { TransactionImportDTO, TransactionImportResultDTO, ImportError } from '../TransactionImportDTO';
import { ICategoryRepository } from '@/domains/Categories/ICategoryRepository';

interface ImportTransactionsRequest {
  csvContent: string;
  userId: string;
  headerMapping?: { [key: string]: string };
}

interface ImportTransactionsResult {
  validTransactions: TransactionImportDTO[];
  errors: ImportError[];
}

export class ImportTransactions {
  constructor(
    private transactionImportService: TransactionImportService,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute({ csvContent, userId, headerMapping }: ImportTransactionsRequest): Promise<ImportTransactionsResult> {
    // Parse and validate the CSV content
    const { validTransactions, errors } = await this.transactionImportService.parseCSV(
      csvContent,
      userId,
      {
        headerMapping,
        validateCategories: this.validateCategories.bind(this)
      }
    );

    // Return valid transactions and errors
    return {
      validTransactions,
      errors
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