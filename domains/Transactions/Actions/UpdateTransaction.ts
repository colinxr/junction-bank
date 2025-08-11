import { ITransactionRepository } from '../ITransactionRepository';
import { TransactionNotFoundException } from '../TransactionException';
import { UpdateTransactionDTO} from '../TransactionDTO';
import { TransactionModel } from '../TransactionModel';
import { CoreTransaction } from '../types';
import { CurrencyService } from '@/domains/Currency/Service/CurrencyService';
import { toPartialCoreTransaction } from '../Adapters/TransactionAdapters';

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

    // Use adapter to convert and validate DTO to partial CoreTransaction
    let updateData = toPartialCoreTransaction(data);

    // Handle currency conversion if amounts are being updated
    if (data.amountCAD !== undefined || data.amountUSD !== undefined) {
      const isRemovingUsd = data.amountUSD === null;
      
      if (isRemovingUsd) {
        // If explicitly removing USD amount
        updateData.amountCAD = data.amountCAD;
        updateData.amountUSD = null;
      } else {
        // Use currency service to handle amount conversion
        const result = await this.currencyService.processCurrencyAmounts(
          data.amountCAD, 
          data.amountUSD ?? undefined
        );
        
        updateData.amountCAD = result.amountCAD;
        updateData.amountUSD = result.amountUSD ?? null;
      }
    }

    // Update the transaction
    return await this.transactionRepository.update(id, updateData);
  }
} 