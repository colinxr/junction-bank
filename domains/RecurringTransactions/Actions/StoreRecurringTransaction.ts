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
    const money = await this.getCurrencyAmount(data);
    const recurringTransaction = RecurringTransaction.create({
      ...data,
      ...money
    });

    return await this.recurringTransactionRepository.store(recurringTransaction);
  }

  private async getCurrencyAmount(data: TransactionCreateDTO): Promise<{amountCAD: number, amountUSD: number | undefined}> {
    // Use the centralized currency service to handle conversion (USD to CAD only)
    return await this.currencyService.processCurrencyAmounts(data.amountCAD, data.amountUSD);
  }
} 