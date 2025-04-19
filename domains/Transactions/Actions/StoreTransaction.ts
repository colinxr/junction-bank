import { ITransactionRepository } from '../ITransactionRepository';
import { Transaction as TransactionEntity, TransactionType } from '@/domains/Transactions/Transaction';
import { TransactionCreateDTO } from '../TransactionDTO';
import { TransactionModel } from '../TransactionModel';

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
    const transactionDate = new Date(data.date);
    
    const monthId = await this.getMonthId(transactionDate);
    const { amountCAD, amountUSD } = await this.getCurrencyAmount(data);
    
    const transaction = TransactionEntity.create({
      userId: data.userId,
      name: data.name,
      amountCAD: amountCAD!,
      amountUSD,
      categoryId: data.categoryId,
      notes: data.notes,
      type: data.type as TransactionType
    });
    
    return await this.transactionRepository.store({
      userId: transaction.userId!,
      name: transaction.name,
      amountCAD: transaction.amountCAD,
      amountUSD: transaction.amountUSD || null,
      categoryId: transaction.categoryId,
      notes: transaction.notes || null,
      type: transaction.type,
      monthId,
      date: transactionDate,
      createdAt: new Date().toISOString()
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

  private async getCurrencyAmount(data: TransactionCreateDTO): Promise<{amountCAD: number, amountUSD: number | undefined}> {
    // Use the centralized currency service to ensure both currencies
    return await this.currencyService.ensureBothCurrencies({
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD
    });
  }
} 