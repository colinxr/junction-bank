import { IRecurringTransactionRepository } from '../IRecurringTransactionRepository';
import { RecurringTransaction } from '../RecurringTransaction';
import { UpdateRecurringTransactionDTO } from '../RecurringTransactionDTO';
import { RecurringTransactionNotFoundException, RecurringTransactionAlreadyExistsException } from '../RecurringTransactionException';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';
import { TransactionType } from '../RecurringTransaction';

export class UpdateRecurringTransaction {
  constructor(
    private recurringTransactionRepository: IRecurringTransactionRepository,
    private currencyService: CurrencyService
  ) {}

  async execute(id: number, data: UpdateRecurringTransactionDTO): Promise<RecurringTransaction> {
    // Check if recurring transaction exists
    const recurringTransaction = await this.recurringTransactionRepository.show(id);
    if (!recurringTransaction) {
      throw new RecurringTransactionNotFoundException(id);
    }

    // If name is changing, check for conflicts
    if (data.name && data.name !== recurringTransaction.name) {
      const exists = await this.recurringTransactionRepository.findByName(
        data.name
      );

      if (exists) {
        throw new RecurringTransactionAlreadyExistsException(data.name);
      }
    }

    // Prepare update data
    type UpdateFields = {
      name?: string;
      categoryId?: number;
      notes?: string;
      dayOfMonth?: number;
      type?: TransactionType;
      amountCAD?: number;
      amountUSD?: number;
    };
    
    let updateData: UpdateFields = {
      name: data.name,
      categoryId: data.categoryId,
      notes: data.notes === null ? undefined : data.notes,
      dayOfMonth: data.dayOfMonth === null ? undefined : data.dayOfMonth,
      type: data.type ? RecurringTransaction.validateType(data.type) : undefined
    };

    // Handle currency conversion if needed
    if (data.amountCAD !== undefined || data.amountUSD !== undefined) {
      const isRemovingUsd = data.amountUSD === null;
      
      if (isRemovingUsd) {
        // If explicitly removing USD amount
        updateData = {
          ...updateData,
          amountCAD: data.amountCAD,
          amountUSD: undefined
        };
      } else {
        // Use currency service to handle amount conversion
        const result = await this.currencyService.processCurrencyAmounts(
          data.amountCAD as number, 
          data.amountUSD as number
        );
        
        updateData = {
          ...updateData,
          amountCAD: result.amountCAD ?? 0,
          amountUSD: result.amountUSD
        };
      }
    }

    // Update the recurring transaction
    return await this.recurringTransactionRepository.update(id, updateData as Partial<RecurringTransaction>);
  }
} 