import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { IMonthRepository } from '../../../domain/repositories/IMonthRepository';
import { ICurrencyConversionService } from '../../../domain/services/ICurrencyConversionService';
import { Transaction as TransactionEntity, TransactionType } from '../../../domain/entities/Transaction';
import { TransactionCreateDTO, TransactionDTO } from '../../dtos/transaction/TransactionDTO';
import { Month } from '../../../domain/entities/Month';
import { Prisma } from '@prisma/client';

export class StoreTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private monthRepository: IMonthRepository,
    private currencyService: ICurrencyConversionService
  ) {}

  async execute(data: TransactionCreateDTO): Promise<TransactionDTO> {
    // 1. Process transaction date
    const transactionDate = new Date(data.date);
    
    const monthId = await this.getMonthId(transactionDate);
    const { amountCAD, amountUSD } = await this.getCurrencyAmount(data);
    
    // 4. Create transaction entity
    const transaction = TransactionEntity.create({
      userId: data.userId,
      name: data.name,
      amountCAD: amountCAD!,
      amountUSD,
      categoryId: data.categoryId,
      notes: data.notes,
      type: data.type as TransactionType
    });
    
    // 5. Store and return transaction
    const newTransaction = await this.transactionRepository.store({
      userId: transaction.userId!,
      name: transaction.name,
      amountCAD: new Prisma.Decimal(transaction.amountCAD),
      amountUSD: transaction.amountUSD ? new Prisma.Decimal(transaction.amountUSD) : null,
      categoryId: transaction.categoryId,
      notes: transaction.notes || null,
      type: transaction.type,
      monthId,
      date: transactionDate,
      createdAt: new Date().toISOString()
    });

    // Convert directly to DTO instead of using the mapper
    return {
      id: newTransaction.id,
      userId: newTransaction.userId,
      name: newTransaction.name,
      amountCAD: Number(newTransaction.amountCAD),
      amountUSD: newTransaction.amountUSD ? Number(newTransaction.amountUSD) : undefined,
      categoryId: newTransaction.categoryId,
      categoryName: newTransaction.category,
      notes: newTransaction.notes || undefined,
      type: String(newTransaction.type),
      date: newTransaction.date.toISOString(),
      monthId: newTransaction.monthId
    };
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
    // If both amounts are provided, return them as is
    if (data.amountCAD && data.amountUSD) {
      return {
        amountCAD: data.amountCAD,
        amountUSD: data.amountUSD
      };
    }
    
    // If only CAD amount is provided, convert to USD
    if (data.amountCAD) {
      const usdMoney = await this.currencyService.convertCADtoUSD(data.amountCAD);
      return {
        amountCAD: data.amountCAD,
        amountUSD: usdMoney.amount
      };
    }
    
    // If only USD amount is provided, convert to CAD
    if (data.amountUSD) {
      const cadMoney = await this.currencyService.convertUSDtoCAD(data.amountUSD);
      return {
        amountCAD: cadMoney.amount,
        amountUSD: data.amountUSD
      };
    }
    
    // Default case (should not happen if validation is in place)
    throw new Error('Either amountCAD or amountUSD must be provided');
  }
} 