import { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { RecurringTransaction, TransactionType } from '../RecurringTransaction';
import { CreateRecurringTransactionDTO } from '../RecurringTransactionDTO';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

export class StoreRecurringTransaction {
  constructor(
    private recurringTransactionRepository: IRecurringTransactionRepository,
    private currencyService: CurrencyService
  ) {}

  async execute(data: CreateRecurringTransactionDTO): Promise<RecurringTransaction> {
    // Handle currency conversion using the currency service
    const { amountCAD, amountUSD } = await this.currencyService.ensureBothCurrencies({
      amountCAD: data.amountCAD,
      amountUSD: data.amountUSD
    });

    const recurringTransaction = RecurringTransaction.create({
      userId: data.userId,
      name: data.name,
      amountCAD: amountCAD,
      amountUSD: amountUSD,
      categoryId: data.categoryId,
      notes: data.notes,
      dayOfMonth: data.dayOfMonth,
      type: data.type as TransactionType
    });

    return await this.recurringTransactionRepository.store(recurringTransaction);
  }
} 