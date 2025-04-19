import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionNotFoundException } from '../TransactionException';
import { UpdateTransactionDTO} from '../TransactionDTO';
import { TransactionModel } from '../TransactionModel';
import { Transaction } from '@/app/types';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';

export class UpdateTransaction {
  constructor(
    private transactionRepository: ITransactionRepository,
    private currencyService: CurrencyService
  ) {}

  async execute(id: number, data: UpdateTransactionDTO): Promise<TransactionModel> {
    // Check if transaction exists
    const transaction = await this.transactionRepository.show(id);
    if (!transaction) {
      throw new TransactionNotFoundException(id);
    }

    // Get proper currency amounts
    let updateData: Partial<Transaction> = {
      name: data.name,
      categoryId: data.categoryId,
      notes: data.notes === null ? undefined : data.notes,
      type: data.type as any
    };

    // Handle currency conversion if needed
    if (data.amountCAD !== undefined || data.amountUSD !== undefined) {
      const isRemovingUsd = data.amountUSD === null;
      
      if (isRemovingUsd) {
        // If explicitly removing USD amount
        updateData.amountCAD = data.amountCAD;
        updateData.amountUSD = undefined;
      } else {
        // Use currency service to ensure both currencies are properly converted
        const result = await this.currencyService.ensureBothCurrencies({
          amountCAD: data.amountCAD,
          amountUSD: data.amountUSD
        });
        
        updateData.amountCAD = result.amountCAD;
        updateData.amountUSD = result.amountUSD;
      }
    }

    // Update the transaction
    return await this.transactionRepository.update(id, updateData);
  }
} 