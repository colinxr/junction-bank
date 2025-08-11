import { ITransactionRepository } from '../ITransactionRepository';
import { Transaction, TransactionType } from '@/domains/Transactions/Transaction';
import { TransactionCreateDTO } from '../TransactionDTO';
import { TransactionModel } from '../TransactionModel';
import { toCoreTransaction } from '../Adapters/TransactionAdapters';

import { IMonthRepository } from '@/domains/Months/IMonthRepository';
import { Month } from '@/domains/Months/Month';

import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

export class StoreTransaction {
  constructor(
    private transactionRepository: ITransactionRepository,
    private monthRepository: IMonthRepository,
    private currencyService: CurrencyService
  ) {}

  async execute(data: TransactionCreateDTO): Promise<TransactionModel> {
    // Use adapter to convert and validate DTO to CoreTransaction
    const coreTransaction = toCoreTransaction(data);
    
    const monthId = await this.getMonthId(coreTransaction.date);
    const money = await this.getCurrencyAmount(coreTransaction);

    // Pass validated data to repository
    return await this.transactionRepository.store({
      clerkId: coreTransaction.clerkId,
      name: coreTransaction.name,
      categoryId: coreTransaction.categoryId,
      notes: coreTransaction.notes,
      monthId,
      type: coreTransaction.type,
      amountCAD: money.amountCAD,
      amountUSD: money.amountUSD ?? null,
      date: coreTransaction.date
    });
  }

  private async getMonthId(transactionDate: Date): Promise<number> {
    const monthNumber = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();
    
    // Check if month exists
    const monthExists = await this.monthRepository.findByMonthAndYear(monthNumber, year);
    
    if (monthExists) {
       // Find the month to get its ID
       const monthEntity = await this.monthRepository.findByDate(monthNumber, year);
       return monthEntity!.id!;
    }

    // Create the month with required properties
    const month = Month.create({
      month: monthNumber,
      year,
      notes: undefined,
      totalIncome: 0,
      totalExpenses: 0
    });
    
    const monthEntity = await this.monthRepository.store(month);
    return monthEntity.id!;
  }

  private async getCurrencyAmount(data: { amountCAD?: number, amountUSD?: number | null }): Promise<{amountCAD: number, amountUSD: number | undefined}> {
    // Use the centralized currency service to handle conversion (USD to CAD only)
    const result = await this.currencyService.processCurrencyAmounts(
      data.amountCAD, 
      data.amountUSD ?? undefined
    );
    
    return {
      amountCAD: result.amountCAD ?? 0,
      amountUSD: result.amountUSD
    };
  }
} 