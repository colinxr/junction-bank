import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { CategoryNotFoundException, CategoryHasTransactionsException } from '../../../domain/exceptions/CategoryException';

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}
  
  async execute(id: number): Promise<void> {
    // Check if category exists
    const category = await this.categoryRepository.show(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    
    // Check if category has transactions
    const { hasTransactions, count } = await this.categoryRepository.hasTransactions(id);
    if (hasTransactions) {
      throw new CategoryHasTransactionsException(id, count);
    }
    
    // Delete the category
    await this.categoryRepository.destroy(id);
  }
} 