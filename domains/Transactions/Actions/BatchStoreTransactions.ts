import { ITransactionRepository } from "../Repositories/ITransactionRepository";
import { TransactionImportDTO } from "../DTOs/TransactionImportDTO";
import { TransactionImportResultDTO } from "../DTOs/TransactionImportDTO";
import { CoreTransaction } from "../Validators/types";
import { TransactionType } from "../Entities/Transaction";

export class BatchStoreTransactions {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(transactions: TransactionImportDTO[]): Promise<TransactionImportResultDTO> {
    const result: TransactionImportResultDTO = {
      successCount: 0,
      failedCount: 0,
      totalCount: transactions.length,
      errors: [],
      importedTransactions: []
    };

    // Use a transaction to ensure atomicity
    try {
      await this.transactionRepository.importTransactions(transactions);
      result.successCount = transactions.length;
      result.importedTransactions = transactions;
    } catch (error) {
      result.failedCount = transactions.length;
      result.errors = [{
        row: 0,
        message: error instanceof Error ? error.message : 'Unknown error during batch import',
      }];
    }

    return result;
  }
}
