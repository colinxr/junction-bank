import { TransactionImportService } from '../Services/TransactionImportService';
import { TransactionImportDTO, ImportError } from '../DTOs/TransactionImportDTO';

interface PreviewTransactionsRequest {
  csvContent: string;
  userId: string;
  headerMapping?: { [key: string]: string };
}

interface PreviewTransactionsResult {
  transactions: TransactionImportDTO[];
  errors: ImportError[];
  totalCount: number;
}

export class PreviewTransactions {
  constructor(
    private transactionImportService: TransactionImportService
  ) {}

  async execute({ csvContent, userId, headerMapping }: PreviewTransactionsRequest): Promise<PreviewTransactionsResult> {
    // Parse CSV for preview - disable category validation for speed
    const { validTransactions, errors } = await this.transactionImportService.parseCSV(
      csvContent,
      userId,
      {
        headerMapping,
        // Don't validate categories for preview to speed up process
        validateCategories: async () => []
      }
    );

    return {
      transactions: validTransactions,
      errors,
      totalCount: validTransactions.length + errors.length
    };
  }
}
