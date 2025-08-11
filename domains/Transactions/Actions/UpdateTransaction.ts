import { ITransactionRepository } from '../Repositories/ITransactionRepository';
import { UpdateTransactionDTO } from '../DTOs/TransactionDTO';
import { CoreTransaction } from '../Validators/types';
import { TransactionType } from '../Entities/Transaction';

export class UpdateTransaction {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: number, data: UpdateTransactionDTO): Promise<any> {
    const updateData: Partial<CoreTransaction> = {};

    if (data.name !== undefined && data.name !== null) updateData.name = data.name;
    if (data.amountCAD !== undefined && data.amountCAD !== null) updateData.amountCAD = data.amountCAD;
    if (data.amountUSD !== undefined) updateData.amountUSD = data.amountUSD;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.type !== undefined && data.type !== null) updateData.type = data.type as TransactionType;
    if (data.categoryId !== undefined && data.categoryId !== null) updateData.categoryId = data.categoryId;
    
    const result = await this.transactionRepository.update(
      id,
      updateData
    );

    return result;
  }
} 