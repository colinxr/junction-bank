import { ITransactionRepository } from "../ITransactionRepository";
import { TransactionImportDTO } from "../TransactionImportDTO";
import { TransactionModel } from "../TransactionModel";
import { CurrencyService } from "@/domains/Currency/Service/CurrencyService";
import { PrismaClient } from "@prisma/client";

interface BatchError {
  transaction: TransactionImportDTO;
  error: string;
}

export interface BatchStoreResult {
  successCount: number;
  failedCount: number;
  totalCount: number;
  errors: BatchError[];
  transactions: TransactionModel[];
}

export class BatchStoreTransactions {
  private prisma: PrismaClient;
  private BATCH_SIZE = 50; // Default batch size

  constructor(
    private transactionRepository: ITransactionRepository,
    private currencyService: CurrencyService,
    prismaClient?: PrismaClient,
    batchSize?: number
  ) {
    this.prisma = prismaClient || new PrismaClient();
    if (batchSize && batchSize > 0) {
      this.BATCH_SIZE = batchSize;
    }
  }

  async execute(
    transactions: TransactionImportDTO[]
  ): Promise<BatchStoreResult> {
    const result: BatchStoreResult = {
      successCount: 0,
      failedCount: 0,
      totalCount: transactions.length,
      errors: [],
      transactions: [],
    };

    // Process transactions in batches
    for (let i = 0; i < transactions.length; i += this.BATCH_SIZE) {
      const batch = transactions.slice(i, i + this.BATCH_SIZE);

      try {
        // Process batch within a transaction
        const batchResult = await this.processBatch(batch);

        // Update counts
        result.successCount += batchResult.successCount;
        result.failedCount += batchResult.failedCount;
        result.errors.push(...batchResult.errors);
        result.transactions.push(...batchResult.transactions);

        console.log(
          `Processed batch ${i / this.BATCH_SIZE + 1}: ${
            batchResult.successCount
          } successful, ${batchResult.failedCount} failed`
        );
      } catch (error) {
        // Handle batch-level errors
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        batch.forEach((transaction) => {
          result.errors.push({
            transaction,
            error: `Batch processing error: ${errorMessage}`,
          });
        });
        result.failedCount += batch.length;
      }
    }

    return result;
  }

  private async processBatch(
    batch: TransactionImportDTO[]
  ): Promise<BatchStoreResult> {
    const batchResult: BatchStoreResult = {
      successCount: 0,
      failedCount: 0,
      totalCount: batch.length,
      errors: [],
      transactions: [],
    };

    // Use Prisma transaction for atomicity
    await this.prisma.$transaction(async (prisma) => {
      for (const transaction of batch) {
        try {
          const money = await this.getCurrencyAmount(transaction);
          
          transaction.amountCAD = money.amountCAD ?? 0;
          transaction.amountUSD = money.amountUSD;

          // Store the transaction using repository with prismaTransaction
          const storedTransaction = await this.transactionRepository.store(
            {
              clerkId: transaction.clerkId,
              name: transaction.name,
              amountCAD: money.amountCAD,
              amountUSD: money.amountUSD,
              categoryId: transaction.categoryId,
              notes: transaction.notes,
              type: transaction.type,
              date: transaction.date,
              monthId: transaction.monthId,
            },
            prisma
          );

          console.log(storedTransaction);
          

          batchResult.successCount++;
          batchResult.transactions.push(storedTransaction);
        } catch (error) {
          batchResult.failedCount++;
          batchResult.errors.push({
            transaction,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    });

    console.log(batchResult);
    
    return batchResult;
  }

  private async getCurrencyAmount(
    data: TransactionImportDTO
  ): Promise<{ amountCAD: number; amountUSD: number | undefined }> {
    // Use the centralized currency service to handle conversion (USD to CAD only)
    const result = await this.currencyService.processCurrencyAmounts(
      data.amountCAD as number,
      data.amountUSD as number
    );

    return {
      amountCAD: result.amountCAD ?? 0,
      amountUSD: result.amountUSD,
    };
  }
}
