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
      type: data.type ? RecurringTransaction.validateType(data.type) : undefined,
      ...money
    });

    return await this.recurringTransactionRepository.store(recurringTransaction);
  }

  private async getCurrencyAmount(data: CreateRecurringTransactionDTO): Promise<{amountCAD: number, amountUSD: number | undefined}> {
    // Use the centralized currency service to handle conversion (USD to CAD only)
    const currencyData = await this.currencyService.processCurrencyAmounts(
      data.amountCAD as number, 
      data.amountUSD as number
    );
    
    // Ensure amountCAD is always defined as a number
    return {
      amountCAD: currencyData.amountCAD ?? 0,
      amountUSD: currencyData.amountUSD
    };
  }
} 