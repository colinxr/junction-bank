import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { UpdateTransactionDTO } from '../DTOs/TransactionDTO';
import { CoreTransaction } from '../Validators/types';
import { TransactionType } from '../Entities/Transaction';
import { TransactionWithCategory } from '../Validators/types';
import { cleanUpdateData } from '../../Shared/Utils/cleanUpdateData';

export class UpdateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number, data: UpdateTransactionDTO): Promise<TransactionWithCategory> {
    const updateData = cleanUpdateData(data, {
      type: (value) => value as TransactionType
    }) as Partial<CoreTransaction>;
    
    const result = await this.transactionRepository.update(
      id,
      updateData
    );

    return result;
  }
} 